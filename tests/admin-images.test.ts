import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

test.use({
  baseURL: 'http://localhost:4173',
  extraHTTPHeaders: { 'Cf-Access-Jwt-Assertion': 'presence-only-not-verified' }
});

// Uses the electrical template: no other e2e file renders it, so the photo this test puts in
// local D1 cannot change what a parallel test sees. Local only: never pass --remote.
test.describe.configure({ mode: 'serial' });

const CLI_BUDGET_MS = 90_000;

function d1(args: string[]) {
  execFileSync('npx', ['wrangler', 'd1', ...args], {
    stdio: 'pipe',
    shell: process.platform === 'win32'
  });
}
function cleanup() {
  mkdirSync('test-results', { recursive: true });
  writeFileSync('test-results/admin-images.sql', "DELETE FROM template_images WHERE industry = 'electrical';");
  d1(['execute', 'vancity-prospects', '--local', '--file', 'test-results/admin-images.sql']);
}

test.beforeAll(async ({}, testInfo) => {
  testInfo.setTimeout(testInfo.timeout + CLI_BUDGET_MS);
  d1(['migrations', 'apply', 'vancity-prospects', '--local']);
  cleanup();
});
test.afterAll(async ({}, testInfo) => {
  testInfo.setTimeout(testInfo.timeout + CLI_BUDGET_MS);
  cleanup();
});

// 1x1 transparent PNG.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

test('upload to a slot shows on the showcase, and removing it restores the placeholder', async ({
  page,
  request
}) => {
  await page.goto('/admin/images');
  const slot = page.getByTestId('slot-electrical-team');
  await expect(slot).toContainText('Why choose us');
  await expect(slot).toContainText('years-in-business badge');

  await slot.locator('input[type=file]').setInputFiles({ name: 'crew.png', mimeType: 'image/png', buffer: PNG });
  await slot.getByLabel(/Description for screen readers/).fill('The Northline crew');
  await slot.getByRole('button', { name: 'Upload' }).click();
  await expect(slot.getByRole('status')).toHaveText('Saved.');
  await expect(slot.locator('img')).toHaveAttribute('src', /^\/template-media\/electrical\/team\?v=\d+$/);

  const src = await slot.locator('img').getAttribute('src');
  const res = await request.get(src!);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toBe('image/png');
  expect(Buffer.from(await res.body()).equals(PNG)).toBe(true);

  await page.goto('/p/electrical');
  const img = page.locator('.why-photo img');
  await expect(img).toHaveAttribute('alt', 'The Northline crew');
  await expect(page.locator('.why-photo span')).toHaveCount(0);

  await page.goto('/admin/images');
  await page.getByTestId('slot-electrical-team').getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByTestId('slot-electrical-team').locator('img')).toHaveCount(0);
  await page.goto('/p/electrical');
  await expect(page.locator('.why-photo img')).toHaveCount(0);
  expect((await request.get(src!)).status()).toBe(404);
});

test('rejects a non-image renamed .png and an unknown slot', async ({ page, request }) => {
  await page.goto('/admin/images');
  const slot = page.getByTestId('slot-electrical-team');
  await slot.locator('input[type=file]').setInputFiles({
    name: 'evil.png',
    mimeType: 'image/png',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')
  });
  await slot.getByRole('button', { name: 'Upload' }).click();
  await expect(slot.getByRole('alert')).toContainText('JPEG, PNG or WebP');

  expect((await request.get('/template-media/electrical/nope')).status()).toBe(404);
  expect((await request.get('/template-media/defense/team')).status()).toBe(404);
});

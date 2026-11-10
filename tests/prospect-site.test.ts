import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

// `vite preview` reaches the same local D1 state that `wrangler d1 execute --local` writes,
// so the rows below are what the /site load actually reads. Local only: never pass --remote.
function d1(sql: string) {
  // --file, not --command: a shell (needed for npx on Windows) would re-split the quotes.
  mkdirSync('test-results', { recursive: true });
  const file = 'test-results/prospect-seed.sql';
  writeFileSync(file, sql);
  execFileSync('npx', ['wrangler', 'd1', 'execute', 'vancity-prospects', '--local', '--file', file], {
    stdio: 'pipe',
    shell: process.platform === 'win32'
  });
}

const row = (
  slug: string,
  name: string,
  industry: string,
  phone: string | null,
  areas: string | null,
  archived = 0
) =>
  `INSERT OR REPLACE INTO prospects (slug, company_name, industry, city, region, phone, nearby_areas, created_at, archived) VALUES ('${slug}', '${name}', '${industry}', 'Austin', 'TX', ${phone === null ? 'NULL' : `'${phone}'`}, ${areas === null ? 'NULL' : `'${areas}'`}, 1760000000000, ${archived});`;

test.beforeAll(async ({}, testInfo) => {
  // Two `npx wrangler` round trips, which take seconds when npx and miniflare are cold.
  // Playwright counts hook time against the test budget, so give it room rather than relying
  // on the machine being warm — the same cold-run failure bit tests/admin-prospects.test.ts.
  testInfo.setTimeout(testInfo.timeout + 90_000);
  execFileSync(
    'npx',
    ['wrangler', 'd1', 'migrations', 'apply', 'vancity-prospects', '--local'],
    { stdio: 'pipe', shell: process.platform === 'win32' }
  );
  d1(
    [
      row('turk-plumbing', 'Turk Plumbing', 'plumbing', '512-555-0142', 'Round Rock,Cedar Park,Pflugerville'),
      row('turk-accounting', 'Turk Accounting', 'accounting', '512-555-0143', 'Round Rock,Cedar Park'),
      row('turk-builders', 'Turk Custom Builders', 'contractor', '512-555-0144', 'Round Rock,Cedar Park'),
      row('archived-co', 'Archived Plumbing', 'plumbing', '512-555-0100', null, 1),
      row('no-phone', 'No Phone Plumbing', 'plumbing', null, null),
      row('bad-phone', 'Bad Phone Plumbing', 'plumbing', 'call us', null),
      row('ext-phone', 'Ext Phone Plumbing', 'plumbing', 'x 123', null),
      row('odd-trade', 'Odd Trade Co', 'basket-weaving', '512-555-0111', null)
    ].join(' ')
  );
});

test('prospect subdomain renders personalized content', async ({ page }) => {
  await page.goto('http://turk-plumbing.localhost:4173/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Fast, Honest Plumbing in Austin, TX'
  );
  await expect(page.locator('.brand-name')).toContainText('Turk');
  await expect(page.locator('.towns li')).toHaveCount(3);
  await expect(page.getByText('Round Rock').first()).toBeVisible();
});

test('prospect page leaks no Vancouver defaults', async ({ page }) => {
  await page.goto('http://turk-plumbing.localhost:4173/');
  const body = await page.locator('body').innerText();
  for (const s of ['Vancouver', 'Octopus', 'Burnaby', 'PL-204871', 'Vancity'])
    expect(body).not.toContain(s);
});

test('an accounting prospect renders the accounting template', async ({ page }) => {
  await page.goto('http://turk-accounting.localhost:4173/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Clear books, lower taxes, and an accountant who actually calls back.'
  );
  await expect(page.locator('.brand-name').first()).toContainText('Turk');
  await expect(page.locator('.service')).toHaveCount(6);
  await expect(page.locator('.towns li')).toHaveCount(3);
  await expect(page.getByText('Serving Austin, Round Rock & Cedar Park').first()).toBeVisible();
  // A Texas prospect gets IRS forms and dates, not the CRA's.
  const body = await page.locator('body').innerText();
  expect(body).toContain('IRS Representation');
  expect(body).not.toContain('RRSP');
});

// A prospect row carries no licence, rating or named people, so the page must claim none.
test('accounting prospect page invents no credentials or proof', async ({ page }) => {
  await page.goto('http://turk-accounting.localhost:4173/');
  const body = await page.locator('body').innerText();
  for (const s of ['Fraser Ridge', 'Vancouver', 'Sarah Whitcomb', 'ProAdvisor', 'Vancity'])
    expect(body).not.toContain(s);
  expect(body).not.toContain('-led team');
  expect(body).not.toContain('Meet the team');
  // The sample markers are text-transform: uppercase, which innerText reflects.
  expect(body.toLowerCase()).toContain('sample review');
});

test('a contractor prospect renders the contractor template', async ({ page }) => {
  await page.goto('http://turk-builders.localhost:4173/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Custom Homes & Renovations in Austin, TX'
  );
  await expect(page.locator('.wm').first()).toContainText('Turk Custom');
  await expect(page.locator('.towns li')).toHaveCount(2);
  await expect(page.getByText('Serving Austin, Round Rock & Cedar Park').first()).toBeVisible();
  // The portal boards are there, and they say they are samples.
  await expect(page.locator('#schedule .tag')).toContainText('Sample project');
  await expect(page.locator('#budget .tag')).toContainText('Sample project');
});

// A prospect row carries no licence, rating, named people, projects or reviews, so the page
// must claim none.
test('contractor prospect page invents no credentials, projects or reviews', async ({ page }) => {
  await page.goto('http://turk-builders.localhost:4173/');
  const body = await page.locator('body').innerText();
  for (const s of ['Halden', 'North Vancouver', 'Elena', 'Cove Road', 'Vancity', 'Lic. #'])
    expect(body).not.toContain(s);
  await expect(page.locator('#work')).toHaveCount(0);
  await expect(page.locator('#reviews')).toHaveCount(0);
  await expect(page.locator('#team')).toHaveCount(0);
  await expect(page.locator('.rating')).toHaveCount(0);
  // No photograph on a prospect: the stock showcase imagery is never someone else's work.
  await expect(page.locator('img')).toHaveCount(0);
  await expect(page.locator('.hero-img')).toHaveCount(0);
});

test('any path on a prospect subdomain renders the same site', async ({ page }) => {
  const res = await page.goto('http://turk-plumbing.localhost:4173/some/deep/link');
  expect(res?.status()).toBe(200);
  await expect(page.locator('.brand-name')).toContainText('Turk');
});

test('unknown slug 404s', async ({ page }) => {
  const res = await page.goto('http://nobody-here.localhost:4173/');
  expect(res?.status()).toBe(404);
});

test('archived prospect 404s', async ({ page }) => {
  const res = await page.goto('http://archived-co.localhost:4173/');
  expect(res?.status()).toBe(404);
});

test('prospect with no phone 404s', async ({ page }) => {
  const res = await page.goto('http://no-phone.localhost:4173/');
  expect(res?.status()).toBe(404);
});

test('prospect whose phone has no digits 404s', async ({ page }) => {
  const res = await page.goto('http://bad-phone.localhost:4173/');
  expect(res?.status()).toBe(404);
});

test('prospect whose phone is only an extension 404s', async ({ page }) => {
  const res = await page.goto('http://ext-phone.localhost:4173/');
  expect(res?.status()).toBe(404);
});

test('prospect with an unknown industry is a 500', async ({ page }) => {
  const res = await page.goto('http://odd-trade.localhost:4173/');
  expect(res?.status()).toBe(500);
});

test('existing demo subdomains still work', async ({ page }) => {
  await page.goto('http://waterstcafe.localhost:4173/');
  await expect(page.locator('.demo-banner')).toBeVisible();
  await page.goto('http://alexjo.localhost:4173/');
  await expect(page.locator('.demo-banner')).toBeVisible();
});

test('/p is unaffected', async ({ page }) => {
  await page.goto('http://localhost:4173/p');
  await expect(page.locator('.brand-name')).toContainText('Octopus');
});

// The component-level leak sweep above renders PlumbingSite alone, so it can never see
// src/app.html. This reads the *document*: the server-sent HTML as a link-preview bot or a
// non-JS crawler gets it (first <title> and first description win there), and the live DOM
// after hydration (which rewrites document.title but leaves the duplicate tags in place).
async function documents(page: Page, url: string) {
  await page.goto(url);
  const served = await page.evaluate(async () => {
    const html = await (await fetch(location.href)).text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return {
      title: doc.title,
      titleCount: doc.querySelectorAll('title').length,
      description: doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
      descriptionCount: doc.querySelectorAll('meta[name="description"]').length,
      icons: [...doc.querySelectorAll('link[rel~="icon"]')].map((l) => l.getAttribute('href')),
      head: doc.head.innerHTML
    };
  });
  const live = await page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
    icons: [...document.querySelectorAll('link[rel~="icon"]')].map((l) => l.getAttribute('href'))
  }));
  return { served, live };
}

test('prospect page head is its own, with no agency title, description or icon', async ({
  page
}) => {
  const { served, live } = await documents(page, 'http://turk-plumbing.localhost:4173/');
  const title = 'Plumber in Austin, TX | 24/7 Emergency Plumbing | Turk Plumbing';

  expect(served.title).toBe(title);
  expect(served.titleCount).toBe(1);
  expect(served.description).toContain('Turk Plumbing');
  expect(served.descriptionCount).toBe(1);
  expect(live.title).toBe(title);
  expect(live.description).toContain('Turk Plumbing');

  for (const icon of [...served.icons, ...live.icons]) expect(icon).not.toContain('favicon.svg');
  expect(served.head).not.toContain('favicon.svg');
  for (const s of ['Vancity', 'Bespoke websites', 'Vancouver']) expect(served.head).not.toContain(s);
});

test('apex and demo pages still carry their own head', async ({ page }) => {
  const apex = await documents(page, 'http://localhost:4173/');
  expect(apex.served.title).toBe('Vancity Dev — Bespoke websites, made in Vancouver');
  expect(apex.served.titleCount).toBe(1);
  expect(apex.served.description).toContain('Bespoke websites');
  expect(apex.served.descriptionCount).toBe(1);
  expect(apex.served.icons).toContain('/favicon.svg');

  const demo = await documents(page, 'http://waterstcafe.localhost:4173/');
  expect(demo.served.title).not.toContain('Vancity');
  expect(demo.served.titleCount).toBe(1);
  expect(demo.served.icons).toContain('/favicon.svg');
});

test('prospect page is noindex', async ({ page }) => {
  await page.goto('http://turk-plumbing.localhost:4173/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});

// page.goto, not the `request` fixture: Chromium resolves *.localhost itself, Node's resolver
// does not on every platform (ENOTFOUND on Windows).
async function robots(page: Page, origin: string) {
  const res = await page.goto(`${origin}/robots.txt`);
  return { res, body: (await res?.text()) ?? '' };
}

test('robots.txt on a prospect host is the restrictive body, not the site HTML', async ({ page }) => {
  const { res, body } = await robots(page, 'http://turk-plumbing.localhost:4173');
  expect(res?.status()).toBe(200);
  expect(res?.headers()['content-type']).toContain('text/plain');
  expect(body).toContain('User-agent: *');
  expect(body).toContain('Disallow: /');
  expect(body).not.toContain('<');
});

test('robots.txt on an unknown subdomain is also restrictive', async ({ page }) => {
  const { body } = await robots(page, 'http://nobody-here.localhost:4173');
  expect(body).toContain('Disallow: /');
});

test('robots.txt on the apex stays permissive', async ({ page }) => {
  const { body } = await robots(page, 'http://localhost:4173');
  expect(body).toContain('User-agent: *');
  expect(body).not.toContain('Disallow: /');
});

test('robots.txt on www stays permissive', async ({ page }) => {
  const { body } = await robots(page, 'http://www.localhost:4173');
  expect(body).toContain('User-agent: *');
  expect(body).not.toContain('Disallow: /');
});

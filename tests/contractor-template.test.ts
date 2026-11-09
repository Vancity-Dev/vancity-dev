import { expect, test } from '@playwright/test';
import { contrastSweep } from './helpers/contrast';

test('/p/contractor renders the Halden & Moss showcase', async ({ page }) => {
  await page.goto('/p/contractor');
  await expect(page).toHaveTitle(
    'Custom Home Builder & Renovations in North Vancouver, BC | Halden & Moss Builders'
  );
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Custom homes you can watch come together, week by week and dollar by dollar.'
  );
  await expect(page.locator('.brand-name').first()).toContainText('Halden & Moss Builders');
  await expect(page.locator('.service-card')).toHaveCount(6);
  await expect(page.locator('.steps li')).toHaveCount(6);
  await expect(page.locator('.work')).toHaveCount(4);
  await expect(page.locator('.quote')).toHaveCount(3);
  await expect(page.locator('.faqs details')).toHaveCount(8);
  await expect(page.locator('.towns li')).toHaveCount(6);
});

test('the hero picker retitles the page and pre-fills the form', async ({ page }) => {
  await page.goto('/p/contractor');
  await page.getByRole('button', { name: 'Whole-home renovation' }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Renovating your North Vancouver home? Stay in control of time and cost.'
  );
  await expect(page.getByRole('combobox', { name: 'What are you planning?' })).toHaveValue(
    'Whole-home renovation'
  );
});

test('the schedule shows the baseline against the forecast and explains each phase', async ({
  page
}) => {
  await page.goto('/p/contractor');
  const board = page.locator('#schedule');
  await expect(board.getByText('Week 40 of 85')).toBeVisible();
  await expect(board.getByText('Sep 20, 2027').first()).toBeVisible();
  await expect(board.locator('.rows .row')).toHaveCount(11);
  await expect(board.locator('.ms li')).toHaveCount(7);

  // The in-progress phase is open by default; picking another swaps the detail panel.
  await expect(board.locator('.detail h4')).toHaveText('Roof, windows & cladding');
  await board.getByRole('button', { name: /Foundation & slab/ }).click();
  await expect(board.locator('.detail h4')).toHaveText('Foundation & slab');
  await expect(board.locator('.detail')).toContainText('Walls poured and waterproofed');

  // The baseline is a toggle.
  await expect(board.locator('.plan').first()).toBeVisible();
  await board.getByLabel('Show original plan').uncheck();
  await expect(board.locator('.plan')).toHaveCount(0);
});

test('switching the sample project updates the schedule and the budget together', async ({
  page
}) => {
  await page.goto('/p/contractor');
  await page.locator('#schedule').getByRole('button', { name: 'Heritage renovation' }).click();
  await expect(page.locator('#schedule')).toContainText('+3 wk behind');
  await expect(page.locator('#schedule .rows .row')).toHaveCount(8);
  // One state drives both sections.
  await expect(
    page.locator('#budget').getByRole('button', { name: 'Heritage renovation' })
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#budget .verdict')).toContainText('$43,000 over');
  await expect(page.locator('#budget .verdict')).toContainText('Over');
});

test('the budget states under or over in words, not just colour', async ({ page }) => {
  await page.goto('/p/contractor');
  const verdict = page.locator('#budget .verdict');
  await expect(verdict).toContainText('$27,400 under');
  await expect(page.locator('#budget tfoot')).toContainText('$27,400 under');
  await expect(page.locator('#budget tbody tr').first()).toContainText('$2,500 over');
  await expect(page.locator('#budget .tile.attention')).toContainText('+$9,200');
});

test('approving a pending change order moves the budget, and reset puts it back', async ({
  page
}) => {
  await page.goto('/p/contractor');
  const budget = page.locator('#budget');
  await expect(budget.locator('.verdict')).toContainText('$27,400 under');
  await budget.getByRole('button', { name: /Approve CO-04/ }).click();

  await expect(budget.locator('.verdict')).toContainText('$36,600 under');
  await expect(budget.locator('.tile.attention')).toHaveCount(0);
  await expect(budget.getByRole('button', { name: /Approve CO-04/ })).toHaveCount(0);
  await expect(budget.locator('.orders li').last()).toContainText('Approved');
  await expect(budget.getByRole('status')).toContainText('Triple glazing in the primary suite approved');

  await budget.getByRole('button', { name: 'Reset sample' }).click();
  await expect(budget.locator('.verdict')).toContainText('$27,400 under');
  await expect(budget.getByRole('button', { name: /Approve CO-04/ })).toBeVisible();
});

test('a change-order approval does not leak into the other sample project', async ({ page }) => {
  await page.goto('/p/contractor');
  await page.locator('#budget').getByRole('button', { name: /Approve CO-04/ }).click();
  await page.locator('#budget').getByRole('button', { name: 'Heritage renovation' }).click();
  // The renovation has its own pending order and was never touched.
  await expect(page.locator('#budget').getByRole('button', { name: /Approve CO-03/ })).toBeVisible();
  await expect(page.locator('#budget .verdict')).toContainText('$43,000 over');
});

test('the consultation form validates before it thanks you', async ({ page }) => {
  await page.goto('/p/contractor');
  await page.getByRole('button', { name: 'Request a consultation' }).click();
  await expect(page.locator('.field-err').first()).toBeVisible();
  await expect(page.locator('.form-status.is-error')).toBeVisible();

  await page.getByRole('textbox', { name: 'Your name' }).fill('Dana Reyes');
  await page.getByRole('textbox', { name: 'Email' }).fill('dana@example');
  await page.getByRole('combobox', { name: 'What are you planning?' }).selectOption('New custom home');
  await page.getByRole('button', { name: 'Request a consultation' }).click();
  await expect(page.locator('#gc-email-err')).toBeVisible();

  await page.getByRole('textbox', { name: 'Email' }).fill('dana@example.com');
  await expect(page.locator('#gc-email-err')).toHaveCount(0);
  await page.getByRole('button', { name: 'Request a consultation' }).click();
  await expect(page.locator('.thanks-head')).toContainText('Thanks, Dana');
  await expect(page.locator('.thanks-body')).toContainText('dana@example.com');
});

test('a typed phone number still has to be dialable, but a blank one is fine', async ({ page }) => {
  await page.goto('/p/contractor');
  await page.getByRole('textbox', { name: 'Your name' }).fill('Dana Reyes');
  await page.getByRole('textbox', { name: 'Email' }).fill('dana@example.com');
  await page.getByRole('combobox', { name: 'What are you planning?' }).selectOption('New custom home');
  await page.getByRole('textbox', { name: /^Phone/ }).fill('555');
  await page.getByRole('button', { name: 'Request a consultation' }).click();
  await expect(page.locator('#gc-phone-err')).toBeVisible();
  await expect(page.locator('.thanks-head')).toHaveCount(0);

  await page.getByRole('textbox', { name: /^Phone/ }).fill('');
  await page.getByRole('button', { name: 'Request a consultation' }).click();
  await expect(page.locator('.thanks-head')).toBeVisible();
});

test('/p/contractor has no failing-contrast links or buttons', async ({ page }) => {
  await page.goto('/p/contractor');
  expect(await page.evaluate(contrastSweep)).toEqual([]);
});

test('/p/contractor works and passes contrast at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/p/contractor');
  const burger = page.getByRole('button', { name: 'Open menu' });
  await expect(burger).toHaveAttribute('aria-expanded', 'false');
  await burger.click();
  await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
  await expect(page.getByLabel('Main').getByRole('link', { name: 'Your budget' })).toBeVisible();
  expect(await page.evaluate(contrastSweep)).toEqual([]);
});

// The budget table is the widest thing on the page. At phone width the variance column, the
// one that says over or under, must stay on screen without sideways scrolling.
for (const width of [360, 390]) {
  test(`no horizontal scroll, and the variance stays visible, at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 780 });
    await page.goto('/p/contractor');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);

    const chip = page.locator('#budget tfoot .chip');
    await chip.scrollIntoViewIfNeeded();
    const box = await chip.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
  });
}

test('/p is unaffected by the contractor template', async ({ page }) => {
  await page.goto('/p');
  await expect(page.locator('.brand-name')).toContainText('Octopus');
});

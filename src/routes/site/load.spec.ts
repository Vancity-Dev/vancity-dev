// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { load } from './+page.server';

// A D1 stand-in whose first() resolves to a fixed row (or rejects), enough for
// getProspectBySlug. The load never touches anything else on the binding.
function platformWith(first: () => Promise<unknown>) {
  return {
    env: {
      DB: {
        prepare() {
          return { bind: () => ({ first }) };
        }
      }
    }
  };
}

const row = {
  slug: 'turk-plumbing',
  company_name: 'Turk Plumbing',
  industry: 'plumbing',
  city: 'Austin',
  region: 'TX',
  phone: '512-555-0142',
  nearby_areas: 'Round Rock,Cedar Park',
  created_at: 1,
  archived: 0
};

// The load only reads locals and platform, so the rest of the event is left out.
function run(siteSlug: string | undefined, platform: unknown) {
  return load({ locals: { siteSlug }, platform } as never) as Promise<{
    industry: string;
    content: { heroHeadline: string };
  }>;
}

async function statusOf(promise: Promise<unknown>): Promise<number | undefined> {
  try {
    await promise;
  } catch (e) {
    return (e as { status?: number }).status;
  }
  return undefined;
}

describe('/site load', () => {
  it('renders content derived from the row', async () => {
    const data = await run('turk-plumbing', platformWith(async () => row));
    expect(data.industry).toBe('plumbing');
    expect(data.content.heroHeadline).toBe('Fast, Honest Plumbing in Austin, TX');
  });

  it('renders the accounting template for an accounting row', async () => {
    const data = await run(
      'turk-accounting',
      platformWith(async () => ({ ...row, industry: 'accounting', company_name: 'Turk Accounting' }))
    );
    expect(data.industry).toBe('accounting');
    expect(data.content.heroHeadline).toBe(
      'Clear books, lower taxes, and an accountant who actually calls back.'
    );
  });

  it('renders the contractor template for a contractor row', async () => {
    const data = await run(
      'turk-builders',
      platformWith(async () => ({ ...row, industry: 'contractor', company_name: 'Turk Custom Builders' }))
    );
    expect(data.industry).toBe('contractor');
    expect(data.content.heroHeadline).toBe('Custom Homes & Renovations in Austin, TX');
  });

  it('is a 503, not a rendered page, when the D1 call throws', async () => {
    const platform = {
      env: {
        DB: {
          prepare() {
            throw new Error('D1 down');
          }
        }
      }
    };
    expect(await statusOf(run('turk-plumbing', platform))).toBe(503);
  });

  it('is a 503 when the D1 query rejects', async () => {
    const platform = platformWith(async () => {
      throw new Error('D1 down');
    });
    expect(await statusOf(run('turk-plumbing', platform))).toBe(503);
  });

  it('is a 503 when there is no DB binding', async () => {
    expect(await statusOf(run('turk-plumbing', undefined))).toBe(503);
  });

  it('404s without a slug', async () => {
    expect(await statusOf(run(undefined, platformWith(async () => row)))).toBe(404);
  });

  it('404s a missing row', async () => {
    expect(await statusOf(run('nobody', platformWith(async () => null)))).toBe(404);
  });

  it.each([null, '', 'call us'])('404s a row whose phone is %j', async (phone) => {
    expect(await statusOf(run('turk-plumbing', platformWith(async () => ({ ...row, phone }))))).toBe(
      404
    );
  });

  // The renderer strips a trailing extension before dialling, so these have no number left.
  // They contain a digit, which is all the old gate asked for.
  it.each(['x 123', 'ext. 12', '#5'])(
    '404s a row whose phone is only an extension, %j',
    async (phone) => {
      expect(
        await statusOf(run('turk-plumbing', platformWith(async () => ({ ...row, phone }))))
      ).toBe(404);
    }
  );

  it('is a 500 for an industry with no template', async () => {
    const platform = platformWith(async () => ({ ...row, industry: 'basket-weaving' }));
    expect(await statusOf(run('turk-plumbing', platform))).toBe(500);
  });

  it('does not treat inherited object keys as industries', async () => {
    const platform = platformWith(async () => ({ ...row, industry: 'constructor' }));
    expect(await statusOf(run('turk-plumbing', platform))).toBe(500);
  });
});

import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { industries } from '$lib/templates';
import type { IndustryKey } from '$lib/prospects/types';
import {
  MAX_PHOTO_BYTES,
  hasPhotoSlot,
  photoSlots,
  sniffImageType
} from '$lib/templates/photos';
import {
  deletePhoto,
  listPhotos,
  photoUrl,
  putPhoto,
  setPhotoAlt
} from '$lib/templates/photos-db';

const PREVIEW: Record<IndustryKey, string> = {
  plumbing: '/p',
  defense: '/p/defense',
  electrical: '/p/electrical',
  accounting: '/p/accounting'
};

export const load: PageServerLoad = async ({ platform }) => {
  const db = platform?.env?.DB;
  if (!db) error(503, 'The database is not available.');

  const keys = Object.keys(industries) as IndustryKey[];
  let templates;
  try {
    templates = await Promise.all(
      keys.map(async (key) => {
        const stored = new Map((await listPhotos(db, key)).map((p) => [p.slot, p]));
        return {
          key,
          label: industries[key].label,
          preview: PREVIEW[key],
          slots: photoSlots[key].map((slot) => {
            const p = stored.get(slot.key);
            return {
              ...slot,
              photo: p ? { src: photoUrl(key, slot.key, p.updatedAt), alt: p.alt } : null
            };
          })
        };
      })
    );
  } catch {
    // Most likely migration 0002 has not been applied to this database.
    error(503, 'Could not read the images table. Has migration 0002 been applied?');
  }
  return { templates };
};

function target(data: FormData) {
  const industry = String(data.get('industry') ?? '');
  const slot = String(data.get('slot') ?? '');
  return hasPhotoSlot(industry, slot) ? { industry, slot } : null;
}

const cleanAlt = (v: FormDataEntryValue | null) => String(v ?? '').trim().slice(0, 200);

export const actions = {
  upload: async ({ request, platform }) => {
    const data = await request.formData();
    const t = target(data);
    if (!t) return fail(400, { message: 'Unknown template slot.' });
    const where = `${t.industry}/${t.slot}`;

    const db = platform?.env?.DB;
    if (!db) return fail(503, { slot: where, message: 'The database is not available. Nothing was saved.' });

    const file = data.get('photo');
    if (!(file instanceof File) || file.size === 0) {
      return fail(400, { slot: where, message: 'Choose a photo first.' });
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return fail(413, {
        slot: where,
        message: `That file is ${(file.size / 1e6).toFixed(1)} MB. The limit is ${MAX_PHOTO_BYTES / 1e6} MB: export it smaller (about 1600 px wide is plenty).`
      });
    }
    const bytes = await file.arrayBuffer();
    const type = sniffImageType(new Uint8Array(bytes));
    if (!type) return fail(415, { slot: where, message: 'Use a JPEG, PNG or WebP photo.' });

    try {
      await putPhoto(db, t.industry, t.slot, type, bytes, cleanAlt(data.get('alt')));
    } catch {
      return fail(500, { slot: where, message: 'Could not save the photo. Try again.' });
    }
    return { slot: where, saved: true };
  },

  alt: async ({ request, platform }) => {
    const data = await request.formData();
    const t = target(data);
    if (!t) return fail(400, { message: 'Unknown template slot.' });
    const db = platform?.env?.DB;
    if (!db) return fail(503, { message: 'The database is not available. Nothing changed.' });
    try {
      await setPhotoAlt(db, t.industry, t.slot, cleanAlt(data.get('alt')));
    } catch {
      return fail(500, { slot: `${t.industry}/${t.slot}`, message: 'Could not save the description.' });
    }
    return { slot: `${t.industry}/${t.slot}`, saved: true };
  },

  remove: async ({ request, platform }) => {
    const data = await request.formData();
    const t = target(data);
    if (!t) return fail(400, { message: 'Unknown template slot.' });
    const db = platform?.env?.DB;
    if (!db) return fail(503, { message: 'The database is not available. Nothing changed.' });
    try {
      await deletePhoto(db, t.industry, t.slot);
    } catch {
      return fail(500, { slot: `${t.industry}/${t.slot}`, message: 'Could not remove the photo.' });
    }
    return { slot: `${t.industry}/${t.slot}`, removed: true };
  }
} satisfies Actions;

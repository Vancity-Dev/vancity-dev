import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasPhotoSlot } from '$lib/templates/photos';
import { getPhotoData } from '$lib/templates/photos-db';

// Public on purpose: the photos are part of the sites. The ?v= on the URL is the upload time, so
// a replaced photo gets a new URL and the old one can be cached for good.
export const GET: RequestHandler = async ({ params, platform }) => {
  if (!hasPhotoSlot(params.industry, params.slot)) error(404, 'Not found');
  const db = platform?.env?.DB;
  if (!db) error(503, 'Unavailable');

  let photo;
  try {
    photo = await getPhotoData(db, params.industry, params.slot);
  } catch {
    error(503, 'Unavailable');
  }
  if (!photo) error(404, 'Not found');

  return new Response(photo.data.buffer as ArrayBuffer, {
    headers: {
      'content-type': photo.type,
      'x-content-type-options': 'nosniff',
      'cache-control': 'public, max-age=31536000, immutable',
      'content-security-policy': "default-src 'none'; sandbox"
    }
  });
};

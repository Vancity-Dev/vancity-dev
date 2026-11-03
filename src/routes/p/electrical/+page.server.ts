import type { PageServerLoad } from './$types';
import { loadSitePhotos } from '$lib/templates/photos-db';

// Photos uploaded at /admin/images, so the showcase shows what a prospect site will.
export const load: PageServerLoad = async ({ platform }) => ({
  photos: await loadSitePhotos(platform?.env?.DB, 'electrical')
});

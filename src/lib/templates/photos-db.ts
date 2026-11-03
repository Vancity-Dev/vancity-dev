import type { D1Database } from '@cloudflare/workers-types';
import { photoSlots, type SitePhotos } from './photos';
import type { IndustryKey } from '$lib/prospects/types';

export interface StoredPhoto {
  slot: string;
  alt: string;
  updatedAt: number;
}

export async function listPhotos(db: D1Database, industry: string): Promise<StoredPhoto[]> {
  const { results } = await db
    .prepare('SELECT slot, alt, updated_at FROM template_images WHERE industry = ?')
    .bind(industry)
    .all<{ slot: string; alt: string; updated_at: number }>();
  return results.map((r) => ({ slot: r.slot, alt: r.alt, updatedAt: r.updated_at }));
}

export async function getPhotoData(
  db: D1Database,
  industry: string,
  slot: string
): Promise<{ type: string; data: Uint8Array; updatedAt: number } | null> {
  const row = await db
    .prepare('SELECT content_type, data, updated_at FROM template_images WHERE industry = ? AND slot = ?')
    .bind(industry, slot)
    .first<{ content_type: string; data: ArrayBuffer | number[]; updated_at: number }>();
  // D1 hands a BLOB back as an ArrayBuffer or, on older runtimes, an array of byte values.
  return row ? { type: row.content_type, data: new Uint8Array(row.data), updatedAt: row.updated_at } : null;
}

export async function putPhoto(
  db: D1Database,
  industry: string,
  slot: string,
  type: string,
  data: ArrayBuffer,
  alt: string
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO template_images (industry, slot, content_type, data, alt, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (industry, slot) DO UPDATE SET
         content_type = excluded.content_type, data = excluded.data,
         alt = excluded.alt, updated_at = excluded.updated_at`
    )
    .bind(industry, slot, type, data, alt, Date.now())
    .run();
}

export async function setPhotoAlt(db: D1Database, industry: string, slot: string, alt: string) {
  await db
    .prepare('UPDATE template_images SET alt = ? WHERE industry = ? AND slot = ?')
    .bind(alt, industry, slot)
    .run();
}

export async function deletePhoto(db: D1Database, industry: string, slot: string) {
  await db
    .prepare('DELETE FROM template_images WHERE industry = ? AND slot = ?')
    .bind(industry, slot)
    .run();
}

export const photoUrl = (industry: string, slot: string, updatedAt: number) =>
  `/template-media/${industry}/${slot}?v=${updatedAt}`;

// What a page load hands to a template. Never throws: a missing table or binding must leave
// the site rendering with its tonal panels, not turn a live prospect page into a 503.
export async function loadSitePhotos(
  db: D1Database | undefined,
  industry: IndustryKey
): Promise<SitePhotos> {
  if (!db || photoSlots[industry].length === 0) return {};
  try {
    const out: SitePhotos = {};
    for (const p of await listPhotos(db, industry)) {
      if (photoSlots[industry].some((s) => s.key === p.slot)) {
        out[p.slot] = { src: photoUrl(industry, p.slot, p.updatedAt), alt: p.alt };
      }
    }
    return out;
  } catch {
    return {};
  }
}

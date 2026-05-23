import { query, queryOne } from "./db";
import {
  PosterTemplate,
  PosterTemplateWithFestival,
  Festival,
  FestivalWithTemplates,
} from "./types";

export async function getAllFestivals(): Promise<Festival[]> {
  return query<Festival>(
    "SELECT * FROM festival WHERE status = 1 ORDER BY date ASC"
  );
}

export async function getFestivalById(id: number): Promise<Festival | null> {
  return queryOne<Festival>("SELECT * FROM festival WHERE id = ? AND status = 1", [id]);
}

export async function getFestivalBySlug(slug: string): Promise<Festival | null> {
  return queryOne<Festival>("SELECT * FROM festival WHERE slug = ? AND status = 1", [slug]);
}

export async function getAllTemplates(): Promise<PosterTemplate[]> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  return query<PosterTemplate>(
    `SELECT * FROM poster_template
     WHERE status = 1
       AND (is_limited = 0 OR (is_limited = 1 AND online_from <= ? AND online_to >= ?))
     ORDER BY sort_order ASC, created_at DESC`,
    [now, now]
  );
}

export async function getTemplatesByFestivalId(festivalId: number): Promise<PosterTemplate[]> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  return query<PosterTemplate>(
    `SELECT * FROM poster_template
     WHERE festival_id = ? AND status = 1
       AND (is_limited = 0 OR (is_limited = 1 AND online_from <= ? AND online_to >= ?))
     ORDER BY sort_order ASC, created_at DESC`,
    [festivalId, now, now]
  );
}

export async function getTemplateById(id: number): Promise<PosterTemplate | null> {
  return queryOne<PosterTemplate>(
    "SELECT * FROM poster_template WHERE id = ? AND status = 1",
    [id]
  );
}

export async function getTemplatesWithFestival(): Promise<PosterTemplateWithFestival[]> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  return query<PosterTemplateWithFestival>(
    `SELECT pt.*, f.id as festival_fid, f.name as festival_name, f.slug as festival_slug, f.icon as festival_icon, f.color as festival_color
     FROM poster_template pt
     JOIN festival f ON pt.festival_id = f.id
     WHERE pt.status = 1 AND f.status = 1
       AND (pt.is_limited = 0 OR (pt.is_limited = 1 AND pt.online_from <= ? AND pt.online_to >= ?))
     ORDER BY f.date ASC, pt.sort_order ASC`,
    [now, now]
  );
}

export async function getFestivalsWithTemplates(): Promise<FestivalWithTemplates[]> {
  const festivals = await getAllFestivals();
  const result: FestivalWithTemplates[] = [];

  for (const festival of festivals) {
    const templates = await getTemplatesByFestivalId(festival.id);
    result.push({ ...festival, templates });
  }

  return result;
}

export function getCurrentLimitedTemplates(): {
  available: PosterTemplate[];
  upcoming: PosterTemplate[];
} {
  const now = new Date();

  return {
    available: [],
    upcoming: [],
  };
}

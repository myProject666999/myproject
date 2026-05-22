import pool from './db';
import type { Wallpaper, Category, WallpaperSize, PaginatedResult } from './types';

const DEFAULT_PAGE_SIZE = 12;

export async function getWallpapers(params: {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  resolution?: string;
  sort?: 'latest' | 'popular' | 'downloads' | 'random';
  featured?: boolean;
  search?: string;
}): Promise<PaginatedResult<Wallpaper>> {
  const page = params.page || 1;
  const pageSize = params.pageSize || DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  let whereClauses: string[] = ['w.status = 1'];
  let joinClauses = '';
  let queryParams: (string | number)[] = [];

  if (params.categoryId) {
    joinClauses += ' INNER JOIN wallpaper_categories wc ON w.id = wc.wallpaper_id';
    whereClauses.push('wc.category_id = ?');
    queryParams.push(params.categoryId);
  }

  if (params.resolution) {
    joinClauses += ' INNER JOIN wallpaper_sizes ws ON w.id = ws.wallpaper_id';
    whereClauses.push('ws.resolution_label = ?');
    queryParams.push(params.resolution);
  }

  if (params.featured) {
    whereClauses.push('w.is_featured = 1');
  }

  if (params.search) {
    whereClauses.push('(w.title LIKE ? OR w.description LIKE ?)');
    queryParams.push(`%${params.search}%`, `%${params.search}%`);
  }

  const whereSQL = whereClauses.join(' AND ');

  let orderSQL = 'w.created_at DESC';
  if (params.sort === 'popular') {
    orderSQL = 'w.views DESC';
  } else if (params.sort === 'downloads') {
    orderSQL = 'w.downloads DESC';
  } else if (params.sort === 'random') {
    orderSQL = 'RAND()';
  }

  const countQuery = `
    SELECT COUNT(DISTINCT w.id) as total
    FROM wallpapers w
    ${joinClauses}
    WHERE ${whereSQL}
  `;

  const [countRows] = await pool.query(countQuery, queryParams) as [{ total: number }[]];
  const total = countRows[0].total;

  const dataQuery = `
    SELECT DISTINCT w.*
    FROM wallpapers w
    ${joinClauses}
    WHERE ${whereSQL}
    ORDER BY ${orderSQL}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(dataQuery, [...queryParams, pageSize, offset]) as Wallpaper[][];

  const wallpapers = rows as Wallpaper[];
  for (const wp of wallpapers) {
    wp.thumbnail_url = wp.original_url.includes('unsplash.com')
      ? wp.original_url.replace(/w=\d+/, 'w=400')
      : wp.original_url;
  }

  return {
    data: wallpapers,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getWallpaperById(id: number): Promise<Wallpaper | null> {
  const query = `
    SELECT * FROM wallpapers WHERE id = ? AND status = 1
  `;
  const [rows] = await pool.query(query, [id]) as Wallpaper[][];
  if (rows.length === 0) return null;

  const wallpaper = rows[0] as Wallpaper;
  wallpaper.categories = await getCategoriesByWallpaperId(id);
  wallpaper.sizes = await getSizesByWallpaperId(id);

  return wallpaper;
}

export async function getCategoriesByWallpaperId(wallpaperId: number): Promise<Category[]> {
  const query = `
    SELECT c.* FROM categories c
    INNER JOIN wallpaper_categories wc ON c.id = wc.category_id
    WHERE wc.wallpaper_id = ?
    ORDER BY c.sort ASC
  `;
  const [rows] = await pool.query(query, [wallpaperId]) as Category[][];
  return rows as Category[];
}

export async function getSizesByWallpaperId(wallpaperId: number): Promise<WallpaperSize[]> {
  const query = `
    SELECT * FROM wallpaper_sizes
    WHERE wallpaper_id = ?
    ORDER BY width DESC
  `;
  const [rows] = await pool.query(query, [wallpaperId]) as WallpaperSize[][];
  return rows as WallpaperSize[];
}

export async function getCategories(): Promise<Category[]> {
  const query = `
    SELECT c.*, COUNT(wc.wallpaper_id) as count
    FROM categories c
    LEFT JOIN wallpaper_categories wc ON c.id = wc.category_id
    WHERE c.status = 1
    GROUP BY c.id
    ORDER BY c.sort ASC
  `;
  const [rows] = await pool.query(query) as Category[][];
  return rows as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const query = 'SELECT * FROM categories WHERE slug = ? AND status = 1';
  const [rows] = await pool.query(query, [slug]) as Category[][];
  return rows.length > 0 ? (rows[0] as Category) : null;
}

export async function getAvailableResolutions(): Promise<string[]> {
  const query = `
    SELECT DISTINCT resolution_label
    FROM wallpaper_sizes
    ORDER BY
      CAST(SUBSTRING_INDEX(resolution_label, 'x', 1) AS UNSIGNED) DESC,
      CAST(SUBSTRING_INDEX(resolution_label, 'x', -1) AS UNSIGNED) DESC
  `;
  const [rows] = await pool.query(query) as { resolution_label: string }[][];
  return rows.map(r => r.resolution_label);
}

export async function incrementViews(id: number): Promise<void> {
  const query = 'UPDATE wallpapers SET views = views + 1 WHERE id = ?';
  await pool.query(query, [id]);
}

export async function incrementDownloads(id: number): Promise<void> {
  const query = 'UPDATE wallpapers SET downloads = downloads + 1 WHERE id = ?';
  await pool.query(query, [id]);
}

export async function incrementLikes(id: number): Promise<void> {
  const query = 'UPDATE wallpapers SET likes = likes + 1 WHERE id = ?';
  await pool.query(query, [id]);
}

export async function addFavorite(wallpaperId: number, userIdentifier: string): Promise<boolean> {
  try {
    const query = 'INSERT INTO favorites (wallpaper_id, user_identifier) VALUES (?, ?)';
    await pool.query(query, [wallpaperId, userIdentifier]);
    return true;
  } catch {
    return false;
  }
}

export async function removeFavorite(wallpaperId: number, userIdentifier: string): Promise<boolean> {
  const query = 'DELETE FROM favorites WHERE wallpaper_id = ? AND user_identifier = ?';
  const [result] = await pool.query(query, [wallpaperId, userIdentifier]) as [{ affectedRows: number }];
  return result.affectedRows > 0;
}

export async function isFavorited(wallpaperId: number, userIdentifier: string): Promise<boolean> {
  const query = 'SELECT id FROM favorites WHERE wallpaper_id = ? AND user_identifier = ?';
  const [rows] = await pool.query(query, [wallpaperId, userIdentifier]) as [{ id: number }[]];
  return rows.length > 0;
}

export async function getFavoritesByUser(userIdentifier: string): Promise<Wallpaper[]> {
  const query = `
    SELECT w.* FROM wallpapers w
    INNER JOIN favorites f ON w.id = f.wallpaper_id
    WHERE f.user_identifier = ?
    ORDER BY f.created_at DESC
  `;
  const [rows] = await pool.query(query, [userIdentifier]) as Wallpaper[][];
  const wallpapers = rows as Wallpaper[];
  for (const wp of wallpapers) {
    wp.thumbnail_url = wp.original_url.includes('unsplash.com')
      ? wp.original_url.replace(/w=\d+/, 'w=400')
      : wp.original_url;
  }
  return wallpapers;
}

export async function getRandomWallpapers(limit: number = 6): Promise<Wallpaper[]> {
  const query = `
    SELECT * FROM wallpapers
    WHERE status = 1
    ORDER BY RAND()
    LIMIT ?
  `;
  const [rows] = await pool.query(query, [limit]) as Wallpaper[][];
  const wallpapers = rows as Wallpaper[];
  for (const wp of wallpapers) {
    wp.thumbnail_url = wp.original_url.includes('unsplash.com')
      ? wp.original_url.replace(/w=\d+/, 'w=400')
      : wp.original_url;
  }
  return wallpapers;
}

export async function getFeaturedWallpapers(limit: number = 8): Promise<Wallpaper[]> {
  const query = `
    SELECT * FROM wallpapers
    WHERE status = 1 AND is_featured = 1
    ORDER BY created_at DESC
    LIMIT ?
  `;
  const [rows] = await pool.query(query, [limit]) as Wallpaper[][];
  const wallpapers = rows as Wallpaper[];
  for (const wp of wallpapers) {
    wp.thumbnail_url = wp.original_url.includes('unsplash.com')
      ? wp.original_url.replace(/w=\d+/, 'w=400')
      : wp.original_url;
  }
  return wallpapers;
}

export async function getRelatedWallpapers(wallpaperId: number, categoryId: number, limit: number = 6): Promise<Wallpaper[]> {
  const query = `
    SELECT DISTINCT w.* FROM wallpapers w
    INNER JOIN wallpaper_categories wc ON w.id = wc.wallpaper_id
    WHERE w.status = 1 AND wc.category_id = ? AND w.id != ?
    ORDER BY RAND()
    LIMIT ?
  `;
  const [rows] = await pool.query(query, [categoryId, wallpaperId, limit]) as Wallpaper[][];
  const wallpapers = rows as Wallpaper[];
  for (const wp of wallpapers) {
    wp.thumbnail_url = wp.original_url.includes('unsplash.com')
      ? wp.original_url.replace(/w=\d+/, 'w=400')
      : wp.original_url;
  }
  return wallpapers;
}

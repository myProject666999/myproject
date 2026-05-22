export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort: number;
  status: number;
  created_at: string;
  updated_at: string;
  count?: number;
}

export interface WallpaperSize {
  id: number;
  wallpaper_id: number;
  resolution_label: string;
  width: number;
  height: number;
  url: string;
  file_size: number;
  created_at: string;
}

export interface Wallpaper {
  id: number;
  title: string;
  description: string | null;
  original_url: string;
  original_width: number;
  original_height: number;
  file_size: number;
  file_format: string;
  views: number;
  downloads: number;
  likes: number;
  author: string | null;
  source: string | null;
  is_featured: number;
  status: number;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  sizes?: WallpaperSize[];
  is_favorited?: boolean;
  thumbnail_url?: string;
}

export interface Favorite {
  id: number;
  wallpaper_id: number;
  user_identifier: string;
  created_at: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

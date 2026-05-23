export interface Category {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface Website {
  id: number;
  name: string;
  url: string;
  description: string | null;
  category_id: number;
  is_private: number;
  is_featured: number;
  favicon_url: string | null;
  view_count: number;
  sort_order: number;
  created_at: string;
}

export interface WebsiteWithCategory extends Website {
  category_name: string;
  category_icon: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Snippet {
  id: number;
  title: string;
  description: string | null;
  code: string;
  language: string;
  visibility: 'private' | 'public';
  user_id: number | null;
  current_version: number;
  created_at: Date;
  updated_at: Date;
  tags?: Tag[];
  username?: string;
}

export interface SnippetVersion {
  id: number;
  snippet_id: number;
  version: number;
  title: string;
  description: string | null;
  code: string;
  language: string;
  change_note: string | null;
  created_at: Date;
}

export interface Tag {
  id: number;
  name: string;
}

export interface SnippetWithTags extends Snippet {
  tags: Tag[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

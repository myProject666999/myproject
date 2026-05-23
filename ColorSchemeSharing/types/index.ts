export interface Color {
  id: number;
  schemeId: number;
  hex: string;
  hue: number;
  position: number;
}

export interface ColorScheme {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  colors: Color[];
  isFavorite: boolean;
}

export interface CreateColorSchemeInput {
  name: string;
  description?: string;
  colors: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

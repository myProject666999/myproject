export interface Festival {
  id: number;
  name: string;
  slug: string;
  date: string;
  icon: string | null;
  color: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface TextConfig {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  x: number;
  y: number;
  textAlign: CanvasTextAlign;
  maxWidth?: number;
}

export interface AvatarConfig {
  enabled: boolean;
  x: number;
  y: number;
  size: number;
  shape: "circle" | "square";
  borderColor: string;
  borderWidth: number;
}

export interface StickerConfig {
  type: "emoji" | "image";
  value: string;
  x: number;
  y: number;
  size: number;
}

export interface PosterTemplate {
  id: number;
  festival_id: number;
  name: string;
  description: string | null;
  preview_image: string | null;
  background_type: "color" | "gradient" | "image";
  background_value: string;
  width: number;
  height: number;
  text_config: Record<string, TextConfig> | null;
  avatar_config: AvatarConfig | null;
  sticker_config: StickerConfig[] | null;
  is_limited: number;
  online_from: string | null;
  online_to: string | null;
  sort_order: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateElement {
  id: number;
  template_id: number;
  element_type: "text" | "image" | "sticker" | "avatar";
  name: string;
  config: Record<string, any>;
  editable: number;
  required: number;
  sort_order: number;
}

export interface PosterTemplateWithFestival extends PosterTemplate {
  festival: Festival;
}

export interface FestivalWithTemplates extends Festival {
  templates: PosterTemplate[];
}

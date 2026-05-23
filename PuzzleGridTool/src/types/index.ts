export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageItem {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  name: string;
}

export interface LayoutSlot {
  index: number;
  rect: Rect;
  image: ImageItem | null;
}

export interface TextConfig {
  content: string;
  color: string;
  fontSize: number;
  position: Point;
  fontFamily: string;
}

export interface PuzzleConfig {
  layoutType: string;
  gap: number;
  borderWidth: number;
  borderColor: string;
  backgroundColor: string;
  canvasWidth: number;
  canvasHeight: number;
  text: TextConfig;
}

export interface Layout {
  id: string;
  name: string;
  description: string;
  slots: Rect[];
  minImages: number;
  maxImages: number;
}

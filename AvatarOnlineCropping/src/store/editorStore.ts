import { create } from 'zustand';

export type Shape = 'circle' | 'square';
export type Category = 'border' | 'festival';
export type Style = 'simple' | 'vintage' | 'cartoon' | 'spring' | 'christmas' | 'birthday';

export interface Template {
  id: number;
  name: string;
  category: Category;
  style: Style;
  image_url: string;
  border_width: number;
  border_color: string;
}

interface EditorState {
  image: HTMLImageElement | null;
  shape: Shape;
  zoom: number;
  offsetX: number;
  offsetY: number;
  selectedTemplate: Template | null;
  canvasSize: number;
  canvasRef: HTMLCanvasElement | null;
  
  setImage: (image: HTMLImageElement | null) => void;
  setShape: (shape: Shape) => void;
  setZoom: (zoom: number) => void;
  setOffset: (x: number, y: number) => void;
  setSelectedTemplate: (template: Template | null) => void;
  setCanvasSize: (size: number) => void;
  setCanvasRef: (canvas: HTMLCanvasElement | null) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  image: null,
  shape: 'circle',
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  selectedTemplate: null,
  canvasSize: 400,
  canvasRef: null,
  
  setImage: (image) => set({ image, zoom: 1, offsetX: 0, offsetY: 0 }),
  setShape: (shape) => set({ shape }),
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3, zoom)) }),
  setOffset: (x, y) => set({ offsetX: x, offsetY: y }),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  setCanvasSize: (size) => set({ canvasSize: size }),
  setCanvasRef: (canvas) => set({ canvasRef: canvas }),
  reset: () => set({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    selectedTemplate: null,
  }),
}));

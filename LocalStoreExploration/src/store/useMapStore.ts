import { create } from 'zustand';

interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
  radius: number;
  selectedCategory: string;
  setCenter: (lat: number, lng: number) => void;
  setZoom: (zoom: number) => void;
  setRadius: (radius: number) => void;
  setSelectedCategory: (category: string) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: { lat: 39.9087, lng: 116.4474 },
  zoom: 14,
  radius: 5,
  selectedCategory: 'all',
  
  setCenter: (lat: number, lng: number) => set({ center: { lat, lng } }),
  setZoom: (zoom: number) => set({ zoom }),
  setRadius: (radius: number) => set({ radius }),
  setSelectedCategory: (selectedCategory: string) => set({ selectedCategory }),
}));

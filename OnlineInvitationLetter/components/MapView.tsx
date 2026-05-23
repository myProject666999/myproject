'use client';

import { useEffect, useRef } from 'react';

interface MapProps {
  latitude: number;
  longitude: number;
  locationName: string;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function MapView({ latitude, longitude, locationName }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const loadLeaflet = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.L) {
          resolve();
          return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Leaflet'));
        document.head.appendChild(script);
      });
    };

    const initMap = async () => {
      await loadLeaflet();

      if (!mapContainerRef.current || !window.L) return;

      if (mapRef.current) {
        mapRef.current.remove();
      }

      const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
      const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

      mapRef.current = window.L.map(mapContainerRef.current).setView([lat, lng], 16);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(mapRef.current);

      window.L.marker([lat, lng])
        .addTo(mapRef.current)
        .bindPopup(`<b>${locationName}</b>`)
        .openPopup();
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, locationName]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '400px', borderRadius: '12px' }}
    />
  );
}

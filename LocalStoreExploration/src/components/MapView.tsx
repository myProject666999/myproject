import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { Note } from '../types';
import { useNavigate } from 'react-router-dom';

interface MapViewProps {
  notes: Note[];
  center: { lat: number; lng: number };
  onMarkerClick?: (note: Note) => void;
}

export default function MapView({ notes, center, onMarkerClick }: MapViewProps) {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);

  const getPosition = (lat: number, lng: number) => {
    const scale = 100;
    const x = ((lng - center.lng) * scale + 50);
    const y = ((center.lat - lat) * scale + 50);
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const handleMarkerClick = (note: Note) => {
    if (onMarkerClick) {
      onMarkerClick(note);
    } else {
      navigate(`/note/${note.id}`);
    }
  };

  return (
    <div ref={mapRef} className="relative w-full h-64 bg-gradient-to-br from-green-100 via-blue-50 to-orange-50 rounded-2xl overflow-hidden">
      <div className="absolute inset-0">
        <svg className="w-full h-full opacity-20">
          {[...Array(10)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={`${i * 10}%`}
              x2="100%"
              y2={`${i * 10}%`}
              stroke="#666"
              strokeWidth="0.5"
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={`${i * 10}%`}
              y1="0"
              x2={`${i * 10}%`}
              y2="100%"
              stroke="#666"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </div>

      {notes.map((note) => {
        const pos = getPosition(note.lat, note.lng);
        return (
          <button
            key={note.id}
            onClick={() => handleMarkerClick(note)}
            className="absolute transform -translate-x-1/2 -translate-y-full transition-all hover:scale-110 z-10 group"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div className="relative">
              <MapPin className="w-8 h-8 text-orange-500 fill-orange-500 drop-shadow-lg" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap max-w-32 truncate">
                {note.title}
              </div>
            </div>
          </button>
        );
      })}

      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
        <p className="text-xs text-gray-600">📍 附近 {notes.length} 家好店</p>
      </div>
    </div>
  );
}

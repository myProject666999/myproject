import { Link } from 'react-router-dom';
import { Star, MapPin, Eye, Heart, MessageCircle } from 'lucide-react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
  const distance = note.distance ? note.distance.toFixed(2) : null;

  return (
    <Link to={`/note/${note.id}`} className="block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="relative">
          <img
            src={note.images[0]}
            alt={note.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center gap-1">
            <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
            {note.ratingOverall}
          </div>
          {distance && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs text-gray-600 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {distance}km
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-1 mb-2">
            {note.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {note.content}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={note.user?.avatar || 'https://picsum.photos/40/40'}
                alt={note.user?.nickname}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-xs text-gray-600">
                {note.user?.nickname}
              </span>
              {note.user?.isVerified && (
                <span className="text-orange-500 text-xs">✓</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-gray-400 text-xs">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {note.viewsCount}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {note.likesCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {note.commentsCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

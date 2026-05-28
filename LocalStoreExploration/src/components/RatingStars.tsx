import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  size?: number;
  showValue?: boolean;
}

export default function RatingStars({ rating, size = 16, showValue = false }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${star <= rating ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`}
          style={{ width: size, height: size }}
        />
      ))}
      {showValue && <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
}

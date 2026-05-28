import { useNavigate } from 'react-router-dom';
import { Heart, Eye, Share2, User } from 'lucide-react';
import { useState } from 'react';

interface MemeCardProps {
  id: number;
  title: string;
  image: string;
  author: string;
  authorAvatar?: string;
  likeCount: number;
  viewCount: number;
  isLiked?: boolean;
  showRank?: boolean;
  rank?: number;
}

const MemeCard = ({
  id,
  title,
  image,
  author,
  authorAvatar,
  likeCount,
  viewCount,
  isLiked = false,
  showRank = false,
  rank,
}: MemeCardProps) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likeCount);

  const handleClick = () => {
    navigate(`/meme/${id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const getRankStyle = (rankNum: number) => {
    if (rankNum === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-dark';
    if (rankNum === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-dark';
    if (rankNum === 3) return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
    return 'bg-card text-gray-400';
  };

  return (
    <div
      onClick={handleClick}
      className="cyber-card rounded-xl overflow-hidden group cursor-pointer hover:neon-glow transition-all duration-300 relative"
    >
      {showRank && rank && (
        <div className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle(rank)}`}>
          {rank}
        </div>
      )}

      <div className="aspect-square relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent" />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white mb-3 truncate group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              {authorAvatar ? (
                <img src={authorAvatar} alt={author} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={12} className="text-white" />
              )}
            </div>
            <span className="text-sm text-gray-400">{author}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm transition-colors ${
                liked ? 'text-primary' : 'text-gray-400 hover:text-primary'
              }`}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
              {likes}
            </button>
            <span className="flex items-center gap-1 text-sm text-gray-400">
              <Eye size={16} />
              {viewCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeCard;

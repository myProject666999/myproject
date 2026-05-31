import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Heart, PenTool, Bookmark, BookmarkCheck } from 'lucide-react';

interface TemplateCardProps {
  id: number;
  title: string;
  image: string;
  category: string;
  useCount: number;
  likeCount: number;
  viewMode?: 'grid' | 'list';
}

const TemplateCard = ({ id, title, image, category, useCount, likeCount, viewMode = 'grid' }: TemplateCardProps) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(likeCount);
  const [favorited, setFavorited] = useState(false);

  const handleUseTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/editor?template=${id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFavorited(!favorited);
  };

  if (viewMode === 'list') {
    return (
      <div className="cyber-card rounded-xl overflow-hidden group cursor-pointer hover:neon-glow transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64 aspect-[4/3] md:aspect-auto relative overflow-hidden flex-shrink-0">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent md:bg-gradient-to-r md:from-dark/60 md:to-transparent" />
            
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 text-xs font-medium rounded-md bg-primary/90 text-white">
                {category}
              </span>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                快速创作高质量梗图模板，支持自定义文字、贴纸等多种编辑功能。点击使用模板立即开始创作你的专属梗图。
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye size={16} />
                  {useCount} 次使用
                </span>
                <button
                  type="button"
                  onClick={handleLike}
                  className={`flex items-center gap-1 transition-all duration-200 ${
                    liked ? 'text-primary' : 'text-gray-400 hover:text-primary'
                  }`}
                >
                  <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                  {likes}
                </button>
                <button
                  type="button"
                  onClick={handleFavorite}
                  className={`flex items-center gap-1 transition-all duration-200 ${
                    favorited ? 'text-accent' : 'text-gray-400 hover:text-accent'
                  }`}
                >
                  {favorited ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  {favorited ? '已收藏' : '收藏'}
                </button>
              </div>
              <button
                type="button"
                onClick={handleUseTemplate}
                className="px-6 py-2 cyber-btn rounded-lg text-sm font-medium"
              >
                使用模板
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-card rounded-xl overflow-hidden group cursor-pointer hover:neon-glow transition-all duration-300">
      <div className="aspect-[4/3] relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-primary/90 text-white">
            {category}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            type="button"
            onClick={handleFavorite}
            className={`p-1.5 rounded-md backdrop-blur-sm transition-all duration-200 ${
              favorited
                ? 'bg-accent/30 text-accent'
                : 'bg-dark/50 text-gray-300 hover:text-accent hover:bg-accent/20'
            }`}
            title={favorited ? '取消收藏' : '收藏'}
          >
            {favorited ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
          <button
            type="button"
            onClick={handleUseTemplate}
            className="p-1.5 rounded-md bg-primary/80 text-white hover:bg-primary backdrop-blur-sm transition-all duration-200"
            title="使用模板"
          >
            <PenTool size={16} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white mb-3 truncate group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {useCount}
            </span>
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1 transition-all duration-200 ${
                liked ? 'text-primary scale-105' : 'text-gray-400 hover:text-primary'
              }`}
              title={liked ? '取消点赞' : '点赞'}
            >
              <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
              {likes}
            </button>
          </div>
          <button
            type="button"
            onClick={handleFavorite}
            className={`flex items-center gap-1 transition-all duration-200 text-xs px-2 py-1 rounded-md ${
              favorited
                ? 'bg-accent/20 text-accent'
                : 'text-gray-500 hover:text-accent hover:bg-accent/10'
            }`}
            title={favorited ? '取消收藏' : '收藏'}
          >
            {favorited ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
            {favorited ? '已收藏' : '收藏'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;

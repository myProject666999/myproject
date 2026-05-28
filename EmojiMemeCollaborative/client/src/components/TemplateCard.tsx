import { useNavigate } from 'react-router-dom';
import { Eye, Heart, PenTool } from 'lucide-react';

interface TemplateCardProps {
  id: number;
  title: string;
  image: string;
  category: string;
  useCount: number;
  likeCount: number;
}

const TemplateCard = ({ id, title, image, category, useCount, likeCount }: TemplateCardProps) => {
  const navigate = useNavigate();

  const handleUseTemplate = () => {
    navigate(`/editor?template=${id}`);
  };

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

        <button
          onClick={handleUseTemplate}
          className="absolute bottom-3 right-3 p-2 rounded-lg bg-primary/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary"
        >
          <PenTool size={18} />
        </button>
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
            <span className="flex items-center gap-1">
              <Heart size={14} />
              {likeCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;

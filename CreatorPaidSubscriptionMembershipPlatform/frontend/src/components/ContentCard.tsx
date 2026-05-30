import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, MessageCircle, Image, FileText, Video, Music, File, Lock } from 'lucide-react';
import type { Content } from '@/types';
import ContentLock from './ContentLock';
import { formatDateTime, formatNumber } from '@/utils/format';

interface ContentCardProps {
  content: Content;
  canAccess: boolean;
  creatorId: number;
  tierName?: string;
}

const ContentCard = ({ content, canAccess, creatorId, tierName }: ContentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getContentTypeIcon = (type: string) => {
    const icons = {
      TEXT: <FileText className="w-4 h-4" />,
      IMAGE: <Image className="w-4 h-4" />,
      VIDEO: <Video className="w-4 h-4" />,
      AUDIO: <Music className="w-4 h-4" />,
      FILE: <File className="w-4 h-4" />,
    };
    return icons[type as keyof typeof icons] || <FileText className="w-4 h-4" />;
  };

  const getContentTypeText = (type: string) => {
    const texts = {
      TEXT: '文章',
      IMAGE: '图片',
      VIDEO: '视频',
      AUDIO: '音频',
      FILE: '文件',
    };
    return texts[type as keyof typeof texts] || '内容';
  };

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden border border-neutral-200 
        hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!canAccess && content.minTierLevel > 0 && (
        <ContentLock minTierLevel={content.minTierLevel} creatorId={creatorId} tierName={tierName} />
      )}

      <div className={`aspect-video relative overflow-hidden ${!canAccess && content.minTierLevel > 0 ? 'blur-md' : ''}`}>
        {content.thumbnailUrl ? (
          <img
            src={content.thumbnailUrl}
            alt={content.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 
            flex items-center justify-center">
            {content.contentType === 'TEXT' ? (
              <div className="p-6 text-neutral-600 line-clamp-3 text-sm">{content.content}</div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center text-primary-500">
                {getContentTypeIcon(content.contentType)}
              </div>
            )}
          </div>
        )}

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="px-3 py-1 bg-black/50 backdrop-blur rounded-full text-white text-xs 
            flex items-center gap-1">
            {getContentTypeIcon(content.contentType)}
            {getContentTypeText(content.contentType)}
          </span>
          {content.minTierLevel > 0 && (
            <span className="px-3 py-1 bg-gradient-to-r from-primary-500 to-accent-500 
              rounded-full text-white text-xs flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Lv.{content.minTierLevel}
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className={`text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary-600 
          transition-colors ${!canAccess && content.minTierLevel > 0 ? 'text-neutral-400' : 'text-neutral-800'}`}>
          {content.title}
        </h3>

        {content.contentType === 'TEXT' && canAccess && (
          <p className="text-neutral-500 text-sm mb-4 line-clamp-2">{content.content}</p>
        )}

        <div className="flex items-center justify-between text-sm text-neutral-500">
          <span>{formatDateTime(content.createdAt)}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {formatNumber(content.viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {formatNumber(content.likeCount)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {formatNumber(content.commentCount)}
            </span>
          </div>
        </div>
      </div>

      {isHovered && canAccess && (
        <Link
          to={`/creator/${creatorId}/contents#${content.id}`}
          className="absolute inset-0 bg-gradient-to-t from-primary-600/80 to-transparent 
            flex items-end justify-center pb-8 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span className="px-6 py-2 bg-white text-primary-600 rounded-full font-semibold 
            hover:bg-primary-50 transition-colors">
            阅读全文
          </span>
        </Link>
      )}
    </div>
  );
};

export default ContentCard;

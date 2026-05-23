"use client";

import { PosterTemplate } from "@/lib/types";
import { Calendar, Sparkles, Image } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  template: PosterTemplate;
}

export default function TemplateCard({ template }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/customize/${template.id}`);
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    if (template.background_type === "gradient") {
      return {
        background: template.background_value,
      };
    }
    return {
      backgroundColor: template.background_value,
    };
  };

  const isLimited = template.is_limited === 1;
  const isOnline =
    !isLimited ||
    (template.online_from && template.online_to &&
      new Date(template.online_from) <= new Date() &&
      new Date(template.online_to) >= new Date());

  return (
    <div
      className="card cursor-pointer group"
      onClick={handleClick}
    >
      <div
        className="relative aspect-[9/16] flex items-center justify-center overflow-hidden"
        style={getBackgroundStyle()}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {template.preview_image ? (
            <img
              src={template.preview_image}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center px-4">
              {template.text_config && (
                <>
                  {template.text_config.title && (
                    <p
                      className="text-shadow font-bold mb-2"
                      style={{
                        fontSize: `${template.text_config.title.fontSize / 10}px`,
                        color: template.text_config.title.color,
                      }}
                    >
                      {template.text_config.title.text}
                    </p>
                  )}
                  {template.text_config.subtitle && (
                    <p
                      className="text-shadow"
                      style={{
                        fontSize: `${template.text_config.subtitle.fontSize / 10}px`,
                        color: template.text_config.subtitle.color,
                      }}
                    >
                      {template.text_config.subtitle.text}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        {template.avatar_config?.enabled && (
          <div
            className="absolute border-4 border-dashed border-white/50 rounded-full opacity-50 group-hover:opacity-80 transition-opacity"
            style={{
              width: `${(template.avatar_config.size / template.width) * 100}%`,
              height: `${(template.avatar_config.size / template.height) * 100}%`,
              left: `${(template.avatar_config.x / template.width) * 100}%`,
              top: `${(template.avatar_config.y / template.height) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
        {template.sticker_config && template.sticker_config.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {template.sticker_config.map((sticker, i) => (
              <span
                key={i}
                className="absolute animate-float"
                style={{
                  fontSize: `${sticker.size / 10}px`,
                  left: `${(sticker.x / template.width) * 100}%`,
                  top: `${(sticker.y / template.height) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                {sticker.type === "emoji" ? sticker.value : ""}
              </span>
            ))}
          </div>
        )}
        {isLimited && (
          <div className="absolute top-3 left-3 badge-limited">
            <Sparkles size={12} className="mr-1" />
            限时
          </div>
        )}
        {!isOnline && isLimited && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium">暂未上线</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-primary transition-colors">
          {template.name}
        </h3>
        {template.description && (
          <p className="text-gray-500 text-sm line-clamp-2">
            {template.description}
          </p>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Image size={12} />
            {template.width}×{template.height}
          </span>
          {template.online_from && template.online_to && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(template.online_from).toLocaleDateString("zh-CN")} -{" "}
              {new Date(template.online_to).toLocaleDateString("zh-CN")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

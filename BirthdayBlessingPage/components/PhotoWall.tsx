'use client';

import { useState, useEffect } from 'react';

interface Photo {
  id: number;
  file_name: string;
  file_path: string;
  caption: string | null;
  uploaded_by: string | null;
  sort_order: number;
  created_at: string;
}

export default function PhotoWall() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/photos');
      const data = await res.json();
      if (data.success) {
        setPhotos(data.data);
      }
    } catch (error) {
      console.error('获取照片失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">暂无照片，快来上传第一张吧！</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <div className="aspect-square bg-gray-100">
            <img
              src={photo.file_path}
              alt={photo.caption || '生日照片'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {(photo.caption || photo.uploaded_by) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {photo.caption && (
                  <p className="text-white text-sm font-medium truncate">
                    {photo.caption}
                  </p>
                )}
                {photo.uploaded_by && (
                  <p className="text-white/80 text-xs mt-1">
                    by {photo.uploaded_by}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

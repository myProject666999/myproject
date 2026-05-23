'use client';

import Image from 'next/image';
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const photos = [
  { id: 1, src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', caption: '婚纱照', height: 'h-64' },
  { id: 2, src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800', caption: '求婚现场', height: 'h-80' },
  { id: 3, src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', caption: '甜蜜时刻', height: 'h-56' },
  { id: 4, src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800', caption: '浪漫约会', height: 'h-72' },
  { id: 5, src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800', caption: '旅行记忆', height: 'h-60' },
  { id: 6, src: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800', caption: '毕业照', height: 'h-80' },
  { id: 7, src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800', caption: '订婚宴', height: 'h-56' },
  { id: 8, src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800', caption: '周年纪念', height: 'h-72' },
];

export default function GalleryContent() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev === null ? 0 : (prev - 1 + photos.length) % photos.length));
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev === null ? 0 : (prev + 1) % photos.length));
  };

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={`mb-4 break-inside-avoid cursor-pointer group`}
            onClick={() => openLightbox(index)}
          >
            <div className={`relative ${photo.height} rounded-2xl overflow-hidden shadow-lg`}>
              <Image
                src={photo.src}
                alt={photo.caption}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-medium">{photo.caption}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={prevImage}
            className="absolute left-4 text-white/80 hover:text-white p-2"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 text-white/80 hover:text-white p-2"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          <div className="relative w-full max-w-4xl h-[80vh]">
            <Image
              src={photos[selectedImage].src}
              alt={photos[selectedImage].caption}
              fill
              className="object-contain"
            />
          </div>
          <p className="absolute bottom-8 left-0 right-0 text-center text-white text-lg">
            {photos[selectedImage].caption}
          </p>
        </div>
      )}
    </>
  );
}

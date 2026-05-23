'use client';

import { useState, useEffect, useRef } from 'react';

interface MusicInfo {
  id: number;
  file_name: string;
  file_path: string;
  music_name: string;
  artist: string | null;
}

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [music, setMusic] = useState<MusicInfo | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchMusic();
  }, []);

  const fetchMusic = async () => {
    try {
      const res = await fetch('/api/music');
      const data = await res.json();
      if (data.success && data.data) {
        setMusic(data.data);
        setShowPlayer(true);
      }
    } catch (error) {
      console.error('获取音乐失败:', error);
    }
  };

  const handlePlayPause = async () => {
    if (!audioRef.current || !music) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('播放失败:', error);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  if (!showPlayer || !music) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={music.file_path}
        loop
        preload="auto"
      />

      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handlePlayPause}
          className="glass-card rounded-full p-4 shadow-xl hover:scale-110 transition-transform duration-300"
          title={isPlaying ? '暂停音乐' : '播放音乐'}
        >
          {isPlaying ? (
            <svg
              className="w-6 h-6 text-pink-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-pink-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {isPlaying && (
          <div className="absolute bottom-full right-0 mb-3 glass-card rounded-xl px-4 py-2 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-pink-500 rounded-full animate-pulse"
                    style={{
                      height: `${8 + Math.random() * 8}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-700">
                {music.music_name}
                {music.artist && ` - ${music.artist}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

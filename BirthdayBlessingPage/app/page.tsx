'use client';

import { useState, useEffect, useMemo } from 'react';
import Countdown from '@/components/Countdown';
import PhotoWall from '@/components/PhotoWall';
import BlessingList from '@/components/BlessingList';
import MusicPlayer from '@/components/MusicPlayer';

const EMOJIS = ['🎂', '🎈', '🎁', '🎊', '🎉'];

const FLOATING_EMOJIS = [
  { emoji: '🎂', left: 10, top: 15, duration: 5, delay: 0 },
  { emoji: '🎈', left: 25, top: 30, duration: 4, delay: 0.5 },
  { emoji: '🎁', left: 40, top: 10, duration: 6, delay: 1 },
  { emoji: '🎊', left: 55, top: 40, duration: 4.5, delay: 1.5 },
  { emoji: '🎉', left: 70, top: 20, duration: 5.5, delay: 0 },
  { emoji: '🎂', left: 85, top: 35, duration: 4, delay: 0.8 },
  { emoji: '🎈', left: 15, top: 55, duration: 5, delay: 1.2 },
  { emoji: '🎁', left: 30, top: 70, duration: 6, delay: 0.3 },
  { emoji: '🎊', left: 45, top: 60, duration: 4.5, delay: 1.8 },
  { emoji: '🎉', left: 60, top: 75, duration: 5, delay: 0.6 },
  { emoji: '🎂', left: 75, top: 50, duration: 4, delay: 1 },
  { emoji: '🎈', left: 90, top: 65, duration: 5.5, delay: 0.2 },
  { emoji: '🎁', left: 5, top: 80, duration: 4.5, delay: 1.5 },
  { emoji: '🎊', left: 20, top: 90, duration: 5, delay: 0.4 },
  { emoji: '🎉', left: 50, top: 85, duration: 6, delay: 1.1 },
  { emoji: '🎂', left: 65, top: 95, duration: 4, delay: 0.7 },
  { emoji: '🎈', left: 80, top: 85, duration: 5.5, delay: 1.3 },
  { emoji: '🎁', left: 95, top: 90, duration: 4.5, delay: 0.9 },
  { emoji: '🎊', left: 35, top: 45, duration: 5, delay: 1.6 },
  { emoji: '🎉', left: 48, top: 25, duration: 4, delay: 0.1 },
];

export default function Home() {
  const [birthdayDate, setBirthdayDate] = useState('2026-06-15T00:00:00');
  const [heroTitle, setHeroTitle] = useState('生日快乐');
  const [heroSubtitle, setHeroSubtitle] = useState(
    '愿你的每一天都充满阳光与欢笑'
  );
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(window.location.origin);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [dateRes, titleRes, subtitleRes] = await Promise.all([
        fetch('/api/settings?key=birthday_date'),
        fetch('/api/settings?key=hero_title'),
        fetch('/api/settings?key=hero_subtitle'),
      ]);

      const dateData = await dateRes.json();
      const titleData = await titleRes.json();
      const subtitleData = await subtitleRes.json();

      if (dateData.success && dateData.data?.value) {
        setBirthdayDate(dateData.data.value);
      }
      if (titleData.success && titleData.data?.value) {
        setHeroTitle(titleData.data.value);
      }
      if (subtitleData.success && subtitleData.data?.value) {
        setHeroSubtitle(subtitleData.data.value);
      }
    } catch (error) {
      console.error('获取设置失败:', error);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('链接已复制到剪贴板！');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <main className="min-h-screen pb-20">
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {FLOATING_EMOJIS.map((item, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-20"
              style={{
                left: `${item.left}%`,
                top: `${item.top}%`,
                animation: `float ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              {item.emoji}
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="text-6xl mb-6 animate-bounce">🎂</div>
          <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
            {heroTitle}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12">
            {heroSubtitle}
          </p>

          <div className="glass-card rounded-3xl p-8 shadow-xl mb-8">
            <h2 className="text-xl text-gray-700 mb-6">距离生日还有</h2>
            <Countdown targetDate={birthdayDate} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/join"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              ✍️ 送上我的祝福
            </a>
            <button
              onClick={handleCopyUrl}
              className="inline-flex items-center justify-center px-8 py-4 glass-card text-pink-600 font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              🔗 分享给朋友
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="gradient-text">📸 美好回忆</span>
          </h2>
          <p className="text-center text-gray-600 mb-12">
            记录我们一起走过的点点滴滴
          </p>
          <PhotoWall />
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-b from-pink-50/50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="gradient-text">💝 朋友们的祝福</span>
          </h2>
          <p className="text-center text-gray-600 mb-12">
            每一份祝福都是满满的心意
          </p>
          <BlessingList />
        </div>
      </section>

      <MusicPlayer />

      <footer className="fixed bottom-0 left-0 right-0 text-center py-4 glass-card border-t border-pink-100">
        <p className="text-gray-500 text-sm">
          Made with ❤️ for a special person |
          <a href="/join" className="text-pink-500 hover:underline ml-1">
            参与祝福
          </a>
        </p>
      </footer>
    </main>
  );
}

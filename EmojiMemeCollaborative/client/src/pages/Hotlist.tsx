import { useState } from 'react';
import { Flame, TrendingUp, Clock, Award } from 'lucide-react';
import MemeCard from '../components/MemeCard';

const periods = [
  { id: 'day', label: '今日', icon: <Clock size={16} /> },
  { id: 'week', label: '本周', icon: <TrendingUp size={16} /> },
  { id: 'all', label: '总榜', icon: <Award size={16} /> },
];

const mockHotMemes = [
  { id: 1, title: '最搞笑的梗图', image: 'https://picsum.photos/400/400?random=20', author: '梗图达人', likeCount: 5678, viewCount: 12345, isLiked: true, rank: 1 },
  { id: 2, title: '猫咪迷惑行为', image: 'https://picsum.photos/400/400?random=21', author: '猫猫控', likeCount: 4567, viewCount: 9876, isLiked: false, rank: 2 },
  { id: 3, title: '打工人日常', image: 'https://picsum.photos/400/400?random=22', author: '摸鱼大师', likeCount: 3456, viewCount: 8765, isLiked: true, rank: 3 },
  { id: 4, title: '游戏搞笑瞬间', image: 'https://picsum.photos/400/400?random=23', author: '游戏玩家', likeCount: 2345, viewCount: 7654, isLiked: false, rank: 4 },
  { id: 5, title: '情侣日常', image: 'https://picsum.photos/400/400?random=24', author: '恋爱脑', likeCount: 1234, viewCount: 6543, isLiked: false, rank: 5 },
  { id: 6, title: '学渣的逆袭', image: 'https://picsum.photos/400/400?random=25', author: '学霸', likeCount: 1111, viewCount: 5432, isLiked: true, rank: 6 },
  { id: 7, title: '社死现场', image: 'https://picsum.photos/400/400?random=26', author: '社恐患者', likeCount: 999, viewCount: 4321, isLiked: false, rank: 7 },
  { id: 8, title: '干饭人', image: 'https://picsum.photos/400/400?random=27', author: '吃货', likeCount: 888, viewCount: 3210, isLiked: false, rank: 8 },
];

const Hotlist = () => {
  const [activePeriod, setActivePeriod] = useState('day');

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow animate-pulse-glow">
              <Flame className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-glow">热榜</h1>
              <p className="text-gray-400">发现最受欢迎的梗图</p>
            </div>
          </div>
        </div>

        <div className="cyber-card rounded-2xl p-4 mb-8 inline-flex gap-2">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setActivePeriod(period.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activePeriod === period.id
                  ? 'bg-primary text-white neon-glow'
                  : 'text-gray-400 hover:text-white hover:bg-primary/10'
              }`}
            >
              {period.icon}
              {period.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockHotMemes.map((meme) => (
            <MemeCard
              key={meme.id}
              id={meme.id}
              title={meme.title}
              image={meme.image}
              author={meme.author}
              likeCount={meme.likeCount}
              viewCount={meme.viewCount}
              isLiked={meme.isLiked}
              showRank={true}
              rank={meme.rank}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hotlist;

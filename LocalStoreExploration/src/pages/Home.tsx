import { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import MapView from '../components/MapView';
import CategoryFilter from '../components/CategoryFilter';
import NoteCard from '../components/NoteCard';
import { Note } from '../types';
import { api } from '../services/api';
import { useMapStore } from '../store/useMapStore';

// Mock data for demo
const mockNotes: Note[] = [
  {
    id: 1,
    userId: 1,
    shopId: 1,
    title: '超赞的火锅店！必点毛肚和肥牛',
    content: '今天来打卡这家网红火锅店，环境真的太棒了！毛肚特别新鲜，七上八下之后口感脆嫩。肥牛也是入口即化，麻辣锅底味道正宗。',
    images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop'],
    ratingOverall: 4.8,
    ratingTaste: 5,
    ratingEnv: 4.5,
    ratingService: 4.7,
    ratingCost: 4.2,
    lat: 39.9087,
    lng: 116.4474,
    address: '北京市朝阳区建国路88号',
    category: '火锅',
    status: 'approved',
    viewsCount: 2345,
    likesCount: 186,
    commentsCount: 45,
    createdAt: '2024-01-15T10:00:00Z',
    user: {
      id: 1,
      username: 'daren1',
      nickname: '美食达人小王',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      bio: '专注美食探店10年',
      followersCount: 12580,
      notesCount: 156,
      isVerified: 1,
      createdAt: '2023-01-01T00:00:00Z',
    },
    shop: {
      id: 1,
      name: '老王火锅店',
      address: '北京市朝阳区建国路88号',
      phone: '010-88888888',
      category: '火锅',
      coverImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
      images: [],
      rating: 4.8,
      lat: 39.9087,
      lng: 116.4474,
      businessHours: '10:00-22:00',
      notesCount: 36,
      averageCost: 128,
    },
    distance: 0.5,
  },
  {
    id: 2,
    userId: 1,
    shopId: 2,
    title: '隐秘的日式居酒屋，氛围感满分',
    content: '和朋友偶然发现的一家居酒屋，藏在三里屯的小巷子里。店内装修很有日本风情，烧鸟做得特别正宗，清酒种类也很多。',
    images: ['https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop'],
    ratingOverall: 4.6,
    ratingTaste: 4.5,
    ratingEnv: 4.8,
    ratingService: 4.5,
    ratingCost: 4.3,
    lat: 39.934,
    lng: 116.453,
    address: '北京市朝阳区三里屯路19号',
    category: '日料',
    status: 'approved',
    viewsCount: 1876,
    likesCount: 142,
    commentsCount: 32,
    createdAt: '2024-01-14T10:00:00Z',
    user: {
      id: 1,
      username: 'daren1',
      nickname: '美食达人小王',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      bio: '专注美食探店10年',
      followersCount: 12580,
      notesCount: 156,
      isVerified: 1,
      createdAt: '2023-01-01T00:00:00Z',
    },
    shop: {
      id: 2,
      name: '日式居酒屋',
      address: '北京市朝阳区三里屯路19号',
      phone: '010-66666666',
      category: '日料',
      coverImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
      images: [],
      rating: 4.6,
      lat: 39.934,
      lng: 116.453,
      businessHours: '11:30-23:00',
      notesCount: 28,
      averageCost: 188,
    },
    distance: 1.2,
  },
  {
    id: 4,
    userId: 2,
    shopId: 5,
    title: '这家甜品店也太好拍了吧！',
    content: '被闺蜜种草的甜品店，果然名不虚传！草莓蛋糕颜值超高，拍照巨好看，味道也很赞，奶油一点都不腻。',
    images: ['https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&h=600&fit=crop'],
    ratingOverall: 4.9,
    ratingTaste: 5,
    ratingEnv: 4.8,
    ratingService: 4.9,
    ratingCost: 4.7,
    lat: 39.9143,
    lng: 116.4104,
    address: '北京市东城区王府井大街88号',
    category: '甜品',
    status: 'approved',
    viewsCount: 3256,
    likesCount: 287,
    commentsCount: 65,
    createdAt: '2024-01-12T10:00:00Z',
    user: {
      id: 2,
      username: 'daren2',
      nickname: '探店达人小美',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      bio: '颜值与美食并存',
      followersCount: 8950,
      notesCount: 89,
      isVerified: 1,
      createdAt: '2023-02-01T00:00:00Z',
    },
    shop: {
      id: 5,
      name: '甜品屋',
      address: '北京市东城区王府井大街88号',
      phone: '010-99999999',
      category: '甜品',
      coverImage: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop',
      images: [],
      rating: 4.9,
      lat: 39.9143,
      lng: 116.4104,
      businessHours: '10:00-22:00',
      notesCount: 67,
      averageCost: 45,
    },
    distance: 2.3,
  },
  {
    id: 3,
    userId: 2,
    shopId: 3,
    title: '中关村宝藏咖啡店，拿铁绝了',
    content: '在中关村发现的宝藏咖啡店！店面不大但装修很有格调，手冲咖啡香味浓郁，拉花也很漂亮。',
    images: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop'],
    ratingOverall: 4.5,
    ratingTaste: 4.6,
    ratingEnv: 4.7,
    ratingService: 4.3,
    ratingCost: 4.2,
    lat: 39.9842,
    lng: 116.316,
    address: '北京市海淀区中关村大街1号',
    category: '咖啡',
    status: 'approved',
    viewsCount: 1543,
    likesCount: 98,
    commentsCount: 28,
    createdAt: '2024-01-13T10:00:00Z',
    user: {
      id: 2,
      username: 'daren2',
      nickname: '探店达人小美',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      bio: '颜值与美食并存',
      followersCount: 8950,
      notesCount: 89,
      isVerified: 1,
      createdAt: '2023-02-01T00:00:00Z',
    },
    shop: {
      id: 3,
      name: '咖啡时光',
      address: '北京市海淀区中关村大街1号',
      phone: '010-55555555',
      category: '咖啡',
      coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
      images: [],
      rating: 4.5,
      lat: 39.9842,
      lng: 116.316,
      businessHours: '08:00-21:00',
      notesCount: 45,
      averageCost: 58,
    },
    distance: 3.1,
  },
];

export default function Home() {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [loading, setLoading] = useState(false);
  const { center, selectedCategory } = useMapStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const filtered = selectedCategory === 'all' 
          ? mockNotes 
          : mockNotes.filter(n => n.category === selectedCategory);
        setNotes(filtered);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 pt-8 pb-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">发现美食</h1>
            <p className="text-orange-100 text-sm mt-1">探索身边的好店</p>
          </div>
          <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索店铺、美食..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>

      <div className="px-4 -mt-4">
        <MapView notes={notes} center={center} />
      </div>

      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">附近探店</h2>
          <div className="flex items-center text-orange-500 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            5km内
          </div>
        </div>

        <div className="mb-4">
          <CategoryFilter />
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">加载中...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

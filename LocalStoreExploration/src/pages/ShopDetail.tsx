import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Clock, Star, Heart, Bookmark, ChevronRight } from 'lucide-react';
import NoteCard from '../components/NoteCard';
import { Note, Shop } from '../types';
import { api } from '../services/api';

const mockShop: Shop = {
  id: 1,
  name: '老王火锅店',
  address: '北京市朝阳区建国路88号SOHO现代城底商',
  phone: '010-88888888',
  category: '火锅',
  coverImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=400&fit=crop',
  images: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
  ],
  rating: 4.8,
  lat: 39.9087,
  lng: 116.4474,
  businessHours: '10:00-22:00',
  notesCount: 36,
  averageCost: 128,
};

const mockNotes: Note[] = [
  {
    id: 1,
    userId: 1,
    shopId: 1,
    title: '超赞的火锅店！必点毛肚和肥牛',
    content: '今天来打卡这家网红火锅店，环境真的太棒了！毛肚特别新鲜...',
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
    shop: mockShop,
  },
  {
    id: 6,
    userId: 3,
    shopId: 1,
    title: '第二次来还是那么好吃！',
    content: '二刷老王火锅店，这次尝试了新出的番茄锅底，味道浓郁...',
    images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop'],
    ratingOverall: 4.7,
    ratingTaste: 4.8,
    ratingEnv: 4.6,
    ratingService: 4.8,
    ratingCost: 4.3,
    lat: 39.9087,
    lng: 116.4474,
    address: '北京市朝阳区建国路88号',
    category: '火锅',
    status: 'approved',
    viewsCount: 1678,
    likesCount: 123,
    commentsCount: 35,
    createdAt: '2024-01-10T10:00:00Z',
    user: {
      id: 3,
      username: 'daren3',
      nickname: '吃货老张',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      bio: '不是在吃，就是在去吃的路上',
      followersCount: 5680,
      notesCount: 72,
      isVerified: 1,
      createdAt: '2023-03-01T00:00:00Z',
    },
    shop: mockShop,
  },
];

export default function ShopDetail() {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<Shop>(mockShop);
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setShop(mockShop);
        setNotes(mockNotes);
      } catch (error) {
        console.error('Failed to fetch shop:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="relative">
        <img
          src={shop.coverImage}
          alt={shop.name}
          className="w-full h-56 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Link
          to="/"
          className="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-white mb-2">{shop.name}</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-semibold">{shop.rating}</span>
            </div>
            <span className="text-white/80">·</span>
            <span className="text-white">¥{shop.averageCost}/人</span>
            <span className="text-white/80">·</span>
            <span className="text-white">{shop.category}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 bg-white">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-gray-700">{shop.address}</p>
              <p className="text-sm text-gray-400 mt-1">距离 1.2km</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <p className="text-gray-700">{shop.phone}</p>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <p className="text-gray-700">{shop.businessHours}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 bg-white px-4 py-4">
        <h3 className="font-semibold text-gray-900 mb-3">店铺环境</h3>
        <div className="flex gap-2 overflow-x-auto">
          {shop.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`店铺图片${index + 1}`}
              className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
            />
          ))}
        </div>
      </div>

      <div className="mt-3 bg-white">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">探店笔记 ({shop.notesCount})</h3>
            <button className="text-orange-500 text-sm">查看全部</button>
          </div>
        </div>

        <div className="px-4 py-2 flex gap-2 overflow-x-auto">
          {['全部', '最新', '好评', '差评'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm flex-shrink-0 transition-all ${
                activeTab === tab
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className={`flex flex-col items-center ${
            isFavorited ? 'text-orange-500' : 'text-gray-500'
          }`}
        >
          <Heart className={`w-6 h-6 ${isFavorited ? 'fill-orange-500' : ''}`} />
          <span className="text-xs mt-1">收藏</span>
        </button>
        <button className="flex flex-col items-center text-gray-500">
          <Bookmark className="w-6 h-6" />
          <span className="text-xs mt-1">想去</span>
        </button>
        <button className="flex-1 py-3 bg-orange-500 text-white font-medium rounded-full">
          发布探店
        </button>
      </div>
    </div>
  );
}

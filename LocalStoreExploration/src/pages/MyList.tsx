import { useState } from 'react';
import { Bookmark, Check, MapPin, Star } from 'lucide-react';
import { Note, Shop } from '../types';
import { Link } from 'react-router-dom';

const mockWantNotes: Note[] = [
  {
    id: 1,
    userId: 1,
    shopId: 1,
    title: '超赞的火锅店！必点毛肚和肥牛',
    content: '今天来打卡这家网红火锅店...',
    images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop'],
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
  },
];

const mockWantShops: Shop[] = [
  {
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
  {
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
];

export default function MyList() {
  const [activeTab, setActiveTab] = useState<'want' | 'visited'>('want');
  const [activeType, setActiveType] = useState<'note' | 'shop'>('shop');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 pt-8 pb-6 px-4">
        <h1 className="text-2xl font-bold text-white">我的清单</h1>
        <p className="text-orange-100 text-sm mt-1">收藏的好店都在这里</p>
      </div>

      <div className="bg-white px-4">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'want', label: '想去', count: mockWantShops.length + mockWantNotes.length },
            { key: 'visited', label: '已打卡', count: 0 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'want' | 'visited')}
              className={`flex-1 py-4 text-center font-medium transition-all relative ${
                activeTab === tab.key
                  ? 'text-orange-500'
                  : 'text-gray-500'
              }`}
            >
              {tab.label} ({tab.count})
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-4 py-3">
          <button
            onClick={() => setActiveType('shop')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeType === 'shop'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            店铺
          </button>
          <button
            onClick={() => setActiveType('note')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeType === 'note'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            笔记
          </button>
        </div>
      </div>

      {activeTab === 'want' ? (
        <div className="p-4">
          {activeType === 'shop' ? (
            <div className="space-y-3">
              {mockWantShops.map((shop) => (
                <Link
                  key={shop.id}
                  to={`/shop/${shop.id}`}
                  className="flex gap-4 bg-white p-4 rounded-xl"
                >
                  <img
                    src={shop.coverImage}
                    alt={shop.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                      <span>{shop.rating}</span>
                      <span>·</span>
                      <span>¥{shop.averageCost}/人</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{shop.address}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded">
                        {shop.category}
                      </span>
                    </div>
                  </div>
                  <Bookmark className="w-6 h-6 text-orange-500 fill-orange-500" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {mockWantNotes.map((note) => (
                <Link
                  key={note.id}
                  to={`/note/${note.id}`}
                  className="flex gap-4 bg-white p-4 rounded-xl"
                >
                  <img
                    src={note.images[0]}
                    alt={note.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                      <span>{note.ratingOverall}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={note.user.avatar}
                        alt={note.user.nickname}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-xs text-gray-500">
                        {note.user.nickname}
                      </span>
                    </div>
                  </div>
                  <Bookmark className="w-6 h-6 text-orange-500 fill-orange-500" />
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <Check className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500">还没有打卡记录</p>
          <p className="text-gray-400 text-sm mt-1">快去探索美食吧！</p>
        </div>
      )}
    </div>
  );
}

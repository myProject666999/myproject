import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, MapPin, Camera, Star, Search } from 'lucide-react';

const CATEGORIES = ['火锅', '日料', '咖啡', '川菜', '甜品', '烧烤', '西餐', '其他'];
const RATING_LABELS = ['口味', '环境', '服务', '性价比'];

export default function Publish() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [shopSearch, setShopSearch] = useState('');
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [ratings, setRatings] = useState({
    taste: 5,
    environment: 5,
    service: 5,
    cost: 5,
  });

  const handleAddImage = () => {
    const newImage = `https://picsum.photos/800/600?random=${Date.now()}`;
    setImages([...images, newImage]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    alert('发布成功！笔记将在审核后展示');
    navigate('/');
  };

  const overallRating =
    (ratings.taste + ratings.environment + ratings.service + ratings.cost) / 4;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-semibold">发布探店</h1>
        <button
          onClick={handleSubmit}
          disabled={!title || !content || images.length === 0 || !selectedShop}
          className="px-6 py-2 bg-orange-500 text-white rounded-full font-medium disabled:bg-gray-300"
        >
          发布
        </button>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            上传图片 ({images.length}/9)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt=""
                  className="w-full aspect-square rounded-xl object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            {images.length < 9 && (
              <button
                onClick={handleAddImage}
                className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400"
              >
                <Camera className="w-8 h-8" />
                <span className="text-xs mt-1">添加图片</span>
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="写下吸引人的标题..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            探店内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的探店体验..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            评分
            <span className="text-orange-500 ml-2">
              综合 {overallRating.toFixed(1)} 分
            </span>
          </label>
          <div className="space-y-3">
            {RATING_LABELS.map((label, index) => {
              const key = ['taste', 'environment', 'service', 'cost'][index] as keyof typeof ratings;
              return (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-gray-600">{label}</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRatings({ ...ratings, [key]: star })}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= ratings[key]
                              ? 'text-orange-500 fill-orange-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            选择店铺
          </label>
          {!selectedShop ? (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={shopSearch}
                onChange={(e) => setShopSearch(e.target.value)}
                placeholder="搜索店铺名称..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              {shopSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto z-20">
                  {['老王火锅店', '日式居酒屋', '咖啡时光', '甜品屋'].map((shop) => (
                    <button
                      key={shop}
                      onClick={() => setSelectedShop({ name: shop, address: '北京市朝阳区...' })}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{shop}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">{selectedShop.name}</p>
                  <p className="text-sm text-gray-500">{selectedShop.address}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedShop(null)}
                className="text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            品类
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  category === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

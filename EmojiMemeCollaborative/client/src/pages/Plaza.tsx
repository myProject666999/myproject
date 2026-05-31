import { useState } from 'react';
import { Search, Grid3X3, LayoutList, Sparkles } from 'lucide-react';
import TemplateCard from '../components/TemplateCard';

const categories = ['全部', '搞笑', '动漫', '影视', '游戏', '动物', '职场'];

const mockTemplates = [
  { id: 1, title: '震惊脸模板', image: 'https://picsum.photos/400/300?random=1', category: '搞笑', useCount: 1234, likeCount: 567 },
  { id: 2, title: '猫咪疑惑表情包', image: 'https://picsum.photos/400/300?random=2', category: '动物', useCount: 987, likeCount: 432 },
  { id: 3, title: '熊猫头模板', image: 'https://picsum.photos/400/300?random=3', category: '搞笑', useCount: 2345, likeCount: 890 },
  { id: 4, title: '动漫表情包', image: 'https://picsum.photos/400/300?random=4', category: '动漫', useCount: 567, likeCount: 234 },
  { id: 5, title: '职场打工人', image: 'https://picsum.photos/400/300?random=5', category: '职场', useCount: 1567, likeCount: 678 },
  { id: 6, title: '游戏名场面', image: 'https://picsum.photos/400/300?random=6', category: '游戏', useCount: 890, likeCount: 345 },
  { id: 7, title: '影视经典', image: 'https://picsum.photos/400/300?random=7', category: '影视', useCount: 2100, likeCount: 789 },
  { id: 8, title: '柴犬表情包', image: 'https://picsum.photos/400/300?random=8', category: '动物', useCount: 1456, likeCount: 567 },
];

const Plaza = () => {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredTemplates = mockTemplates.filter((template) => {
    const matchesCategory = activeCategory === '全部' || template.category === activeCategory;
    const matchesSearch = template.title.includes(searchText);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-glow">素材广场</h1>
              <p className="text-gray-400">海量梗图模板，一键创作</p>
            </div>
          </div>
        </div>

        <div className="cyber-card rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索模板..."
                className="w-full pl-12 pr-4 py-3 cyber-input rounded-xl text-base"
              />
            </div>

            <div className="flex items-center gap-1 bg-dark/60 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-md transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="网格视图"
              >
                <Grid3X3 size={18} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-md transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="列表视图"
              >
                <LayoutList size={18} />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-primary text-white neon-glow'
                    : 'bg-dark/50 text-gray-400 hover:text-white hover:bg-primary/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} {...template} viewMode="grid" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} {...template} viewMode="list" />
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-400">没有找到相关模板</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Plaza;

import { useState } from 'react';
import { Smile, Search, X } from 'lucide-react';

interface Sticker {
  id: number;
  emoji: string;
  category: string;
}

interface StickerPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const categories = ['全部', '表情', '手势', '动物', '食物', '物品'];

const allStickers: Sticker[] = [
  { id: 1, emoji: '😂', category: '表情' },
  { id: 2, emoji: '🤣', category: '表情' },
  { id: 3, emoji: '😭', category: '表情' },
  { id: 4, emoji: '😍', category: '表情' },
  { id: 5, emoji: '🥺', category: '表情' },
  { id: 6, emoji: '😡', category: '表情' },
  { id: 7, emoji: '🤔', category: '表情' },
  { id: 8, emoji: '😏', category: '表情' },
  { id: 9, emoji: '🙄', category: '表情' },
  { id: 10, emoji: '😱', category: '表情' },
  { id: 11, emoji: '👍', category: '手势' },
  { id: 12, emoji: '👎', category: '手势' },
  { id: 13, emoji: '👏', category: '手势' },
  { id: 14, emoji: '🙌', category: '手势' },
  { id: 15, emoji: '✌️', category: '手势' },
  { id: 16, emoji: '🤝', category: '手势' },
  { id: 17, emoji: '💪', category: '手势' },
  { id: 18, emoji: '🙏', category: '手势' },
  { id: 19, emoji: '🐶', category: '动物' },
  { id: 20, emoji: '🐱', category: '动物' },
  { id: 21, emoji: '🐼', category: '动物' },
  { id: 22, emoji: '🦊', category: '动物' },
  { id: 23, emoji: '🐸', category: '动物' },
  { id: 24, emoji: '🐔', category: '动物' },
  { id: 25, emoji: '🍕', category: '食物' },
  { id: 26, emoji: '🍔', category: '食物' },
  { id: 27, emoji: '🍟', category: '食物' },
  { id: 28, emoji: '☕', category: '食物' },
  { id: 29, emoji: '🍺', category: '食物' },
  { id: 30, emoji: '🎂', category: '食物' },
  { id: 31, emoji: '💯', category: '物品' },
  { id: 32, emoji: '🔥', category: '物品' },
  { id: 33, emoji: '💀', category: '物品' },
  { id: 34, emoji: '🎉', category: '物品' },
  { id: 35, emoji: '❤️', category: '物品' },
  { id: 36, emoji: '💔', category: '物品' },
  { id: 37, emoji: '⭐', category: '物品' },
  { id: 38, emoji: '🌈', category: '物品' },
  { id: 39, emoji: '🚀', category: '物品' },
  { id: 40, emoji: '💣', category: '物品' },
];

const StickerPicker = ({ onSelect, onClose }: StickerPickerProps) => {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchText, setSearchText] = useState('');

  const filteredStickers = allStickers.filter((sticker) => {
    const matchesCategory = activeCategory === '全部' || sticker.category === activeCategory;
    const matchesSearch = sticker.emoji.includes(searchText) || sticker.category.includes(searchText);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="cyber-card rounded-xl w-80 overflow-hidden">
      <div className="p-3 border-b border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Smile size={18} className="text-primary" />
            <span className="font-semibold">选择贴纸</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-primary/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索贴纸..."
            className="w-full pl-9 pr-4 py-2 text-sm cyber-input rounded-lg"
          />
        </div>
      </div>

      <div className="p-2 border-b border-primary/20">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                activeCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-dark/50 text-gray-400 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-6 gap-2">
          {filteredStickers.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => onSelect(sticker.emoji)}
              className="w-10 h-10 flex items-center justify-center text-2xl rounded-lg hover:bg-primary/20 transition-colors hover:scale-110"
            >
              {sticker.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StickerPicker;

import { CATEGORIES } from '../types';
import { useMapStore } from '../store/useMapStore';

export default function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = useMapStore();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(category.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === category.id
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="mr-1">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  );
}

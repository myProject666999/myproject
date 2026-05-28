import { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Tag,
  Modal,
  Empty,
  Spin,
  Row,
  Col,
  Tabs,
  Descriptions,
} from 'antd';
import { Search, X, Flame, Apple, Beef, Leaf, Cherry, Milk, Cookie, Coffee } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import type { Food } from '../../types';

const { Search: SearchInput } = Input;

const categories = [
  { key: 'all', label: '全部', icon: null },
  { key: '主食', label: '主食', icon: null },
  { key: '肉类', label: '肉类', icon: Beef },
  { key: '蔬菜', label: '蔬菜', icon: Leaf },
  { key: '水果', label: '水果', icon: Cherry },
  { key: '乳制品', label: '乳制品', icon: Milk },
  { key: '零食', label: '零食', icon: Cookie },
  { key: '饮料', label: '饮料', icon: Coffee },
];

const categoryIcons: Record<string, any> = {
  '主食': Apple,
  '肉类': Beef,
  '蔬菜': Leaf,
  '水果': Cherry,
  '乳制品': Milk,
  '零食': Cookie,
  '饮料': Coffee,
};

const categoryColors: Record<string, string> = {
  '主食': '#F59E0B',
  '肉类': '#EF4444',
  '蔬菜': '#10B981',
  '水果': '#EC4899',
  '乳制品': '#3B82F6',
  '零食': '#F97316',
  '饮料': '#8B5CF6',
};

const FoodLibrary = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { fetchFoods, foods, loading } = useDataStore();

  useEffect(() => {
    const category = selectedCategory === 'all' ? undefined : selectedCategory;
    fetchFoods(searchKeyword || undefined, category);
  }, [fetchFoods, searchKeyword, selectedCategory]);

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleViewDetail = (food: Food) => {
    setSelectedFood(food);
    setIsDetailModalOpen(true);
  };

  const filteredFoods = selectedCategory === 'all'
    ? foods
    : foods.filter((food) => food.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">食物库</h1>
        <p className="text-gray-500">浏览和查询各种食物的营养成分信息</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="搜索食物名称..."
            allowClear
            enterButton={<Button type="primary" icon={<Search size={18} />} />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.key}
            type={selectedCategory === cat.key ? 'primary' : 'default'}
            onClick={() => handleCategoryClick(cat.key)}
            className={
              selectedCategory === cat.key
                ? 'bg-primary-500 border-primary-500 hover:bg-primary-600'
                : ''
            }
          >
            {cat.icon && <cat.icon size={16} className="mr-1" />}
            {cat.label}
          </Button>
        ))}
      </div>

      {filteredFoods.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredFoods.map((food) => {
            const IconComponent = categoryIcons[food.category] || Apple;
            const color = categoryColors[food.category] || '#6B7280';
            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={food.id}>
                <Card
                  className="h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
                  onClick={() => handleViewDetail(food)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <IconComponent size={28} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">{food.name}</h3>
                      </div>
                      <Tag color={color} className="m-0 mb-2">
                        {food.category}
                      </Tag>
                      <div className="flex items-center gap-1 text-orange-500">
                        <Flame size={14} />
                        <span className="font-semibold">{food.calories_per_100g} kcal</span>
                        <span className="text-gray-400 text-sm">/ 100g</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">蛋白质</p>
                      <p className="font-semibold text-green-600">{food.protein}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">脂肪</p>
                      <p className="font-semibold text-blue-600">{food.fat}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">碳水</p>
                      <p className="font-semibold text-orange-600">{food.carbs}g</p>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Empty description="未找到相关食物" />
      )}

      <Modal
        title={selectedFood?.name || '食物详情'}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={600}
        closeIcon={<X size={20} />}
      >
        {selectedFood && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: `${categoryColors[selectedFood.category] || '#6B7280'}15`,
                }}
              >
                {(() => {
                  const IconComponent = categoryIcons[selectedFood.category] || Apple;
                  return (
                    <IconComponent
                      size={32}
                      style={{ color: categoryColors[selectedFood.category] || '#6B7280' }}
                    />
                  );
                })()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedFood.name}</h2>
                <Tag color={categoryColors[selectedFood.category] || 'default'}>
                  {selectedFood.category}
                </Tag>
              </div>
            </div>

            <Card className="bg-gray-50 border-0">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">每 100g 热量</p>
                <p className="text-4xl font-bold text-orange-500">
                  {selectedFood.calories_per_100g}
                  <span className="text-lg ml-1">kcal</span>
                </p>
              </div>
            </Card>

            <Descriptions
              title="营养成分 (每100g)"
              bordered
              column={2}
              size="middle"
            >
              <Descriptions.Item label="蛋白质">
                <span className="font-semibold text-green-600">{selectedFood.protein} g</span>
              </Descriptions.Item>
              <Descriptions.Item label="脂肪">
                <span className="font-semibold text-blue-600">{selectedFood.fat} g</span>
              </Descriptions.Item>
              <Descriptions.Item label="碳水化合物">
                <span className="font-semibold text-orange-600">{selectedFood.carbs} g</span>
              </Descriptions.Item>
              <Descriptions.Item label="膳食纤维">
                <span className="font-semibold text-purple-600">{selectedFood.fiber} g</span>
              </Descriptions.Item>
              <Descriptions.Item label="单位" span={2}>
                {selectedFood.unit}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FoodLibrary;

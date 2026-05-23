'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Template {
  id: number;
  name: string;
  category: string;
  preview_image: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  font_family: string;
  layout_type: string;
  animation_style: string;
}

const categories = [
  { key: 'all', label: '全部' },
  { key: 'wedding', label: '婚礼' },
  { key: 'birthday', label: '生日' },
  { key: 'party', label: '派对' },
];

export default function Home() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/templates?category=${selectedCategory}`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    router.push(`/create?templateId=${template.id}`);
  };

  const handleViewInvitation = () => {
    router.push('/invitation/abc123');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent mb-4">
              在线邀请函
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              精美模板，一键生成，让每一份邀请都充满仪式感
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewInvitation}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-shadow"
            >
              查看示例邀请函
            </motion.button>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <motion.button
                key={category.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.key
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category.label}
              </motion.button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow"
                    style={{ backgroundColor: template.background_color }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <div
                        className="w-16 h-16 rounded-full mb-4 flex items-center justify-center"
                        style={{ backgroundColor: template.accent_color }}
                      >
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </div>
                      <div
                        className="text-xl font-bold text-center"
                        style={{ color: template.text_color, fontFamily: template.font_family }}
                      >
                        {template.name}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className="opacity-0 group-hover:opacity-100 bg-white/90 px-4 py-2 rounded-full text-sm font-medium text-gray-700"
                      >
                        选择此模板
                      </motion.div>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <h3 className="font-medium text-gray-800">{template.name}</h3>
                    <p className="text-sm text-gray-500">
                      {categories.find((c) => c.key === template.category)?.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">核心功能</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🎨', title: '精美模板', desc: '多种风格，满足不同场合需求' },
              { icon: '✏️', title: '个性定制', desc: '自由编辑文字、图片、音乐' },
              { icon: '📍', title: '地图导航', desc: '一键导航，准时赴约' },
              { icon: '📝', title: '报名收集', desc: '实时统计，轻松管理宾客' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 text-center text-gray-500 text-sm border-t border-gray-100">
        <p>© 2026 在线邀请函系统 | 让每一份邀请都充满仪式感</p>
      </footer>
    </main>
  );
}

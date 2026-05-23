'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Blessing {
  id: number;
  name: string;
  message: string;
  avatar_color: string;
  created_at: string;
}

export default function BlessingList() {
  const [blessings, setBlessings] = useState<Blessing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlessings();
  }, []);

  const fetchBlessings = async () => {
    try {
      const res = await fetch('/api/blessings');
      const data = await res.json();
      if (data.success) {
        setBlessings(data.data);
      }
    } catch (error) {
      console.error('获取祝福失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (blessings.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">还没有祝福，成为第一个送上祝福的人吧！</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blessings.map((blessing, index) => (
        <motion.div
          key={blessing.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ backgroundColor: blessing.avatar_color }}
            >
              {getInitials(blessing.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">
                {blessing.name}
              </h3>
              <p className="text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap break-words">
                {blessing.message}
              </p>
              <p className="text-xs text-gray-400 mt-3">
                {new Date(blessing.created_at).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

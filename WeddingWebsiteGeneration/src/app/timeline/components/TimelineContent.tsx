'use client';

import { Heart, Star } from 'lucide-react';

const timelineEvents = [
  {
    date: '2020年9月',
    title: '初次相遇',
    description: '在大学图书馆的同一排书架前，我们的手同时伸向了同一本书。那是我们故事的开始。',
    icon: Star,
  },
  {
    date: '2020年12月',
    title: '成为朋友',
    description: '从共同的兴趣爱好开始，我们逐渐了解彼此，成为了无话不谈的朋友。',
    icon: Heart,
  },
  {
    date: '2021年3月14日',
    title: '确定关系',
    description: '樱花盛开的季节，在漫天飞舞的花瓣中，你问我愿不愿意做你的女朋友。',
    icon: Heart,
  },
  {
    date: '2022年6月',
    title: '第一次旅行',
    description: '我们一起去看了海，在海边的夕阳下许下了许多美好的愿望。',
    icon: Star,
  },
  {
    date: '2023年10月',
    title: '搬到一起住',
    description: '我们有了属于我们的小窝，开始了柴米油盐的日常，也更加了解彼此。',
    icon: Heart,
  },
  {
    date: '2024年12月',
    title: '见家长',
    description: '紧张又期待地见了双方父母，得到了他们的认可和祝福。',
    icon: Star,
  },
  {
    date: '2025年2月14日',
    title: '求婚成功',
    description: '在山顶的璀璨星空下，你单膝跪地，为我戴上了那枚闪耀的戒指。',
    icon: Heart,
  },
  {
    date: '2025年10月1日',
    title: '婚礼',
    description: '我们将在这一天，在所有亲朋好友的见证下，正式成为彼此的家人。',
    icon: Star,
  },
];

export default function TimelineContent() {
  return (
    <div className="relative">
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-gold/20 via-rose-gold/40 to-rose-gold/20 hidden md:block" />

      <div className="space-y-12">
        {timelineEvents.map((event, index) => (
          <div
            key={index}
            className={`relative flex flex-col md:flex-row items-center gap-8 ${
              index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
          >
            <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-rose-gold/10 hover:shadow-xl transition-shadow">
                <p className="text-rose-gold font-medium text-sm mb-2">{event.date}</p>
                <h3 className="font-serif text-2xl text-gray-800 mb-3">{event.title}</h3>
                <p className="text-gray-600 leading-relaxed">{event.description}</p>
              </div>
            </div>

            <div className="relative z-10 w-12 h-12 rounded-full bg-white border-2 border-rose-gold flex items-center justify-center shadow-lg">
              <event.icon className="w-5 h-5 text-rose-gold" fill="currentColor" />
            </div>

            <div className="flex-1 hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

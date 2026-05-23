'use client';

import { MapPin, Clock, Utensils, Heart, Camera } from 'lucide-react';

const scheduleItems = [
  {
    time: '09:30 - 10:00',
    title: '迎宾签到',
    location: '酒店大堂',
    description: '宾客签到并领取伴手礼',
    icon: Clock,
  },
  {
    time: '10:00 - 11:30',
    title: '婚礼仪式',
    location: '主礼堂',
    description: '新人入场、交换戒指、宣誓仪式',
    icon: Heart,
  },
  {
    time: '11:30 - 12:00',
    title: '合影留念',
    location: '礼堂外花园',
    description: '与新人合影留念',
    icon: Camera,
  },
  {
    time: '12:00 - 14:00',
    title: '婚宴午宴',
    location: '宴会厅',
    description: '喜宴及敬酒环节',
    icon: Utensils,
  },
  {
    time: '14:00 - 14:30',
    title: '恭送宾客',
    location: '酒店门口',
    description: '新人及家人恭送宾客',
    icon: Heart,
  },
];

export default function ScheduleContent() {
  return (
    <div className="space-y-6">
      {scheduleItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-lg p-6 border border-rose-gold/10 hover:shadow-xl transition-shadow"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 md:w-48">
              <div className="w-12 h-12 rounded-xl bg-rose-gold/10 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-rose-gold" />
              </div>
              <div>
                <p className="text-rose-gold font-medium text-sm">{item.time}</p>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="font-serif text-2xl text-gray-800 mb-2">{item.title}</h3>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <MapPin className="w-4 h-4" />
                <span>{item.location}</span>
              </div>
              <p className="text-gray-600">{item.description}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-12 text-center p-8 bg-gradient-to-r from-rose-gold/10 to-blush-light rounded-2xl">
        <p className="text-gray-600 mb-2">婚礼地点</p>
        <h3 className="font-serif text-2xl text-gray-800 mb-2">上海外滩花园酒店</h3>
        <p className="text-gray-500 text-sm">上海市黄浦区中山东一路18号</p>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Calendar, Image, Users, MessageSquare, Clock, ArrowRight } from 'lucide-react';

const quickLinks = [
  { href: '/timeline', title: '时间轴', desc: '回顾我们的故事', icon: Clock, color: 'from-rose-gold/20 to-blush-light' },
  { href: '/gallery', title: '相册', desc: '珍藏美好瞬间', icon: Image, color: 'from-blush-light to-rose-gold/10' },
  { href: '/schedule', title: '婚礼日程', desc: '当天安排一览', icon: Calendar, color: 'from-rose-gold/10 to-cream' },
  { href: '/rsvp', title: '宾客回执', desc: '期待您的出席', icon: Users, color: 'from-cream to-rose-gold/20' },
  { href: '/messages', title: '留言祝福', desc: '写下您的祝福', icon: MessageSquare, color: 'from-rose-gold/20 to-blush-light/50' },
];

export default function QuickNav() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-gray-500 tracking-[0.2em] uppercase text-sm mb-2">Explore</p>
          <h2 className="font-serif text-4xl md:text-5xl text-gray-800">探索更多</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br ${link.color} border border-rose-gold/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                  <link.icon className="w-6 h-6 text-rose-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl text-gray-800 mb-1">{link.title}</h3>
                  <p className="text-sm text-gray-600">{link.desc}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center text-rose-gold text-sm font-medium">
                <span>了解更多</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

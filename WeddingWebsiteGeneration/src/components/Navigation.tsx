'use client';

import Link from 'next/link';
import { Heart, Calendar, Image, MessageSquare, Clock, Users } from 'lucide-react';

const navItems = [
  { href: '/', label: '首页', icon: Heart },
  { href: '/timeline', label: '时间轴', icon: Clock },
  { href: '/gallery', label: '相册', icon: Image },
  { href: '/schedule', label: '婚礼日程', icon: Calendar },
  { href: '/rsvp', label: 'RSVP', icon: Users },
  { href: '/messages', label: '留言', icon: MessageSquare },
];

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-gold/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-gold" fill="currentColor" />
            <span className="font-serif text-xl text-rose-gold font-semibold">
              Wedding
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-rose-gold transition-colors rounded-lg hover:bg-blush-light/30"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="md:hidden flex items-center gap-2 overflow-x-auto max-w-[200px] pb-1">
            {navItems.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-rose-gold transition-colors flex-shrink-0"
              >
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

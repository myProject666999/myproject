'use client';

import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-rose-gold/10 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-rose-gold" fill="currentColor" />
          <span className="font-serif text-lg text-rose-gold">我们婚礼见</span>
          <Heart className="w-5 h-5 text-rose-gold" fill="currentColor" />
        </div>
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} 专属婚礼邀请函
        </p>
      </div>
    </footer>
  );
}

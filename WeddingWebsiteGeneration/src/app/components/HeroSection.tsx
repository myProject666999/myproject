'use client';

import { Calendar, MapPin, Heart } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blush-light via-cream to-rose-gold/10" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-rose-gold/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blush-light/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-rose-gold/40" />
            <Heart className="w-6 h-6 text-rose-gold" fill="currentColor" />
            <div className="h-px w-16 bg-rose-gold/40" />
          </div>

          <p className="text-gray-500 tracking-[0.3em] uppercase text-sm mb-4">
            我们要结婚啦
          </p>

          <h1 className="font-serif text-6xl md:text-8xl font-light mb-6">
            <span className="text-gradient">小雨</span>
            <span className="mx-4 text-rose-gold">&</span>
            <span className="text-gradient">明阳</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 font-light mb-8">
            2025年10月1日 · 上海外滩花园酒店
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5 text-rose-gold" />
              <span>2025.10.01</span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5 text-rose-gold" />
              <span>上海外滩花园酒店</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <div className="w-24 h-24 rounded-full border-2 border-rose-gold/30 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-serif text-rose-gold">01</div>
                <div className="text-xs text-gray-500">October</div>
              </div>
            </div>
            <div className="w-24 h-24 rounded-full bg-rose-gold/10 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-serif text-rose-gold">10</div>
                <div className="text-xs text-gray-500">Days</div>
              </div>
            </div>
            <div className="w-24 h-24 rounded-full border-2 border-rose-gold/30 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-serif text-rose-gold">00</div>
                <div className="text-xs text-gray-500">Hours</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-rose-gold/40 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-rose-gold/60 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';

export default function LoveStory() {
  return (
    <section className="py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-gray-500 tracking-[0.2em] uppercase text-sm mb-2">Our Story</p>
        <h2 className="font-serif text-4xl md:text-5xl text-gray-800">我们的故事</h2>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="h-px w-8 bg-rose-gold/40" />
          <div className="w-2 h-2 bg-rose-gold rounded-full" />
          <div className="h-px w-8 bg-rose-gold/40" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="order-2 md:order-1">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800"
              alt="初次相遇"
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <p className="text-rose-gold font-serif text-lg mb-2">2020 · 初次相遇</p>
          <h3 className="font-serif text-3xl text-gray-800 mb-4">图书馆的偶然相遇</h3>
          <p className="text-gray-600 leading-relaxed">
            那是一个阳光明媚的午后，我们在大学图书馆的同一排书架前相遇。
            你伸手要拿的书，恰好也是我想找的那本。那一瞬间，我知道，
            有些故事注定要开始了。
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <p className="text-rose-gold font-serif text-lg mb-2">2021 · 确定关系</p>
          <h3 className="font-serif text-3xl text-gray-800 mb-4">樱花树下的告白</h3>
          <p className="text-gray-600 leading-relaxed">
            樱花盛开的季节，你牵着我的手，在漫天飞舞的花瓣中说：
            "做我女朋友好吗？" 我笑着点头，心里的花开得比樱花还要灿烂。
          </p>
        </div>
        <div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800"
              alt="樱花告白"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800"
              alt="求婚"
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <p className="text-rose-gold font-serif text-lg mb-2">2025 · 求婚成功</p>
          <h3 className="font-serif text-3xl text-gray-800 mb-4">星空下的承诺</h3>
          <p className="text-gray-600 leading-relaxed">
            在山顶的璀璨星空下，你单膝跪地，拿出了那枚我期待已久的戒指。
            "嫁给我好吗？" 泪水模糊了我的视线，我拼命地点头。
            从此刻起，我们的故事将开启新的篇章。
          </p>
        </div>
      </div>
    </section>
  );
}

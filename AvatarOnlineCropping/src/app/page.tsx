'use client';

import { Scissors } from 'lucide-react';
import AvatarCanvas from '@/components/AvatarCanvas';
import ImageUploader from '@/components/ImageUploader';
import ShapeSelector from '@/components/ShapeSelector';
import ZoomControl from '@/components/ZoomControl';
import TemplateSelector from '@/components/TemplateSelector';
import ActionBar from '@/components/ActionBar';

export default function HomePage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Scissors className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold text-gradient">头像在线裁剪</h1>
          </div>
          <p className="text-gray-400">上传图片，快速裁剪成精美头像</p>
        </header>
        
        <main className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-6">
            <div className="bg-secondary/50 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center justify-center min-h-[400px]">
                <AvatarCanvas size={400} />
              </div>
            </div>
            
            <ActionBar />
          </div>
          
          <aside className="space-y-6">
            <div className="bg-secondary/50 rounded-2xl p-6 backdrop-blur-sm">
              <ImageUploader />
            </div>
            
            <div className="bg-secondary/50 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <ShapeSelector />
              <ZoomControl />
            </div>
            
            <div className="bg-secondary/50 rounded-2xl p-6 backdrop-blur-sm">
              <TemplateSelector />
            </div>
          </aside>
        </main>
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>拖拽调整位置 · 滚轮缩放 · 选择模板美化</p>
        </footer>
      </div>
    </div>
  );
}

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GalleryContent from './components/GalleryContent';

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gray-500 tracking-[0.2em] uppercase text-sm mb-2">Our Memories</p>
            <h1 className="font-serif text-4xl md:text-5xl text-gray-800">相册</h1>
            <p className="text-gray-600 mt-4">珍藏我们的美好瞬间</p>
          </div>
          <GalleryContent />
        </div>
      </main>
      <Footer />
    </div>
  );
}

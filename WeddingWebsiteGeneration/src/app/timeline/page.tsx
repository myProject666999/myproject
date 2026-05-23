import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import TimelineContent from './components/TimelineContent';

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gray-500 tracking-[0.2em] uppercase text-sm mb-2">Our Journey</p>
            <h1 className="font-serif text-4xl md:text-5xl text-gray-800">时间轴</h1>
            <p className="text-gray-600 mt-4">记录我们的每一个重要时刻</p>
          </div>
          <TimelineContent />
        </div>
      </main>
      <Footer />
    </div>
  );
}

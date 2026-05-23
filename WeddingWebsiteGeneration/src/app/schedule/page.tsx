import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScheduleContent from './components/ScheduleContent';

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gray-500 tracking-[0.2em] uppercase text-sm mb-2">Schedule</p>
            <h1 className="font-serif text-4xl md:text-5xl text-gray-800">婚礼日程</h1>
            <p className="text-gray-600 mt-4">2025年10月1日 · 行程安排</p>
          </div>
          <ScheduleContent />
        </div>
      </main>
      <Footer />
    </div>
  );
}

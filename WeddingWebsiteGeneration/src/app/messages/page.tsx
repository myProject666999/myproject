import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MessagesContent from './components/MessagesContent';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gray-500 tracking-[0.2em] uppercase text-sm mb-2">Wishes</p>
            <h1 className="font-serif text-4xl md:text-5xl text-gray-800">留言祝福</h1>
            <p className="text-gray-600 mt-4">写下您对新人的美好祝福</p>
          </div>
          <MessagesContent />
        </div>
      </main>
      <Footer />
    </div>
  );
}

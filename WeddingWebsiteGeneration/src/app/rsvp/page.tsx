import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import RSVPForm from './components/RSVPForm';

export default function RSVPPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gray-500 tracking-[0.2em] uppercase text-sm mb-2">RSVP</p>
            <h1 className="font-serif text-4xl md:text-5xl text-gray-800">宾客回执</h1>
            <p className="text-gray-600 mt-4">期待您的出席，与我们分享这份喜悦</p>
          </div>
          <RSVPForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}

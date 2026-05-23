import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';
import LoveStory from './components/LoveStory';
import QuickNav from './components/QuickNav';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      <main className="pt-16">
        <HeroSection />
        <LoveStory />
        <QuickNav />
      </main>
      <Footer />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import CreatorCard from '@/components/CreatorCard';
import { mockCreators } from '@/utils/mock';
import type { Creator } from '@/types';

const Home = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCreators(mockCreators);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur 
              rounded-full border border-primary-100 mb-6">
              <Sparkles className="w-4 h-4 text-accent-500" />
              <span className="text-sm font-medium text-neutral-600">发现优质创作者，支持你喜爱的内容</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent">
                直接支持
              </span>
              <br />
              <span className="text-neutral-800">你喜爱的创作者</span>
            </h1>

            <p className="text-xl text-neutral-500 mb-10 max-w-xl mx-auto">
              加入创作者的会员社区，解锁专属内容和特权。
              按月订阅，随心取消，让创作更有价值。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/creator/1"
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white 
                  font-semibold rounded-2xl hover:shadow-xl hover:shadow-primary-500/25 
                  transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                立即开始
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-white border-2 border-neutral-200 
                  text-neutral-700 font-semibold rounded-2xl hover:bg-neutral-50 
                  transition-all"
              >
                了解更多
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-neutral-800 mb-2">热门创作者</h2>
              <p className="text-neutral-500">发现各领域最受欢迎的内容创作者</p>
            </div>
            <div className="flex items-center gap-2 text-primary-600 font-medium cursor-pointer hover:text-primary-700">
              <TrendingUp className="w-5 h-5" />
              查看全部
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-neutral-100 rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="features" className="py-16 bg-gradient-to-b from-white to-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center text-neutral-800 mb-4">
              为什么选择 CreatorHub？
            </h2>
            <p className="text-center text-neutral-500 mb-12">
              为创作者和粉丝打造的专属订阅平台
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Crown className="w-8 h-8" />,
                  title: '专属内容',
                  desc: '解锁创作者为会员准备的独家内容，包括文章、视频、音频等多种形式',
                },
                {
                  icon: <TrendingUp className="w-8 h-8" />,
                  title: '直接支持',
                  desc: '你的订阅费用直接支持创作者持续创作，平台仅收取10%服务费',
                },
                {
                  icon: <Sparkles className="w-8 h-8" />,
                  title: '会员特权',
                  desc: '加入会员社区，参与直播互动、获得专属徽章和更多会员福利',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-3xl border border-neutral-200 
                    hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 
                    flex items-center justify-center text-white mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-neutral-800 mb-3">{item.title}</h3>
                  <p className="text-neutral-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-neutral-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 
                flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold">CreatorHub</span>
            </div>
            <p className="text-neutral-400 text-sm">
              © 2024 CreatorHub. 让创作更有价值。
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;

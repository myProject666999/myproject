'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

interface Invitation {
  id: number;
  template_id: number;
  title: string;
  subtitle: string;
  host_name: string;
  host_name2: string;
  event_date: string;
  event_time: string;
  location_name: string;
  location_address: string;
  latitude: number;
  longitude: number;
  description: string;
  share_code: string;
  view_count: number;
  template_name: string;
  template_category: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  font_family: string;
  layout_type: string;
  animation_style: string;
  photos: Photo[];
  registration_count: number;
  registrations: Registration[];
}

interface Photo {
  id: number;
  image_url: string;
  caption: string;
}

interface Registration {
  id: number;
  name: string;
  attend_count: number;
  message: string;
  attend_status: number;
  created_at: string;
}

export default function InvitationPage() {
  const router = useRouter();
  const params = useParams();
  const shareCode = params.shareCode as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showRegistrationList, setShowRegistrationList] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    attend_count: 1,
    message: '',
    attend_status: 1,
  });

  useEffect(() => {
    if (shareCode) {
      fetchInvitation();
    }
  }, [shareCode]);

  const fetchInvitation = async () => {
    try {
      const res = await fetch(`/api/invitations?share=${shareCode}`);
      const data = await res.json();
      if (data.success) {
        setInvitation(data.data);
      } else {
        alert(data.message || '邀请函不存在');
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to fetch invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          invitation_id: invitation?.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowRegistrationForm(false);
        setFormData({ name: '', phone: '', attend_count: 1, message: '', attend_status: 1 });
        fetchInvitation();
      } else {
        alert(data.message);
      }
    } catch (error: any) {
      alert(error.message || '提交失败');
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `邀请您参加${invitation?.host_name}${invitation?.host_name2 ? ' 和 ' + invitation.host_name2 : ''}的${invitation?.template_category === 'wedding' ? '婚礼' : invitation?.template_category === 'birthday' ? '生日派对' : '活动'}！`;

    if (platform === 'copy') {
      await navigator.clipboard.writeText(url);
      alert('链接已复制到剪贴板！');
    } else if (platform === 'wechat') {
      alert('请复制链接后分享到微信');
    } else if (platform === 'qq') {
      window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'weibo') {
      window.open(`https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`, '_blank');
    }
    setShowShareMenu(false);
  };

  const handleNavigate = () => {
    if (invitation?.latitude && invitation?.longitude) {
      const url = `https://uri.amap.com/navigation?to=${invitation.longitude},${invitation.latitude},${encodeURIComponent(invitation.location_name)}&mode=car&policy=1&src=online_invitation&coordinate=gaode`;
      window.open(url, '_blank');
    } else {
      alert('暂无地图信息');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">邀请函不存在</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const animationVariants = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.8 } },
    slide: { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 } },
    zoom: { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.8 } },
  };

  const selectedAnimation = animationVariants[invitation.animation_style as keyof typeof animationVariants] || animationVariants.fade;

  return (
    <main className="min-h-screen" style={{ backgroundColor: invitation.background_color }}>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-rose-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            首页
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              👁️ {invitation.view_count}
            </span>
            <span className="text-sm text-gray-500">
              ✅ {invitation.registration_count}
            </span>
          </div>
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="p-2 text-gray-600 hover:text-rose-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {showShareMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100"
            >
              <div className="max-w-2xl mx-auto px-4 py-4 grid grid-cols-4 gap-4">
                {[
                  { key: 'wechat', icon: '💬', label: '微信' },
                  { key: 'qq', icon: '🐧', label: 'QQ' },
                  { key: 'weibo', icon: '📱', label: '微博' },
                  { key: 'copy', icon: '🔗', label: '复制链接' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleShare(item.key)}
                    className="flex flex-col items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="text-2xl mb-1">{item.icon}</span>
                    <span className="text-xs text-gray-600">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-16 pb-24">
        <motion.section
          initial={selectedAnimation.initial}
          animate={selectedAnimation.animate}
          transition={selectedAnimation.transition}
          className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16"
          style={{ fontFamily: invitation.font_family }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full mb-6 flex items-center justify-center shadow-lg"
            style={{ backgroundColor: invitation.accent_color }}
          >
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl sm:text-5xl font-bold text-center mb-4"
            style={{ color: invitation.text_color }}
          >
            {invitation.title}
          </motion.h1>

          {invitation.subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-lg text-center mb-8"
              style={{ color: invitation.text_color, opacity: 0.8 }}
            >
              {invitation.subtitle}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center mb-8"
          >
            <div
              className="text-2xl font-medium"
              style={{ color: invitation.accent_color }}
            >
              {invitation.host_name}
              {invitation.host_name2 && (
                <>
                  <span className="mx-2">&</span>
                  {invitation.host_name2}
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full mx-auto shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-center text-center">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: invitation.accent_color }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                  </svg>
                  <span className="font-medium" style={{ color: invitation.text_color }}>
                    {new Date(invitation.event_date).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: invitation.accent_color }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.2 14.4L11 13v-4h1.5v3.25l4.5 2.67-.75 1.25z" />
                  </svg>
                  <span className="font-medium" style={{ color: invitation.text_color }}>
                    {invitation.event_time}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className="w-5 h-5" style={{ color: invitation.accent_color }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="font-bold" style={{ color: invitation.text_color }}>
                    {invitation.location_name}
                  </span>
                </div>
                <p className="text-sm" style={{ color: invitation.text_color, opacity: 0.7 }}>
                  {invitation.location_address}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMap(true)}
                  className="mt-2 px-4 py-1 text-sm rounded-full"
                  style={{ backgroundColor: invitation.accent_color, color: 'white' }}
                >
                  查看地图
                </motion.button>
              </div>
            </div>
          </motion.div>

          {invitation.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="mt-8 text-center max-w-md px-4 whitespace-pre-wrap"
              style={{ color: invitation.text_color, opacity: 0.9 }}
            >
              {invitation.description}
            </motion.p>
          )}
        </motion.section>

        {invitation.photos && invitation.photos.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="py-12 px-4"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8" style={{ color: invitation.text_color }}>
                美好时光
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {invitation.photos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-200"
                  >
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-4xl">📷</span>
                    </div>
                    {photo.caption && (
                      <p className="text-xs text-gray-600 text-center py-1">{photo.caption}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {invitation.registrations && invitation.registrations.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="py-12 px-4 bg-white/50"
          >
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-6" style={{ color: invitation.text_color }}>
                宾客祝福
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {invitation.registrations.slice(0, 10).map((reg) => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium" style={{ color: invitation.text_color }}>
                        {reg.name}
                      </span>
                      {reg.attend_status === 1 ? (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
                          参加 ({reg.attend_count}人)
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          遗憾缺席
                        </span>
                      )}
                    </div>
                    {reg.message && (
                      <p className="text-sm text-gray-600">{reg.message}</p>
                    )}
                  </motion.div>
                ))}
              </div>
              {invitation.registrations.length > 10 && (
                <button
                  onClick={() => setShowRegistrationList(true)}
                  className="mt-4 w-full py-2 text-center text-gray-500 hover:text-rose-500 transition-colors"
                >
                  查看全部 {invitation.registrations.length} 条祝福
                </button>
              )}
            </div>
          </motion.section>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-lg border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRegistrationForm(true)}
              className="py-3 rounded-full font-medium text-white shadow-md"
              style={{ backgroundColor: invitation.accent_color }}
            >
              📝 我要报名
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNavigate}
              className="py-3 rounded-full font-medium border-2"
              style={{ borderColor: invitation.accent_color, color: invitation.accent_color }}
            >
              📍 导航前往
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showRegistrationForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowRegistrationForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">填写报名信息</h3>
                <button
                  onClick={() => setShowRegistrationForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleRegistration} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    您的姓名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    联系电话 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    是否参加
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="attend_status"
                        checked={formData.attend_status === 1}
                        onChange={() => setFormData({ ...formData, attend_status: 1 })}
                        className="mr-2"
                      />
                      <span>参加</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="attend_status"
                        checked={formData.attend_status === 0}
                        onChange={() => setFormData({ ...formData, attend_status: 0 })}
                        className="mr-2"
                      />
                      <span>遗憾缺席</span>
                    </label>
                  </div>
                </div>

                {formData.attend_status === 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      参加人数
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.attend_count}
                      onChange={(e) => setFormData({ ...formData, attend_count: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    留言/祝福
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                    placeholder="写下您的祝福..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 text-white rounded-lg font-medium shadow-md"
                  style={{ backgroundColor: invitation.accent_color }}
                >
                  提交
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMap && invitation.latitude && invitation.longitude && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowMap(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">活动地点</h3>
                <button
                  onClick={() => setShowMap(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <p className="text-gray-600 mb-4">{invitation.location_address}</p>
                {invitation.latitude && invitation.longitude && (
                  <MapView
                    latitude={invitation.latitude}
                    longitude={invitation.longitude}
                    locationName={invitation.location_name}
                  />
                )}
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={handleNavigate}
                    className="flex-1 py-2 bg-rose-500 text-white rounded-lg font-medium"
                  >
                    高德导航
                  </button>
                  <a
                    href={`https://uri.amap.com/marker?position=${invitation.longitude},${invitation.latitude}&name=${encodeURIComponent(invitation.location_name)}&src=online_invitation`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium text-center"
                  >
                    高德地图
                  </a>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${invitation.latitude}&mlon=${invitation.longitude}#map=16/${invitation.latitude}/${invitation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium text-center"
                  >
                    OpenStreetMap
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

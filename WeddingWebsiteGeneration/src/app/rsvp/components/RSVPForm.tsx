'use client';

import { useState } from 'react';
import { CheckCircle, Heart, Utensils, User, Phone, MessageSquare } from 'lucide-react';

export default function RSVPForm() {
  const [formData, setFormData] = useState({
    guestName: '',
    phone: '',
    attendCount: 1,
    dietary: '',
    message: '',
    isAttending: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, weddingId: 1 }),
      });

      if (res.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('RSVP submission error:', error);
      alert('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="font-serif text-3xl text-gray-800 mb-4">提交成功！</h2>
        <p className="text-gray-600 mb-6">
          感谢您的回复，我们已收到您的信息。
          <br />
          期待在婚礼当天与您相见！
        </p>
        <div className="flex items-center justify-center gap-2 text-rose-gold">
          <Heart className="w-5 h-5" fill="currentColor" />
          <span>小雨 & 明阳</span>
          <Heart className="w-5 h-5" fill="currentColor" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-8">
        <label className="block text-gray-700 font-medium mb-4">是否出席</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isAttending: true })}
            className={`flex-1 py-3 px-6 rounded-xl border-2 transition-all ${
              formData.isAttending
                ? 'border-rose-gold bg-rose-gold/10 text-rose-gold'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            欣然出席
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isAttending: false })}
            className={`flex-1 py-3 px-6 rounded-xl border-2 transition-all ${
              !formData.isAttending
                ? 'border-gray-400 bg-gray-100 text-gray-600'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            遗憾缺席
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
            <User className="w-4 h-4 text-rose-gold" />
            您的姓名
          </label>
          <input
            type="text"
            required
            value={formData.guestName}
            onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
            placeholder="请输入您的姓名"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none transition-all"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
            <Phone className="w-4 h-4 text-rose-gold" />
            联系电话
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="请输入您的联系电话"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none transition-all"
          />
        </div>

        {formData.isAttending && (
          <>
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <Utensils className="w-4 h-4 text-rose-gold" />
                出席人数
              </label>
              <select
                value={formData.attendCount}
                onChange={(e) => setFormData({ ...formData, attendCount: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none transition-all bg-white"
              >
                <option value={1}>1 人</option>
                <option value={2}>2 人</option>
                <option value={3}>3 人</option>
                <option value={4}>4 人</option>
                <option value={5}>5 人及以上</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <Utensils className="w-4 h-4 text-rose-gold" />
                饮食偏好
              </label>
              <select
                value={formData.dietary}
                onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none transition-all bg-white"
              >
                <option value="">无特殊要求</option>
                <option value="vegetarian">素食</option>
                <option value="halal">清真</option>
                <option value="allergy">过敏史请在留言中说明</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
            <MessageSquare className="w-4 h-4 text-rose-gold" />
            留言祝福
          </label>
          <textarea
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="写下您对新人的祝福..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none transition-all resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-8 py-4 bg-gradient-to-r from-rose-gold to-rose-gold/80 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-rose-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '提交中...' : '提交回执'}
      </button>
    </form>
  );
}

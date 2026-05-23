'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const AVATAR_COLORS = [
  '#f472b6', '#ec4899', '#db2777', '#be185d',
  '#60a5fa', '#3b82f6', '#2563eb',
  '#34d399', '#10b981', '#059669',
  '#fbbf24', '#f59e0b', '#d97706',
  '#a78bfa', '#8b5cf6', '#7c3aed',
];

export default function JoinPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'blessing' | 'photo'>('blessing');
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  const [uploading, setUploading] = useState(false);
  const [uploadedBy, setUploadedBy] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitBlessing = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !message.trim()) {
      alert('请填写姓名和祝福内容');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/blessings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim(),
          avatarColor: selectedColor,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('祝福已成功发送！🎉');
        setName('');
        setMessage('');
      } else {
        alert(data.error || '发送失败，请重试');
      }
    } catch (error) {
      alert('发送失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('请选择要上传的照片');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('caption', caption);
      formData.append('uploadedBy', uploadedBy || '匿名');

      const res = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert('照片上传成功！📸');
        setSelectedFile(null);
        setPreviewUrl('');
        setCaption('');
        setUploadedBy('');
      } else {
        alert(data.error || '上传失败，请重试');
      }
    } catch (error) {
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <a
            href="/"
            className="inline-flex items-center text-pink-500 hover:text-pink-600 mb-4"
          >
            ← 返回祝福页
          </a>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            参与祝福
          </h1>
          <p className="text-gray-600">
            送出你的祝福，留下美好的回忆
          </p>
        </div>

        <div className="flex gap-2 mb-8 glass-card rounded-full p-1">
          <button
            onClick={() => setActiveTab('blessing')}
            className={`flex-1 py-3 px-4 rounded-full font-medium transition-all duration-300 ${
              activeTab === 'blessing'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-pink-500'
            }`}
          >
            💝 写祝福
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex-1 py-3 px-4 rounded-full font-medium transition-all duration-300 ${
              activeTab === 'photo'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-pink-500'
            }`}
          >
            📸 上传照片
          </button>
        </div>

        {activeTab === 'blessing' ? (
          <form
            onSubmit={handleSubmitBlessing}
            className="glass-card rounded-3xl p-8 shadow-xl"
          >
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                你的名字 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300"
                placeholder="请输入你的名字"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择头像颜色
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full transition-all duration-300 ${
                      selectedColor === color
                        ? 'ring-4 ring-pink-300 scale-110'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                祝福内容 *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 resize-none"
                placeholder="写下你想说的话..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? '发送中...' : '🎉 发送祝福'}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleSubmitPhoto}
            className="glass-card rounded-3xl p-8 shadow-xl"
          >
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择照片 *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="block cursor-pointer"
                >
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="预览"
                        className="w-full max-h-64 object-contain rounded-xl"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white">点击更换照片</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-400 transition-colors duration-300">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-gray-500">点击选择照片</p>
                      <p className="text-xs text-gray-400 mt-1">
                        支持 JPEG、PNG、GIF、WebP，最大 5MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上传者昵称
              </label>
              <input
                type="text"
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300"
                placeholder="请输入你的昵称（选填）"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                照片描述
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300"
                placeholder="给这张照片起个标题吧（选填）"
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {uploading ? '上传中...' : '📸 上传照片'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

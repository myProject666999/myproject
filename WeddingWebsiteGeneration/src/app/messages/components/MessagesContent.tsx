'use client';

import { useState, useEffect } from 'react';
import { Heart, Send } from 'lucide-react';

interface Message {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export default function MessagesContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, content, weddingId: 1 }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages([newMessage, ...messages]);
        setAuthorName('');
        setContent('');
      }
    } catch (error) {
      console.error('Failed to submit message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 mb-12 border border-rose-gold/10">
        <h3 className="font-serif text-xl text-gray-800 mb-4">写下您的祝福</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="您的姓名"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none transition-all"
            required
          />
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下您对新人的祝福..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 outline-none transition-all resize-none"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-gold to-rose-gold/80 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-rose-gold/30 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? '发送中...' : '发送祝福'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="font-serif text-xl text-gray-800 mb-6 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-gold" fill="currentColor" />
          祝福墙
        </h3>

        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Heart className="w-12 h-12 mx-auto mb-4 text-rose-gold/30" />
            <p>还没有留言，成为第一个送上祝福的人吧！</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="break-inside-avoid mb-4 bg-white rounded-2xl shadow-lg p-6 border border-rose-gold/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-rose-gold/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-rose-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{message.authorName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">{message.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

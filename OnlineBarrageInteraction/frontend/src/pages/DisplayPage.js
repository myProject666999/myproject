import React, { useState, useEffect, useRef } from 'react';
import { messageApi } from '../services/api';
import webSocketService from '../services/websocket';

const DisplayPage = () => {
  const [barrages, setBarrages] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const barrageIdRef = useRef(0);
  const colors = [
    '#ffffff', '#ff6b6b', '#ffd93d', '#6bcb77',
    '#4d96ff', '#9b59b6', '#ff9ff3', '#54a0ff'
  ];

  useEffect(() => {
    webSocketService.connect();

    webSocketService.on('new_message', (data) => {
      addBarrage(data);
      addRecentMessage(data);
    });

    fetchInitialMessages();

    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const fetchInitialMessages = async () => {
    try {
      const response = await messageApi.getAll({ status: 1, limit: 10 });
      const messages = response.data.messages || [];
      messages.reverse().forEach((msg) => {
        addRecentMessage(msg);
      });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const addBarrage = (message) => {
    const id = ++barrageIdRef.current;
    const top = Math.random() * 60 + 10;
    const duration = Math.random() * 10 + 10;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const fontSize = Math.random() * 16 + 20;

    const newBarrage = {
      id,
      content: message.content,
      nickname: message.user?.nickname || '匿名',
      top,
      duration,
      color,
      fontSize,
    };

    setBarrages((prev) => [...prev, newBarrage]);

    setTimeout(() => {
      setBarrages((prev) => prev.filter((b) => b.id !== id));
    }, duration * 1000);
  };

  const addRecentMessage = (message) => {
    setRecentMessages((prev) => {
      const updated = [message, ...prev];
      return updated.slice(0, 20);
    });
  };

  return (
    <div className="display-container">
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 50,
          color: '#fff',
          fontSize: 32,
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        🎉 弹幕互动大屏 🎉
      </div>

      {barrages.map((barrage) => (
        <div
          key={barrage.id}
          className="barrage-item"
          style={{
            top: `${barrage.top}%`,
            animationDuration: `${barrage.duration}s`,
            color: barrage.color,
            fontSize: `${barrage.fontSize}px`,
          }}
        >
          {barrage.nickname}: {barrage.content}
        </div>
      ))}

      <div className="barrage-list">
        <h3 style={{ color: '#fff', marginBottom: 15 }}>📋 消息列表</h3>
        {recentMessages.map((msg) => (
          <div key={msg.id} className="barrage-list-item">
            <strong style={{ color: '#ffd93d' }}>
              {msg.user?.nickname || '匿名'}
            </strong>
            <p style={{ margin: '4px 0 0 0' }}>{msg.content}</p>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              ❤️ {msg.likes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayPage;

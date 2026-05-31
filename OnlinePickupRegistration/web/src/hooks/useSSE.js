import { useEffect, useRef, useState, useCallback } from 'react';

export function useSSE(url, onMessage) {
  const [connected, setConnected] = useState(false);
  const callbackRef = useRef(onMessage);
  const esRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const shouldReconnectRef = useRef(true);

  useEffect(() => {
    callbackRef.current = onMessage;
  }, [onMessage]);

  const handleMessage = useCallback((e) => {
    try {
      const data = JSON.parse(e.data);
      if (callbackRef.current) callbackRef.current(data);
    } catch (err) {
      console.error('SSE parse error:', err);
    }
  }, []);

  const connect = useCallback(() => {
    if (!url) return;

    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      setConnected(true);
      shouldReconnectRef.current = true;
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      esRef.current = null;

      if (shouldReconnectRef.current && url) {
        shouldReconnectRef.current = false;
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
        }
        reconnectTimerRef.current = setTimeout(() => {
          shouldReconnectRef.current = true;
          connect();
        }, 5000);
      }
    };

    es.onmessage = handleMessage;
  }, [url, handleMessage]);

  useEffect(() => {
    if (!url) return;

    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      setConnected(false);
    };
  }, [url, connect]);

  return connected;
}

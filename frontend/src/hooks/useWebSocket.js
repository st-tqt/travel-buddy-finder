import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export function useWebSocket(tripId) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectCount = useRef(0);
  const MAX_RECONNECT = 3;

  const reconnectTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  const connect = () => {
    if (!isMountedRef.current) return;
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    setIsConnecting(true);
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat?tripId=${tripId}&token=${token}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      if (!isMountedRef.current) return;
      setIsConnected(true);
      setIsConnecting(false);
      reconnectCount.current = 0;
      console.log(`[WS] Connected to trip ${tripId}`);
    };

    wsRef.current.onmessage = (event) => {
      if (!isMountedRef.current) return;
      try {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
      } catch (e) {
        console.error('Failed to parse message', e);
      }
    };

    wsRef.current.onclose = (event) => {
      if (!isMountedRef.current) return;
      setIsConnected(false);
      setIsConnecting(false);
      if (event.code === 4001) {
        toast.error('Phiên đăng nhập hết hạn');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        if (reconnectCount.current < MAX_RECONNECT) {
          reconnectCount.current += 1;
          reconnectTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              connect();
            }
          }, 3000);
        } else {
          setError('Không thể kết nối chat');
          toast.error('Mất kết nối chat, vui lòng tải lại trang');
        }
      }
    };

    wsRef.current.onerror = () => {
      if (!isMountedRef.current) return;
      setError('Lỗi kết nối WebSocket');
    };
  };

  useEffect(() => {
    isMountedRef.current = true;
    connect();
    return () => {
      isMountedRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [tripId]);

  const sendMessage = (content) => {
    if (!content || !content.trim()) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content: content.trim() }));
    } else {
      toast.error('Chưa kết nối được chat');
    }
  };

  return { messages, isConnected, isConnecting, error, sendMessage, setMessages };
}

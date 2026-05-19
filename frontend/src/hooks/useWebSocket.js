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

  const connect = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    setIsConnecting(true);
    const wsUrl = `ws://localhost:8085/ws/chat?tripId=${tripId}&token=${token}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);
      reconnectCount.current = 0;
      console.log(`[WS] Connected to trip ${tripId}`);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
      } catch (e) {
        console.error('Failed to parse message', e);
      }
    };

    wsRef.current.onclose = (event) => {
      setIsConnected(false);
      setIsConnecting(false);
      if (event.code === 4001) {
        toast.error('Phiên đăng nhập hết hạn');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        if (reconnectCount.current < MAX_RECONNECT) {
          reconnectCount.current += 1;
          setTimeout(connect, 3000);
        } else {
          setError('Không thể kết nối chat');
          toast.error('Mất kết nối chat, vui lòng tải lại trang');
        }
      }
    };

    wsRef.current.onerror = () => {
      setError('Lỗi kết nối WebSocket');
    };
  };

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [tripId]);

  const sendMessage = (content) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content }));
    } else {
      toast.error('Chưa kết nối được chat');
    }
  };

  return { messages, isConnected, isConnecting, error, sendMessage, setMessages };
}

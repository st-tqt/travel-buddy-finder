import { useState, useEffect, useContext } from 'react';
import { notificationApi } from '../api/notificationApi';
import { AuthContext } from '../context/AuthContext';

export function useNotifications() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await notificationApi.getUnreadCount(user.id);
      setUnreadCount(res.data.count || 0);
    } catch (e) { console.error(e); }
  };

  const fetchNotifications = async (page = 1) => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await notificationApi.getNotifications(user.id, { page, limit: 10 });
      if (page === 1) {
        setNotifications(res.data.data);
      } else {
        setNotifications(prev => [...prev, ...res.data.data]);
      }
      setPagination(res.data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { console.error(e); }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  const loadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchNotifications(pagination.page + 1);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    loadMore
  };
}

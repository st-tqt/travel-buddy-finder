import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

export default function NotificationBadge() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <button 
      onClick={() => navigate('/notifications')}
      className="relative p-2 text-gray-600 hover:text-blue-600 transition"
      title="Thông báo"
    >
      <span className="text-xl">🔔</span>
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}

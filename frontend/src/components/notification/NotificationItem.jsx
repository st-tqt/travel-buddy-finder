import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotificationItem({ notification, onRead }) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (notification.type) {
      case 'JOIN_APPROVED': return '✅';
      case 'JOIN_REJECTED': return '❌';
      case 'JOIN_REQUESTED': return '📩';
      default: return '🔔';
    }
  };

  const getTitle = () => {
    if (notification.title) return notification.title;
    switch (notification.type) {
      case 'JOIN_APPROVED': return 'Yêu cầu được duyệt';
      case 'JOIN_REJECTED': return 'Yêu cầu bị từ chối';
      case 'JOIN_REQUESTED': return 'Yêu cầu tham gia mới';
      default: return 'Thông báo';
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
    if (notification.tripId) {
      navigate(`/trips/${notification.tripId}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-4 border-b flex gap-4 cursor-pointer transition ${notification.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'}`}
    >
      <div className="text-2xl pt-1">{getIcon()}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{getTitle()}</h4>
        <p className="text-gray-700 text-sm mt-1">{notification.message}</p>
        <p className="text-gray-400 text-xs mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
      </div>
      {!notification.isRead && (
        <div className="flex items-center">
          <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
        </div>
      )}
    </div>
  );
}

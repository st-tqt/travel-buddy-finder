import React, { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/notification/NotificationItem';

export default function NotificationPage() {
  const { notifications, isLoading, pagination, fetchNotifications, markAsRead, markAllAsRead, loadMore } = useNotifications();

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 page-enter">
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h1 className="text-xl font-bold text-gray-800">Thông báo</h1>
          <button 
            onClick={markAllAsRead}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
          >
            Đọc tất cả
          </button>
        </div>

        {isLoading && notifications.length === 0 ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-4 h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Bạn không có thông báo mới</div>
        ) : (
          <div className="flex flex-col">
            {notifications.map(notif => (
              <NotificationItem key={notif.id} notification={notif} onRead={markAsRead} />
            ))}
          </div>
        )}

        {pagination.page < pagination.totalPages && (
          <div className="p-4 text-center border-t bg-gray-50">
            <button 
              onClick={loadMore}
              disabled={isLoading}
              className="px-6 py-2 bg-white border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              {isLoading ? 'Đang tải...' : 'Tải thêm'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

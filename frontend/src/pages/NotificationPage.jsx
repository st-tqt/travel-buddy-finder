import { useState, useEffect } from 'react';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from '../hooks/useAuth';

const NotificationPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        if (user) {
          const data = await notificationApi.getUserNotifications(user.id);
          setNotifications(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading notifications...</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Notifications</h1>
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No notifications yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map(n => (
              <li key={n.id} className={`p-4 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                <div className="flex gap-4 items-start">
                  <div className={`mt-1 h-2.5 w-2.5 rounded-full ${!n.isRead ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                  <div>
                    <p className={`text-gray-900 ${!n.isRead ? 'font-medium' : ''}`}>{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;

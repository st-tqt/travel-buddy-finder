import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { chatApi } from '../api/chatApi';
import { tripApi } from '../api/tripApi';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [trip, setTrip] = useState(null);
  const { messages, isConnected, isConnecting, error, sendMessage, setMessages } = useWebSocket(tripId);

  useEffect(() => {
    fetchInitialData();
  }, [tripId]);

  const fetchInitialData = async () => {
    try {
      const [tripRes, msgRes] = await Promise.all([
        tripApi.getTripById(tripId),
        chatApi.getMessages(tripId, { limit: 50 })
      ]);
      setTrip(tripRes.data);
      // reverse messages because they usually come latest first from API, but we want chronological order in UI
      const sortedMessages = [...(msgRes.data?.data || [])].reverse();
      setMessages(sortedMessages);
    } catch (e) {
      toast.error('Lỗi khi tải thông tin chat');
    }
  };

  const getStatusIndicator = () => {
    if (isConnecting) return <span className="flex items-center text-yellow-500 text-sm font-medium"><span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>Đang kết nối...</span>;
    if (isConnected) return <span className="flex items-center text-green-500 text-sm font-medium"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Đã kết nối</span>;
    return <span className="flex items-center text-red-500 text-sm font-medium"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>Mất kết nối {error && `(${error})`}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-80px)]">
      <div className="bg-white border rounded-xl shadow-sm h-full flex flex-col overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/trips/${tripId}`)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div>
              <h2 className="font-bold text-gray-900">{trip ? trip.title : 'Loading...'}</h2>
              {getStatusIndicator()}
            </div>
          </div>
        </div>
        
        <MessageList messages={messages} currentUser={user} />
        <MessageInput onSend={sendMessage} isConnected={isConnected} />
      </div>
    </div>
  );
}

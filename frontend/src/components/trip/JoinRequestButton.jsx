import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { joinRequestApi } from '../../api/joinRequestApi';

export default function JoinRequestButton({ trip, currentUser, joinStatus, onStatusChange }) {
  const [loading, setLoading] = useState(false);

  if (!currentUser) {
    return <button disabled className="w-full px-4 py-2 bg-gray-300 rounded font-medium">Đăng nhập để tham gia</button>;
  }

  if (currentUser.id === trip.ownerId) return null;

  const handleJoin = async () => {
    try {
      setLoading(true);
      await joinRequestApi.sendJoinRequest(trip.id);
      toast.success('Đã gửi yêu cầu tham gia!');
      onStatusChange('pending');
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Bạn đã gửi request rồi');
      } else {
        toast.error(error.response?.data?.error || 'Lỗi khi gửi yêu cầu');
      }
    } finally {
      setLoading(false);
    }
  };

  switch (joinStatus) {
    case 'pending':
      return <button disabled className="w-full px-4 py-2 bg-yellow-500 text-white rounded font-medium opacity-70">Đang chờ duyệt</button>;
    case 'approved':
      return <button disabled className="w-full px-4 py-2 bg-green-500 text-white rounded font-medium opacity-70">Đã tham gia</button>;
    case 'rejected':
      return <button disabled className="w-full px-4 py-2 bg-red-500 text-white rounded font-medium opacity-70">Bị từ chối</button>;
    default:
      if (trip.status === 'closed' || trip.status === 'completed' || trip.currentMember >= trip.maxMember) {
        return <button disabled className="w-full px-4 py-2 bg-gray-400 text-white rounded font-medium">Trip đã đầy</button>;
      }
      return (
        <button 
          onClick={handleJoin} 
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Tham gia trip'}
        </button>
      );
  }
}

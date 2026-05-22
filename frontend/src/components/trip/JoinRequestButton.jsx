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

  const handleLeave = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn rời khỏi chuyến đi này không?')) return;
    try {
      setLoading(true);
      await joinRequestApi.leaveTrip(trip.id);
      toast.success('Bạn đã rời khỏi chuyến đi');
      onStatusChange(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Lỗi khi rời chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  const statusLower = joinStatus?.toLowerCase();
  switch (statusLower) {
    case 'pending':
      return <button disabled className="w-full px-4 py-2 bg-yellow-500 text-white rounded font-medium opacity-70">Đang chờ duyệt</button>;
    case 'approved':
      return (
        <div className="flex flex-col gap-2 w-full">
          <div className="w-full px-4 py-2 bg-green-100 text-green-800 text-center rounded font-medium">
            ✅ Bạn đã tham gia chuyến đi
          </div>
          <button 
            onClick={handleLeave} 
            disabled={loading}
            className="w-full px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? 'Đang rời...' : 'Rời khỏi chuyến đi'}
          </button>
        </div>
      );
    case 'rejected':
      return <button disabled className="w-full px-4 py-2 bg-red-500 text-white rounded font-medium opacity-70">Bị từ chối</button>;
    default:
      const isClosedOrCompleted = trip.status?.toLowerCase() === 'closed' || trip.status?.toLowerCase() === 'completed';
      const isFull = (trip.currentMember || 0) >= (trip.maxMembers || trip.maxMember || 0);
      if (isClosedOrCompleted || isFull) {
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

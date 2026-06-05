import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { reviewApi } from '../../api/reviewApi';
import { tripApi } from '../../api/tripApi';
import { joinRequestApi } from '../../api/joinRequestApi';
import StarRating from './StarRating';

export default function ReviewForm({ targetUserId, onReviewSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tripId, setTripId] = useState('');
  const [loading, setLoading] = useState(false);
  const [userTrips, setUserTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    const loadUserTrips = async () => {
      try {
        setLoadingTrips(true);
        // 1. Lấy các trip do mình làm chủ
        const myTripsRes = await tripApi.getMyTrips();
        const myTrips = myTripsRes.data?.data || [];

        // 2. Lấy các trip mình đã join và được duyệt (approved)
        const myRequestsRes = await joinRequestApi.getMyRequests();
        const myRequests = Array.isArray(myRequestsRes.data) ? myRequestsRes.data : (myRequestsRes.data?.data || []);
        const approvedTripIds = myRequests
          .filter(r => r.status?.toUpperCase() === 'APPROVED')
          .map(r => r.tripId);

        const joinedTrips = await Promise.all(
          approvedTripIds.map(async (id) => {
            try {
              const res = await tripApi.getTripById(id);
              return res.data;
            } catch (e) {
              return null;
            }
          })
        );

        const validJoinedTrips = joinedTrips.filter(t => t !== null);

        // Ghép cả hai danh sách lại và lọc trùng lặp
        const allTrips = [...myTrips, ...validJoinedTrips];
        const uniqueTrips = [];
        const seenIds = new Set();
        for (const t of allTrips) {
          if (!seenIds.has(t.id)) {
            seenIds.add(t.id);
            uniqueTrips.push(t);
          }
        }
        setUserTrips(uniqueTrips);
      } catch (err) {
        console.error('Failed to load user trips for review form', err);
      } finally {
        setLoadingTrips(false);
      }
    };

    loadUserTrips();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Vui lòng chọn số sao');
    if (comment.length < 10) return toast.error('Đánh giá phải từ 10 ký tự');
    if (comment.length > 500) return toast.error('Đánh giá tối đa 500 ký tự');
    if (!tripId) return toast.error('Vui lòng chọn chuyến đi đã đồng hành');

    try {
      setLoading(true);
      const res = await reviewApi.createReview({
        targetUserId,
        tripId,
        rating,
        comment
      });
      toast.success('Đã gửi đánh giá thành công');
      onReviewSubmit(res.data);
      setRating(0);
      setComment('');
      setTripId('');
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Bạn đã đánh giá người này cho chuyến đi này rồi');
      } else {
        toast.error(error.response?.data?.error || 'Lỗi khi gửi đánh giá');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow border mb-6">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Viết đánh giá</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Chọn chuyến đi đã đồng hành</label>
        {loadingTrips ? (
          <div className="text-sm text-gray-500 animate-pulse py-2">Đang tải danh sách chuyến đi...</div>
        ) : userTrips.length === 0 ? (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-100 font-medium">
            Bạn chưa có chuyến đi chung nào cùng người này. Vui lòng tham gia chuyến đi trước khi đánh giá.
          </div>
        ) : (
          <select
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900 border-gray-300"
          >
            <option value="">-- Chọn chuyến đi --</option>
            {userTrips.map(trip => (
              <option key={trip.id} value={trip.id}>
                {trip.title} (ID: {trip.id.substring(0, 8)}...)
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Đánh giá sao</label>
        <StarRating rating={rating} onChange={setRating} readonly={false} />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nhận xét</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px] resize-y"
          placeholder="Chia sẻ trải nghiệm của bạn (10-500 ký tự)"
        ></textarea>
      </div>

      <button 
        type="submit" 
        disabled={loading || userTrips.length === 0}
        className="w-full py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? 'Đang xử lý...' : 'Gửi đánh giá'}
      </button>
    </form>
  );
}

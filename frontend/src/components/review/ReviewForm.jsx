import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { reviewApi } from '../../api/reviewApi';
import StarRating from './StarRating';

export default function ReviewForm({ targetUserId, onReviewSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tripId, setTripId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Vui lòng chọn số sao');
    if (comment.length < 10) return toast.error('Đánh giá phải từ 10 ký tự');
    if (comment.length > 500) return toast.error('Đánh giá tối đa 500 ký tự');
    if (!tripId) return toast.error('Vui lòng nhập mã chuyến đi');

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
        <label className="block text-sm font-medium text-gray-700 mb-1">Mã chuyến đi (Trip ID)</label>
        <input 
          type="text" 
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Nhập ID chuyến đi đã tham gia cùng"
        />
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
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? 'Đang xử lý...' : 'Gửi đánh giá'}
      </button>
    </form>
  );
}

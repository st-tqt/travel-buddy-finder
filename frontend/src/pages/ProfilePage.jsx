import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { reviewApi } from '../api/reviewApi';
import { tripApi } from '../api/tripApi';
import axiosInstance from '../api/axiosInstance';
import ReviewList from '../components/review/ReviewList';
import ReviewForm from '../components/review/ReviewForm';
import TripDetailCard from '../components/trip/TripDetailCard';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const isMe = currentUser?.id === userId;
      
      const [userRes, tripsRes, reviewsRes] = await Promise.all([
        axiosInstance.get(`/users/${userId}`),
        isMe ? tripApi.getMyTrips() : tripApi.getTrips({ ownerId: userId }),
        reviewApi.getReviewsByUser(userId)
      ]);

      setProfileUser(userRes.data);
      setTrips(tripsRes.data?.data || []);
      setReviews(reviewsRes.data?.data || []);
    } catch (error) {
      toast.error('Lỗi tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    // update average rating optimisticly if possible
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="animate-pulse bg-gray-200 h-40 rounded-xl w-full"></div>
        <div className="animate-pulse bg-gray-200 h-64 rounded-xl w-full"></div>
      </div>
    );
  }

  if (!profileUser) return <div className="text-center mt-20 text-gray-500">Không tìm thấy người dùng</div>;

  const isMe = currentUser?.id === profileUser.id;
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-8 rounded-xl shadow flex items-center gap-6">
        <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-md">
          {profileUser.email?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{profileUser.email}</h1>
          <div className="flex items-center gap-2 mt-2 text-yellow-500">
            <span className="text-xl">⭐</span>
            <span className="font-bold text-lg">{avgRating} / 5</span>
            <span className="text-gray-500 text-sm">({reviews.length} đánh giá)</span>
          </div>
        </div>
      </div>

      {/* User Trips */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{isMe ? 'Các trip đã tạo' : 'Các trip của người này'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trips.length === 0 ? (
            <p className="text-gray-500 col-span-2">Chưa có chuyến đi nào.</p>
          ) : (
            trips.map(trip => (
              <div key={trip.id} className="scale-95 origin-top-left"><TripDetailCard trip={trip} /></div>
            ))
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Đánh giá từ người khác</h2>
        
        {!isMe && currentUser && (
          <ReviewForm targetUserId={profileUser.id} onReviewSubmit={handleReviewSubmit} />
        )}
        
        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
}

import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { reviewApi } from '../api/reviewApi';
import { tripApi } from '../api/tripApi';
import { joinRequestApi } from '../api/joinRequestApi';
import axiosInstance from '../api/axiosInstance';
import ReviewList from '../components/review/ReviewList';
import ReviewForm from '../components/review/ReviewForm';
import TripCard from '../components/trip/TripCard';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [joinedTrips, setJoinedTrips] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const isMe = currentUser && userId && String(currentUser.id) === String(userId);
      
      const [userRes, tripsRes, reviewsRes] = await Promise.all([
        axiosInstance.get(`/users/${userId}`),
        isMe ? tripApi.getMyTrips() : tripApi.getTrips({ ownerId: userId }),
        reviewApi.getReviewsByUser(userId)
      ]);

      setProfileUser(userRes.data);
      setTrips(tripsRes.data?.data || []);
      setReviews(reviewsRes.data?.data || []);

      if (isMe) {
        try {
          const myRequestsRes = await joinRequestApi.getMyRequests();
          const myRequests = Array.isArray(myRequestsRes.data) ? myRequestsRes.data : (myRequestsRes.data?.data || []);
          const approvedTripIds = myRequests
            .filter(r => r.status?.toUpperCase() === 'APPROVED')
            .map(r => r.tripId);

          const joinedTripsRes = await Promise.all(
            approvedTripIds.map(async (tripId) => {
              try {
                const res = await tripApi.getTripById(tripId);
                return res.data;
              } catch (e) {
                return null;
              }
            })
          );
          setJoinedTrips(joinedTripsRes.filter(t => t !== null));
        } catch (error) {
          console.error('Failed to fetch joined trips', error);
        }
      }
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

  const isMe = currentUser && profileUser && String(currentUser.id) === String(profileUser.id);
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 page-enter">
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
              <div key={trip.id} className="h-full"><TripCard trip={trip} /></div>
            ))
          )}
        </div>
      </div>

      {/* Joined Trips (Only for me) */}
      {isMe && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Các trip đã tham gia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joinedTrips.length === 0 ? (
              <p className="text-gray-500 col-span-2">Chưa tham gia chuyến đi nào.</p>
            ) : (
              joinedTrips.map(trip => (
                <div key={trip.id} className="h-full"><TripCard trip={trip} /></div>
              ))
            )}
          </div>
        </div>
      )}

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

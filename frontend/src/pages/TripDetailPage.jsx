import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tripApi } from '../api/tripApi';
import { joinRequestApi } from '../api/joinRequestApi';
import TripDetailCard from '../components/trip/TripDetailCard';
import JoinRequestButton from '../components/trip/JoinRequestButton';
import JoinRequestList from '../components/trip/JoinRequestList';
import { AuthContext } from '../context/AuthContext';

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinStatus, setJoinStatus] = useState(null);

  useEffect(() => {
    fetchTripData();
  }, [id, user]);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const res = await tripApi.getTripById(id);
      setTrip(res.data);
      
      if (user && user.id !== res.data.ownerId) {
        const reqRes = await joinRequestApi.getMyRequests({ tripId: id });
        const request = reqRes.data?.data?.[0];
        if (request) setJoinStatus(request.status);
      }
    } catch (error) {
      toast.error('Lỗi khi tải thông tin chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 max-w-4xl mx-auto"><div className="animate-pulse bg-gray-200 h-96 rounded-xl w-full"></div></div>;
  }
  if (!trip) return <div className="text-center mt-20 text-xl text-gray-500 font-medium">Không tìm thấy chuyến đi</div>;

  const isOwner = user?.id === trip.ownerId;
  const isMember = isOwner || joinStatus === 'approved';

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <TripDetailCard trip={trip} />
      
      <div className="bg-white p-6 rounded-xl shadow flex flex-col gap-4">
        {!isOwner && (
          <JoinRequestButton 
            trip={trip} 
            currentUser={user} 
            joinStatus={joinStatus} 
            onStatusChange={setJoinStatus} 
          />
        )}
        
        {isMember && (
          <button 
            onClick={() => navigate(`/chat/${trip.id}`)}
            className="w-full py-3 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 transition shadow-sm"
          >
            💬 Chat trong trip
          </button>
        )}
      </div>

      {isOwner && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">Danh sách Join Requests</h2>
          <JoinRequestList tripId={trip.id} onMemberAdded={() => setTrip(t => ({...t, currentMember: t.currentMember + 1}))} />
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tripApi } from '../api/tripApi';
import { joinRequestApi } from '../api/joinRequestApi';
import TripDetailCard from '../components/trip/TripDetailCard';
import JoinRequestButton from '../components/trip/JoinRequestButton';
import JoinRequestList from '../components/trip/JoinRequestList';
import { AuthContext } from '../context/AuthContext';
import NotFoundPage from './NotFoundPage';

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinStatus, setJoinStatus] = useState(null);
  const [is404, setIs404] = useState(false);

  useEffect(() => {
    fetchTripData();
  }, [id, user]);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      setIs404(false);
      const res = await tripApi.getTripById(id);
      setTrip(res.data);
      
      if (user && user.id !== res.data.ownerId) {
        const reqRes = await joinRequestApi.getMyRequests({ tripId: id });
        const requestsList = Array.isArray(reqRes.data) ? reqRes.data : (reqRes.data?.data || []);
        const request = requestsList.find(r => String(r.tripId) === String(id));
        if (request) setJoinStatus(request.status?.toLowerCase());
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setIs404(true);
      } else {
        toast.error('Lỗi khi tải thông tin chuyến đi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chuyến đi này không? Hành động này không thể hoàn tác.')) {
      return;
    }
    try {
      await tripApi.deleteTrip(trip.id);
      toast.success('Xóa chuyến đi thành công!');
      navigate('/home');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Lỗi khi xóa chuyến đi');
    }
  };

  if (loading) {
    return <div className="p-8 max-w-4xl mx-auto"><div className="animate-pulse bg-gray-200 h-96 rounded-xl w-full"></div></div>;
  }
  if (is404 || !trip) return <NotFoundPage />;

  const isOwner = user && trip && String(user.id) === String(trip.ownerId);
  const isMember = isOwner || joinStatus === 'approved';

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 page-enter">
      <TripDetailCard trip={trip} />
      
      <div className="bg-white p-6 rounded-xl shadow flex flex-col gap-4">
        {!isOwner && (
          <JoinRequestButton 
            trip={trip} 
            currentUser={user} 
            joinStatus={joinStatus} 
            onStatusChange={(status) => {
              setJoinStatus(status);
              if (status === null) {
                setTrip(t => ({ ...t, currentMember: Math.max(1, t.currentMember - 1) }));
              }
            }} 
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

        {isOwner && (
          <button 
            onClick={handleDeleteTrip}
            className="w-full py-3 bg-red-500 text-white rounded font-bold hover:bg-red-600 transition shadow-sm"
          >
            🗑️ Xóa chuyến đi
          </button>
        )}
      </div>

      {isOwner && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">Danh sách Join Requests</h2>
          <JoinRequestList 
            tripId={trip.id} 
            onMemberAdded={() => setTrip(t => ({...t, currentMember: t.currentMember + 1}))} 
            onMemberRemoved={() => setTrip(t => ({...t, currentMember: Math.max(1, t.currentMember - 1)}))}
          />
        </div>
      )}
    </div>
  );
}

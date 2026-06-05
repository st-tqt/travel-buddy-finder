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
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    fetchTripData();
  }, [id, user]);

  const fetchMembers = async () => {
    if (!user) return;
    try {
      setLoadingMembers(true);
      const res = await joinRequestApi.getTripMembers(id);
      setMembers(res.data || []);
    } catch (e) {
      console.error('Failed to load trip members', e);
    } finally {
      setLoadingMembers(false);
    }
  };

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

      if (user) {
        await fetchMembers();
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
                fetchMembers();
              }
            }} 
          />
        )}
        
        {isMember && (
          <button 
            onClick={() => navigate(`/chat/${trip.id}`)}
            className="w-full py-3 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 transition shadow-sm"
          >
            💬 Chat nhóm chuyến đi
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

      {user && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">👥 Bạn đồng hành ({members.length})</h2>
          {loadingMembers ? (
            <div className="flex gap-3 items-center text-sm text-gray-500 animate-pulse py-2">
              <span className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></span>
              Đang tải danh sách thành viên...
            </div>
          ) : members.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có thành viên tham gia.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {members.map(m => {
                const isMe = String(m.id) === String(user.id);
                return (
                  <div 
                    key={m.id}
                    onClick={() => navigate(`/profile/${m.id}`)}
                    className="p-4 border rounded-xl flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-blue-500 transition duration-200 group bg-gray-50 hover:bg-white"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-lg group-hover:scale-105 transition duration-200">
                      {m.name?.[0]?.toUpperCase() || m.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate flex items-center gap-1.5">
                        <span>{m.name || 'Người dùng'}</span>
                        {isMe && <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-1.5 py-0.5 rounded-full">(Bạn)</span>}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{m.email}</p>
                      {m.isOwner && (
                        <span className="inline-flex items-center text-[10px] font-semibold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded mt-1">
                          👑 Trưởng đoàn
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isOwner && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">Danh sách yêu cầu tham gia</h2>
          <JoinRequestList 
            tripId={trip.id} 
            onMemberAdded={() => {
              setTrip(t => ({...t, currentMember: t.currentMember + 1}));
              fetchMembers();
            }} 
            onMemberRemoved={() => {
              setTrip(t => ({...t, currentMember: Math.max(1, t.currentMember - 1)}));
              fetchMembers();
            }}
          />
        </div>
      )}
    </div>
  );
}

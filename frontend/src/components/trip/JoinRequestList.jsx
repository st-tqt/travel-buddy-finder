import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { joinRequestApi } from '../../api/joinRequestApi';

export default function JoinRequestList({ tripId, onMemberAdded, onMemberRemoved }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [tripId]);

  const fetchRequests = async () => {
    try {
      const res = await joinRequestApi.getRequestsByTrip(tripId);
      const requestList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setRequests(requestList);
    } catch (error) {
      toast.error('Lỗi tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const originalRequests = [...requests];
    // Optimistic UI update
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
    try {
      await joinRequestApi.approveRequest(id);
      toast.success('Đã duyệt thành công');
      onMemberAdded();
    } catch (error) {
      // Rollback
      setRequests(originalRequests);
      toast.error(error.response?.data?.error || 'Lỗi khi duyệt');
    }
  };

  const handleReject = async (id) => {
    const originalRequests = [...requests];
    // Optimistic UI update
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
    try {
      await joinRequestApi.rejectRequest(id);
      toast.success('Đã từ chối');
    } catch (error) {
      // Rollback
      setRequests(originalRequests);
      toast.error(error.response?.data?.error || 'Lỗi khi từ chối');
    }
  };

  const handleRemoveMember = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi chuyến đi?')) return;
    const originalRequests = [...requests];
    setRequests(requests.filter(r => r.id !== id));
    try {
      await joinRequestApi.removeMember(id);
      toast.success('Đã xóa thành viên thành công');
      if (onMemberRemoved) onMemberRemoved();
    } catch (error) {
      // Rollback
      setRequests(originalRequests);
      toast.error(error.response?.data?.error || 'Lỗi khi xóa thành viên');
    }
  };

  if (loading) return <div className="animate-pulse bg-gray-200 h-20 w-full rounded"></div>;
  if (requests.length === 0) return <p className="text-gray-500 text-center py-4">Chưa có yêu cầu nào</p>;

  return (
    <div className="space-y-4">
      {requests.map(req => (
        <div key={req.id} className="flex items-center justify-between p-4 border rounded shadow-sm bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
              {req.userEmail?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{req.userEmail}</p>
              <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {req.status?.toLowerCase() === 'pending' ? (
              <>
                <button onClick={() => handleApprove(req.id)} className="px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition">Duyệt</button>
                <button onClick={() => handleReject(req.id)} className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 transition">Từ chối</button>
              </>
            ) : (
              <div className="flex gap-2 items-center">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded ${req.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {req.status?.toLowerCase() === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                </span>
                {req.status?.toLowerCase() === 'approved' && (
                  <button 
                    onClick={() => handleRemoveMember(req.id)}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition"
                  >
                    Xóa khỏi trip
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

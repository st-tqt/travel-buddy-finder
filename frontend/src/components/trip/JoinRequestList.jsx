import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { joinRequestApi } from '../../api/joinRequestApi';

export default function JoinRequestList({ tripId, onMemberAdded }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [tripId]);

  const fetchRequests = async () => {
    try {
      const res = await joinRequestApi.getRequestsByTrip(tripId);
      setRequests(res.data?.data || []);
    } catch (error) {
      toast.error('Lỗi tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await joinRequestApi.approveRequest(id);
      toast.success('Đã duyệt thành công');
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved' } : r));
      onMemberAdded();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Lỗi khi duyệt');
    }
  };

  const handleReject = async (id) => {
    try {
      await joinRequestApi.rejectRequest(id);
      toast.success('Đã từ chối');
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Lỗi khi từ chối');
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
          <div className="flex gap-2">
            {req.status === 'pending' ? (
              <>
                <button onClick={() => handleApprove(req.id)} className="px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition">Duyệt</button>
                <button onClick={() => handleReject(req.id)} className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 transition">Từ chối</button>
              </>
            ) : (
              <span className={`px-2.5 py-1 text-xs font-semibold rounded ${req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {req.status.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

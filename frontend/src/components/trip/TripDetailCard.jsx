import React from 'react';

export default function TripDetailCard({ trip }) {
  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'open') return 'bg-green-100 text-green-800';
    if (s === 'closed') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const s = status?.toLowerCase();
    if (s === 'open') return 'Đang mở';
    if (s === 'closed') return 'Đã đầy';
    return 'Đã kết thúc';
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      {trip.coverImage ? (
        <img src={trip.coverImage} alt="Cover" className="w-full h-72 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(trip.status)}`}>
            {getStatusText(trip.status)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <p className="text-gray-700">📍 <strong>Địa điểm:</strong> {trip.location}</p>
          <p className="text-gray-700">📅 <strong>Thời gian:</strong> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
          <p className="text-gray-700">👥 <strong>Thành viên:</strong> {trip.currentMember} / {trip.maxMembers || trip.maxMember}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {trip.tags?.map(tag => (
            <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">#{tag}</span>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Mô tả chuyến đi</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{trip.description}</p>
        </div>
      </div>
    </div>
  );
}

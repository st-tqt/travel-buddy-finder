import React, { useState } from 'react';

// Gradient đẹp - không cần internet
const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
];

const LOCATION_ICONS = {
  'sapa': '⛰️', 'núi': '⛰️', 'mountain': '⛰️',
  'biển': '🏖️', 'beach': '🏖️', 'sea': '🏖️', 'vũng tàu': '🏖️', 'nha trang': '🏖️', 'đà nẵng': '🏖️',
  'phú quốc': '🏝️', 'island': '🏝️', 'côn đảo': '🏝️',
  'hà nội': '🏛️', 'hanoi': '🏛️', 'hội an': '🏛️',
  'hồ': '🌊', 'lake': '🌊',
  'rừng': '🌲', 'forest': '🌲',
  'thành phố': '🌆', 'city': '🌆', 'tp': '🌆',
};

function getGradient(tripId) {
  const index = tripId ? tripId.charCodeAt(0) % GRADIENTS.length : 0;
  return GRADIENTS[index];
}

function getLocationIcon(location) {
  if (!location) return '✈️';
  const loc = location.toLowerCase();
  for (const [key, icon] of Object.entries(LOCATION_ICONS)) {
    if (loc.includes(key)) return icon;
  }
  return '✈️';
}

export default function TripDetailCard({ trip }) {
  const [imgError, setImgError] = useState(false);
  const gradient = getGradient(trip.id);
  const icon = getLocationIcon(trip.location);
  const showImg = trip.coverImage && !imgError;

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
      {/* Ảnh bìa hoặc gradient */}
      <div
        className="relative w-full h-72 overflow-hidden"
        style={{ background: gradient }}
      >
        {showImg ? (
          <img
            src={trip.coverImage}
            alt="Ảnh bìa chuyến đi"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <span style={{ fontSize: '4rem' }}>{icon}</span>
            <span className="text-white font-semibold text-lg tracking-widest uppercase opacity-80">
              {trip.location}
            </span>
          </div>
        )}
      </div>

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

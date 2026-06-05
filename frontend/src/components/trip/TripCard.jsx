import { Link } from 'react-router-dom';
import { useState } from 'react';

// Gradient đẹp cho ảnh bìa - không cần internet
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

// Icon địa điểm theo từ khóa
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

const TripCard = ({ trip }) => {
  const [imgError, setImgError] = useState(false);
  const gradient = getGradient(trip.id);
  const icon = getLocationIcon(trip.location);
  const showImg = trip.coverImage && !imgError;

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
      <div
        className="relative h-48 overflow-hidden"
        style={{ background: gradient }}
      >
        {showImg ? (
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-500">
            <span style={{ fontSize: '3rem' }}>{icon}</span>
            <span className="text-white/80 font-medium text-sm tracking-wide uppercase">
              {trip.location}
            </span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
          {trip.status || 'OPEN'}
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {trip.title}
          </h3>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-4 gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="truncate">{trip.location}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{new Date(trip.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{trip.currentMember || 0}/{trip.maxMembers || trip.maxMember}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
          {trip.tags?.map((tag, idx) => (
            <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        <Link
          to={`/trips/${trip.id}`}
          className="w-full block text-center bg-gray-50 border border-gray-200 text-gray-900 font-medium py-2.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors"
        >
          Xem chi tiết chuyến đi
        </Link>
      </div>
    </div>
  );
};

export default TripCard;

import { Link } from 'react-router-dom';

const TripCard = ({ trip }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-50 overflow-hidden">
        {/* Placeholder for trip image, could use unspalsh random image based on location */}
        <img 
          src={`https://source.unsplash.com/600x400/?${encodeURIComponent(trip.location || 'travel')}`} 
          alt={trip.title}
          className="w-full h-full object-cover mix-blend-overlay opacity-80 group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.style.display = 'none'; // Fallback if image fails
          }}
        />
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
          View Trip Details
        </Link>
      </div>
    </div>
  );
};

export default TripCard;

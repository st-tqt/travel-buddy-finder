import { useState, useEffect } from 'react';
import { tripApi } from '../api/tripApi';
import TripCard from '../components/trip/TripCard';

const HomePage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await tripApi.getAllTrips();
        setTrips(data);
      } catch (error) {
        console.error('Failed to fetch trips', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const filteredTrips = trips.filter(trip => 
    trip.location?.toLowerCase().includes(search.toLowerCase()) || 
    trip.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-blue-600 overflow-hidden rounded-3xl mx-4 mt-4 shadow-xl">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Travel background" 
            className="w-full h-full object-cover mix-blend-overlay opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
        </div>
        
        <div className="relative px-6 py-20 sm:px-12 sm:py-28 lg:px-16 text-center lg:text-left">
          <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl max-w-3xl">
            <span className="block mb-2">Tìm bạn đồng hành</span>
            <span className="block text-blue-200">Cho chuyến đi tiếp theo</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-blue-100 max-w-2xl">
            Khám phá thế giới cùng những người bạn mới. Hàng ngàn chuyến đi thú vị đang chờ đón bạn tham gia và trải nghiệm.
          </p>
          
          <div className="mt-10 sm:flex sm:justify-center lg:justify-start max-w-xl">
            <div className="relative w-full shadow-lg rounded-full flex bg-white p-2 border border-white/20">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-5 flex items-center">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3 rounded-full border-transparent focus:border-transparent focus:ring-0 text-gray-900 placeholder-gray-500"
                placeholder="Tìm địa điểm, ví dụ: Da Lat, Phu Quoc..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors font-medium ml-2 shadow-md">
                Tìm Kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trips Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Chuyến đi nổi bật</h2>
            <p className="mt-2 text-gray-600">Tham gia ngay các chuyến đi sắp khởi hành</p>
          </div>
          <button className="hidden sm:flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors">
            Xem tất cả
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {filteredTrips.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy chuyến đi</h3>
                <p className="mt-1 text-sm text-gray-500">Thử tìm kiếm với từ khóa khác.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTrips.map(trip => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;

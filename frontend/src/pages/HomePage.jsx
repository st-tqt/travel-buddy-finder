import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { tripApi } from '../api/tripApi';
import TripCard from '../components/trip/TripCard';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';

const HomePage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrips, setTotalTrips] = useState(0);
  const limit = 6;

  const [debouncedSearch] = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await tripApi.getTrips({
        location: debouncedSearch,
        page,
        limit
      });
      
      // Hỗ trợ cả trường hợp mock api trả về dạng array và real api trả về paginated object
      if (Array.isArray(res.data)) {
        setTrips(res.data);
        setTotalPages(1);
        setTotalTrips(res.data.length);
      } else if (res.data && Array.isArray(res.data.data)) {
        setTrips(res.data.data);
        setTotalPages(res.data.totalPages || 1);
        setTotalTrips(res.data.total || 0);
      } else {
        setTrips([]);
        setTotalPages(1);
        setTotalTrips(0);
      }
    } catch (error) {
      console.error('Failed to fetch trips', error);
      setTrips([]);
      setTotalPages(1);
      setTotalTrips(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [debouncedSearch, page]);

  return (
    <div className="min-h-screen page-enter">
      {/* Hero Section */}
      <div className="relative bg-blue-600 overflow-hidden rounded-3xl mx-4 mt-4 shadow-xl">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Ảnh nền du lịch" 
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
          <button 
            onClick={() => { setSearch(''); setPage(1); }}
            className="hidden sm:flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            Xem tất cả
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : (
          <>
            {trips.length === 0 ? (
              <EmptyState 
                icon="🧳"
                title="Không tìm thấy chuyến đi"
                message="Thử tìm kiếm với từ khóa khác hoặc tự tạo một chuyến đi mới!"
                action={{
                  label: "Tạo chuyến đi mới",
                  onClick: () => navigate('/trips/create')
                }}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {trips.map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12 border-t pt-6">
                    <button
                      onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trang trước
                    </button>
                    <span className="text-gray-600 text-sm font-semibold">
                      Trang {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;

import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 bg-gradient-to-b from-gray-50 to-white page-enter">
      <div className="text-center max-w-lg space-y-6">
        {/* Animated Travel Compass / Map Mockup icon */}
        <div className="relative flex justify-center mb-2">
          <div className="w-32 h-32 bg-blue-100/80 rounded-full flex items-center justify-center animate-bounce duration-1000 shadow-inner">
            <span className="text-6xl select-none" role="img" aria-label="compass">🧭</span>
          </div>
          <div className="absolute top-0 right-1/3 animate-ping w-3 h-3 bg-red-500 rounded-full"></div>
        </div>

        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
          404
        </h1>
        
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
            Chuyến đi này bị lạc rồi!
          </h2>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-md mx-auto">
            Trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc đường dẫn bị sai. Hãy quay lại trang chủ và khám phá chuyến đi khác nhé!
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/home" 
            className="px-8 py-3.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 active:scale-95 hover:shadow-lg transition-all duration-200"
          >
            Quay lại Trang chủ
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3.5 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 active:scale-95 transition-all duration-200"
          >
            Quay lại trang trước
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

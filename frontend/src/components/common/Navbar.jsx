import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationBadge from './NotificationBadge';
const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-3xl transform group-hover:scale-110 transition-transform">🧳</span>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
              Travel Buddy
            </span>
          </Link>
          
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                <Link 
                  to="/trips/create" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-sm flex items-center gap-1.5"
                >
                  <span className="text-base font-bold">+</span>
                  <span>Tạo chuyến đi</span>
                </Link>
                <NotificationBadge />
                <Link to={`/profile/${user?.id || 'me'}`} className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline-block">{user?.name || 'User'}</span>
                </Link>
                <button 
                  onClick={logout} 
                  className="text-gray-500 hover:text-red-600 font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-600 font-medium hover:text-blue-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-6 py-2.5 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

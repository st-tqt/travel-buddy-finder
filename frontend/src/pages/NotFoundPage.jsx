import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center px-4">
      <h1 className="text-9xl font-black text-gray-200">404</h1>
      <p className="text-2xl md:text-3xl font-light text-gray-600 mt-4 text-center">
        Oops! Page not found.
      </p>
      <p className="text-gray-500 mt-2 text-center max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        to="/" 
        className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;

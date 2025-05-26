import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, token } = useContext(AuthContext);
  
  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold text-xl">
                Healthcare Scheduler
              </Link>
            </div>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            {token ? (
              <div className="relative">
                <div className="flex items-center">
                  <span className="text-white mr-2">
                    Welcome, {user?.first_name || 'User'}
                  </span>
                  <button
                    onClick={logout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-700"
                >
                  Login
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
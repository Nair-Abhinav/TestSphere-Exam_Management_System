import React, { useContext } from 'react';
import Logo from '../assets/logo_bg_removed.png';
import axios from 'axios';
import { UserContext } from '../Context/userContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useContext(UserContext);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const loggedInType = sessionStorage.getItem('loggedInType');
      console.log('Logged-in user type:', loggedInType);
      let logoutRoute = '';
      if (loggedInType === 'Teacher') {
        logoutRoute = '/teachers/logout';
      } else if (loggedInType === 'HOD') {
        logoutRoute = '/hod/logout';
      } else if (loggedInType === 'Administrator') {
        logoutRoute = '/admin/logout';
      } else {
        console.error('Invalid user type');
        return;
      }

      // Updated axios configuration
      const response = await axios({
        method: 'get',
        url: `http://localhost:5000${logoutRoute}`,
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        logout();
        toast.success('Logged out successfully');
        window.location.href = '/';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gray-100/95 backdrop-blur supports-[backdrop-filter]:bg-gray-100/60">
      <div className="container flex h-20 items-center justify-between px-6 mx-auto">
        <a
          href="/"
          className="flex items-center space-x-3 transition-transform hover:scale-105"
        >
          <img src={Logo} alt="Logo" className="h-12 w-auto" />
        </a>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-500">Welcome,</span>
            <span className="font-medium text-gray-800">
              {user || 'Guest'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 active:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <span>Logout</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
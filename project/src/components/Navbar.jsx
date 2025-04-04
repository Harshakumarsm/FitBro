import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContexts';
import { logout } from '../firebase/auth';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { userlogin, currentuser } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <nav className="bg-white shadow-md fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-[#E7473C]">FitBro</span>
            </div>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-[#E7473C] px-3 py-2 text-sm font-medium">
              Home
            </a>
            <a href="#products" className="text-gray-700 hover:text-[#E7473C] px-3 py-2 text-sm font-medium">
              Our Products
            </a>
            <a href="#why-us" className="text-gray-700 hover:text-[#E7473C] px-3 py-2 text-sm font-medium">
              Why Us
            </a>
            <a href="#contact" className="text-gray-700 hover:text-[#E7473C] px-3 py-2 text-sm font-medium">
              Contact Us
            </a>
            
            {userlogin ? (
              <div className="relative profile-dropdown">
                <button 
                  onClick={toggleProfile}
                  className="flex items-center text-gray-700 hover:text-[#E7473C] focus:outline-none"
                >
                  <span className="mr-2">{currentuser?.email}</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button 
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/')}
                className="bg-[#E7473C] hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#E7473C] focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#home" className="block text-gray-700 hover:text-[#E7473C] px-3 py-2 text-base font-medium">
              Home
            </a>
            <a href="#products" className="block text-gray-700 hover:text-[#E7473C] px-3 py-2 text-base font-medium">
              Our Products
            </a>
            <a href="#why-us" className="block text-gray-700 hover:text-[#E7473C] px-3 py-2 text-base font-medium">
              Why Us
            </a>
            <a href="#contact" className="block text-gray-700 hover:text-[#E7473C] px-3 py-2 text-base font-medium">
              Contact Us
            </a>
            
            {userlogin ? (
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-500">
                  Signed in as: {currentuser?.email}
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-base font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/')}
                className="w-full mt-2 bg-[#E7473C] hover:bg-red-600 text-white px-4 py-2 rounded-md text-base font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
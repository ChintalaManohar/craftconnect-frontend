import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiShoppingCart, FiHeart, FiUser, FiLogOut } from 'react-icons/fi';
import logoImg from '../assets/logo.png';

function Navbar({ user, cartCount = 0, wishlistCount = 0, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLandingPage = location.pathname === '/';
  const isCustomerHome = location.pathname === '/home';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    if (isLandingPage) {
      window.addEventListener('scroll', handleScroll);
      // Run once in case page was loaded scrolled down
      handleScroll();
    } else {
      setIsScrolled(false);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isLandingPage]);

  // Close menus on path change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      const dropdownEl = document.getElementById('profile-dropdown-container');
      if (dropdownEl && !dropdownEl.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isProfileMenuOpen]);

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  // Determine Navbar styling based on state
  // Navbar is always white with a shadow to ensure perfect contrast and readability
  const navbarBgClass = 'bg-white shadow-md text-gray-800 border-b border-gray-100';

  const buttonBorderClass = 'border-primary text-primary hover:bg-primary hover:text-white';
  const registerBgClass = 'bg-primary hover:bg-primary-hover text-white';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${navbarBgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left Side: Logo */}
          <Link to={user ? (user.role === 'ARTISAN' ? '/artisan' : '/home') : '/'} className="flex items-center space-x-2.5 group">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-full border border-primary/20 bg-white shadow-sm overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
              <img 
                src={logoImg} 
                alt="CraftConnect Logo" 
                className="h-full w-full object-cover scale-[1.28]" 
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight font-sans text-primary">
              Craft<span className="text-accent">Connect</span>
            </span>
          </Link>

          {/* Center Side: Links for logged in Buyer */}
          {user && user.role === 'BUYER' && location.pathname !== '/' && (
            <div className="hidden md:flex items-center space-x-8 font-medium">
              <Link 
                to="/home" 
                className={`hover:text-primary transition-colors duration-200 pb-1 ${
                  location.pathname === '/home' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-gray-500'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/wishlist" 
                className={`hover:text-primary transition-colors duration-200 flex items-center space-x-1 pb-1 ${
                  location.pathname === '/wishlist' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-gray-500'
                }`}
              >
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link 
                to="/cart" 
                className={`hover:text-primary transition-colors duration-200 flex items-center space-x-1 pb-1 ${
                  location.pathname === '/cart' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-gray-500'
                }`}
              >
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          )}

          {/* Right Side: Auth / Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className={`px-4 sm:px-5 py-2 rounded-full border transition-all duration-300 font-medium text-sm sm:text-base ${buttonBorderClass}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 sm:px-5 py-2 rounded-full transition-all duration-300 font-medium text-sm sm:text-base shadow ${registerBgClass}`}
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="relative" id="profile-dropdown-container">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary text-accent font-semibold flex items-center justify-center border border-primary/20">
                    {user.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                  </div>
                  <span className="font-medium text-sm max-w-[120px] truncate">{user.name}</span>
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 text-gray-700 transform origin-top-right transition-all duration-200">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs text-gray-400 font-medium">Logged in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.role}</p>
                    </div>
                    {user.role === 'BUYER' ? (
                      <>
                        <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-primary transition-colors duration-150">
                          <span className="mr-2.5 text-base">👤</span> Profile
                        </Link>
                        <Link to="/orders" className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-primary transition-colors duration-150">
                          <span className="mr-2.5 text-base">📦</span> Orders
                        </Link>
                      </>
                    ) : (
                      <Link to="/artisan" className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-primary transition-colors duration-150">
                        <span className="mr-2.5 text-base">👤</span> Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 transition-colors duration-150 border-t border-gray-50"
                    >
                      <span className="mr-2.5 text-base">🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger Menu for Mobile */}
          <div className="md:hidden flex items-center">
            {user && user.role === 'BUYER' && location.pathname !== '/' && (
              <div className="flex items-center space-x-3 mr-4">
                <Link to="/wishlist" className="relative p-1.5 text-current hover:text-primary transition-colors">
                  <FiHeart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="relative p-1.5 text-current hover:text-primary transition-colors">
                  <FiShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] px-1 rounded-full font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg focus:outline-none hover:bg-gray-100/10 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-inner text-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user && user.role === 'BUYER' && location.pathname !== '/' && (
              <>
                <Link
                  to="/home"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-50 hover:text-primary"
                >
                  Home
                </Link>
                <Link
                  to="/wishlist"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-50 hover:text-primary"
                >
                  Wishlist ({wishlistCount})
                </Link>
                <Link
                  to="/cart"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-50 hover:text-primary"
                >
                  Cart ({cartCount})
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-50 hover:text-primary"
                >
                  👤 Profile
                </Link>
                <Link
                  to="/orders"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-50 hover:text-primary"
                >
                  📦 Orders
                </Link>
              </>
            )}
            {!user ? (
              <div className="grid grid-cols-2 gap-2 px-3 py-2">
                <Link
                  to="/login"
                  className="w-full text-center px-4 py-2 rounded-full border border-primary text-primary font-medium text-sm hover:bg-primary hover:text-white transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center px-4 py-2 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-all"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-3 pb-1 px-3">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-secondary text-accent font-semibold flex items-center justify-center">
                    {user.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-400">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <span className="mr-2 text-base">🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

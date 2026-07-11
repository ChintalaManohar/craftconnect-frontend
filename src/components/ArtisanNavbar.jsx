import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiBriefcase, FiShoppingBag, FiBarChart2 } from 'react-icons/fi';
import logoImg from '../assets/logo.png';
import { artisanProfileService, isProfileComplete } from '../services/api';

function ArtisanNavbar({ user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Fetch profile status and setup body class
  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const profile = await artisanProfileService.getProfile();
        const complete = isProfileComplete(profile);
        setProfileComplete(complete);
        
        if (!complete) {
          document.body.classList.add('artisan-profile-incomplete');
        } else {
          document.body.classList.remove('artisan-profile-incomplete');
        }
      } catch (e) {
        console.error('Error fetching profile for navbar', e);
      }
    };

    checkProfileStatus();
    const interval = setInterval(checkProfileStatus, 2000);

    return () => {
      clearInterval(interval);
      document.body.classList.remove('artisan-profile-incomplete');
    };
  }, []);

  // Close dropdown and mobile menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target) && !e.target.closest('.hamburger-btn')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const navItems = [
    { name: 'Products', path: '/artisan/products', icon: <FiBriefcase className="mr-1.5" /> },
    { name: 'Orders', path: '/artisan/orders', icon: <FiShoppingBag className="mr-1.5" /> },
    { name: 'Statistics', path: '/artisan/statistics', icon: <FiBarChart2 className="mr-1.5" /> },
  ];

  return (
    <>
      {!profileComplete && (
        <div className="bg-amber-500 text-white text-center py-2 px-4 text-xs sm:text-sm font-bold flex items-center justify-center space-x-3 fixed top-0 left-0 right-0 z-50 shadow-md h-10 select-none">
          <span>Complete your artisan profile before adding products.</span>
          <Link
            to="/artisan/profile"
            className="bg-white text-amber-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase hover:bg-amber-50 transition-colors shadow-sm cursor-pointer animate-pulse"
          >
            Complete Profile
          </Link>
        </div>
      )}
      <nav className={`bg-white border-b border-gray-100 fixed left-0 right-0 z-40 shadow-sm flex items-center transition-all duration-300 ${!profileComplete ? 'top-10 h-16 sm:h-20' : 'top-0 h-16 sm:h-20'}`}>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <Link to="/artisan/products" className="flex items-center space-x-2.5 group">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-primary/20 bg-white shadow-sm overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
              <img 
                src={logoImg} 
                alt="CraftConnect Logo" 
                className="h-full w-full object-cover scale-[1.28]" 
              />
            </div>
            <span className="text-base sm:text-lg font-bold text-accent font-sans">
              Craft<span className="text-primary">Connect</span>
              <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase ml-2 font-extrabold tracking-wider">
                Artisan
              </span>
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation NavLinks */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-bold flex items-center transition-colors pb-1 border-b-2 ${
                  isActive 
                    ? 'text-primary border-primary' 
                    : 'text-gray-400 border-transparent hover:text-primary hover:border-primary/50'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Right: Profile Dropdown & Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          
          {/* Profile Dropdown (Desktop) */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-secondary hover:bg-secondary-hover text-accent font-bold text-sm sm:text-base flex items-center justify-center border border-primary/20 shadow-sm transition-all focus:outline-none select-none cursor-pointer"
            >
              {user?.name ? getInitials(user.name) : 'A'}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-gray-50">
                  <p className="text-xs font-bold text-accent truncate">{user?.name || 'Artisan Partner'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email || 'artisan@craftconnect.com'}</p>
                </div>
                
                <Link
                  to="/artisan/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-2 font-semibold transition-colors"
                >
                  <FiUser className="text-gray-400 text-sm" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-red-500 hover:bg-red-50 flex items-center space-x-2 font-bold transition-colors cursor-pointer border-t border-gray-50"
                >
                  <FiLogOut className="text-red-400 text-sm" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-accent hamburger-btn transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer (Mobile) */}
      {isMenuOpen && (
        <div 
          ref={menuRef}
          className="md:hidden absolute top-16 sm:top-20 left-0 right-0 bg-white border-b border-gray-100 shadow-lg py-4 px-6 z-50 flex flex-col space-y-4 animate-in slide-in-from-top duration-300"
        >
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `py-2.5 px-4 rounded-xl text-sm font-bold flex items-center transition-all ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 flex flex-col space-y-2">
            <Link
              to="/artisan/profile"
              onClick={() => setIsMenuOpen(false)}
              className="py-2.5 px-4 rounded-xl text-sm font-bold flex items-center space-x-2 text-gray-500 hover:bg-gray-50 hover:text-accent transition-all"
            >
              <FiUser className="text-gray-400" />
              <span>Profile</span>
            </Link>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogoutClick();
              }}
              className="w-full text-left py-2.5 px-4 rounded-xl text-sm font-extrabold flex items-center space-x-2 text-red-500 hover:bg-red-50 transition-all cursor-pointer"
            >
              <FiLogOut className="text-red-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
    </>
  );
}

export default ArtisanNavbar;

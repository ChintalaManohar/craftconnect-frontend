import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import logoImg from '../assets/logo.png';

function Footer() {
  return (
    <footer className="bg-accent text-white pt-16 pb-8 border-t border-[#7A4E31]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="h-9 w-9 rounded-full border border-white/20 bg-white shadow-sm overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
                <img 
                  src={logoImg} 
                  alt="CraftConnect Logo" 
                  className="h-full w-full object-cover scale-[1.28]" 
                />
              </div>
              <span className="text-xl font-bold tracking-tight font-sans">
                Craft<span className="text-secondary">Connect</span>
              </span>
            </Link>
            <p className="text-[#E7DFD5] text-sm leading-relaxed">
              Empowering India's rural artisans by connecting them directly with craft lovers worldwide. Discover unique, premium, authentic handmade treasures.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-secondary hover:text-accent transition-colors duration-200" aria-label="Facebook">
                <FiFacebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-secondary hover:text-accent transition-colors duration-200" aria-label="Instagram">
                <FiInstagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-secondary hover:text-accent transition-colors duration-200" aria-label="Twitter">
                <FiTwitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-secondary mb-4 font-sans">Explore</h3>
            <ul className="space-y-2.5 text-sm text-[#E7DFD5]">
              <li>
                <Link to="/" className="hover:text-white transition-colors duration-200">About Us</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors duration-200">Become an Artisan</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors duration-200">Shop Marketplace</Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">Artisan Stories</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div>
            <h3 className="text-lg font-semibold text-secondary mb-4 font-sans">Contact Us</h3>
            <ul className="space-y-3.5 text-sm text-[#E7DFD5]">
              <li className="flex items-start space-x-3">
                <FiMapPin className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>CraftConnect India, Craft House, Connaught Place, New Delhi - 110001</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="h-4 w-4 text-secondary flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="h-4 w-4 text-secondary flex-shrink-0" />
                <span>support@craftconnect.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-secondary mb-4 font-sans">Artisanal News</h3>
            <p className="text-[#E7DFD5] text-sm mb-4">
              Subscribe to get updates on new arrivals, weaver stories, and exclusive offers.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex space-x-2">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:border-secondary transition-colors duration-200 text-sm"
                required
              />
              <button
                type="submit"
                className="bg-secondary text-accent font-semibold px-4 py-2 rounded-lg hover:bg-secondary-hover transition-colors duration-200 text-sm"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#7A4E31] pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#E7DFD5]">
          <p>© 2026 CraftConnect. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Terms & Conditions</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

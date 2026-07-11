import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiCalendar, FiPackage, FiAward, FiBookOpen } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { artisanPublicService } from '../services/api';

function ArtisanProfileView({ user, cart, wishlist, onAddToCart, onWishlistToggle, onLogout }) {
  const { artisanId } = useParams();
  const navigate = useNavigate();

  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtisanDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const artisanData = await artisanPublicService.getArtisanById(artisanId);
        setArtisan(artisanData);

        const artisanProducts = await artisanPublicService.getArtisanProducts(artisanId);
        setProducts(artisanProducts);
      } catch (err) {
        console.error('Error fetching public artisan profile:', err);
        setError('Failed to load artisan profile. Artisan not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtisanDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [artisanId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background-warm pt-16 sm:pt-20">
        <Navbar user={user} cartCount={cart.reduce((a, c) => a + (c.quantity || 1), 0)} wishlistCount={wishlist.length} onLogout={onLogout} />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-[250px] bg-gray-200 rounded-3xl"></div>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="space-y-2 flex-grow">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="h-40 bg-gray-200 rounded-3xl"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div className="min-h-screen flex flex-col bg-background-warm pt-16 sm:pt-20">
        <Navbar user={user} cartCount={cart.reduce((a, c) => a + (c.quantity || 1), 0)} wishlistCount={wishlist.length} onLogout={onLogout} />
        <main className="flex-grow flex flex-col items-center justify-center py-20 px-4">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-md text-center max-w-md w-full">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Artisan Profile Offline</h2>
            <p className="text-gray-500 mb-6">{error || 'This artisan could not be found.'}</p>
            <button onClick={() => navigate(-1)} className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full font-semibold shadow-sm transition-all duration-300">
              <FiArrowLeft />
              <span>Go Back</span>
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const cartCount = cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  const specialties = artisan?.specialties || [];
  const artisanProducts = products || [];

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      <Navbar
        user={user}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onLogout={onLogout}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back navigation */}
        <button onClick={() => navigate(-1)} className="inline-flex items-center space-x-2 text-gray-500 hover:text-primary font-semibold mb-6 transition-colors duration-200 cursor-pointer">
          <FiArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        {/* Header Cover Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white mb-10">
          <div className="h-48 sm:h-64 md:h-72 w-full bg-gray-100 overflow-hidden relative">
            <img
              src={artisan.coverImage}
              alt={`${artisan.name} banner`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Artisan Info Bar */}
          <div className="relative px-6 pb-6 sm:px-8 sm:pb-8 flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20 space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow overflow-hidden bg-white relative z-10 flex-shrink-0">
              <img
                src={artisan.avatar}
                alt={artisan.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow relative z-10">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full">
                {artisan.category} Creator
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mt-2">
                {artisan.name}
              </h1>
              <p className="text-gray-500 text-sm flex items-center justify-center sm:justify-start space-x-1 mt-1 font-semibold">
                <FiMapPin className="h-4 w-4 text-accent" />
                <span>{artisan.village}, {artisan.district}, {artisan.state}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid: Info Cards (Left) & Story / Catalog (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: Shop Statistics Card */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-3">Shop Stats</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3.5">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <FiAward className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Experience</div>
                    <div className="text-sm font-bold text-gray-700 mt-0.5">{artisan.experience}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3.5">
                  <div className="p-3 bg-secondary/20 rounded-2xl text-accent">
                    <FiPackage className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Sales</div>
                    <div className="text-sm font-bold text-gray-700 mt-0.5">{artisan.ordersCompleted}+ orders completed</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3.5">
                  <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                    <FiCalendar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Member Since</div>
                    <div className="text-sm font-bold text-gray-700 mt-0.5">{artisan.memberSince}</div>
                  </div>
                </div>
              </div>

              {/* Specialties List */}
              <div className="pt-4 border-t border-gray-50 space-y-2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-gray-400">Craft Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty, index) => (
                    <span key={index}>
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Story and Catalog */}
          <div className="lg:col-span-2 space-y-8">

            {/* My Story Biography */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <FiBookOpen className="text-primary h-5 w-5" />
                <span>My Story: {artisan.storyTitle}</span>
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans">
                {artisan.storyDescription}
              </p>
            </div>

            {/* Catalog Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Products Created by {artisan.name}
                </h2>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {products.length} Products
                </span>
              </div>

              {products.length === 0 ? (
                <div className="bg-white border border-gray-100 p-8 rounded-3xl text-center text-gray-400">
                  This artisan hasn't posted any products yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {artisanProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      inWishlist={wishlist.includes(p.id)}
                      onWishlistToggle={onWishlistToggle}
                      onAddToCart={onAddToCart}
                      isAddedToCart={cart.some((item) => item.id === p.id)}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ArtisanProfileView;

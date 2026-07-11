import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiStar, FiArrowRight } from 'react-icons/fi';
import { productService } from '../services/api';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

function Wishlist({ user, cart, wishlist, onAddToCart, onWishlistToggle, onLogout }) {
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [justAddedId, setJustAddedId] = useState(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      setIsLoading(true);
      try {
        const data = await productService.getAllProducts();
        setAllProducts(data);
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  const handleAddToCartWrapper = (product) => {
    onAddToCart(product);
    setJustAddedId(product.id);
    setTimeout(() => {
      setJustAddedId(null);
    }, 1500);
  };

  // Filter items in wishlist
  const wishlistedItems = allProducts.filter((p) => wishlist.includes(p.id));

  // Recommendations: Curate products not in wishlist
  const recommendedItems = allProducts
    .filter((p) => !wishlist.includes(p.id))
    .slice(0, 4); // Limit to top 4 recommendations

  const cartCount = cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      {/* Navbar */}
      <Navbar
        user={user}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="text-xs sm:text-sm text-gray-400 font-semibold mb-6 flex items-center space-x-2">
          <Link to="/home" className="hover:text-primary transition-colors">Marketplace</Link>
          <span>&bull;</span>
          <span className="text-accent">My Wishlist</span>
        </nav>

        {/* Header */}
        <div className="flex items-center space-x-2.5 mb-8">
          <div className="p-2.5 bg-red-50 text-red-500 rounded-xl">
            <FiHeart className="h-6 w-6 fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-accent font-sans">
            My Wishlist ({wishlistedItems.length})
          </h1>
        </div>

        {/* Wishlist Items Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-400 text-sm">Loading wishlist...</p>
          </div>
        ) : wishlistedItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <FiHeart className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-accent font-sans">Your wishlist is empty</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              Explore CraftConnect marketplace to discover and save authentic handmade items.
            </p>
            <Link
              to="/home"
              className="mt-6 inline-flex items-center space-x-2 bg-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-primary-hover shadow transition-all duration-300"
            >
              <span>Explore Crafts</span>
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mb-16">
            {wishlistedItems.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                inWishlist={true}
                onWishlistToggle={onWishlistToggle}
                onAddToCart={handleAddToCartWrapper}
                isAddedToCart={justAddedId === product.id || cart.some(item => item.id === product.id)}
              />
            ))}
          </div>
        )}

        {/* Recommended for You Section */}
        <section className="border-t border-gray-150 pt-12 mt-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-accent font-sans">Recommended for You</h2>
              <p className="text-gray-500 text-sm mt-1">Other unique crafts you might appreciate</p>
            </div>
            <Link to="/home" className="text-primary hover:text-primary-hover font-bold text-sm flex items-center space-x-1">
              <span>View All</span>
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : recommendedItems.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-6">
              No recommendations available at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
              {recommendedItems.map((product) => (
                <ProductCard
                  key={`rec-${product.id}`}
                  product={product}
                  inWishlist={wishlist.includes(product.id)}
                  onWishlistToggle={onWishlistToggle}
                  onAddToCart={handleAddToCartWrapper}
                  isAddedToCart={justAddedId === product.id || cart.some(item => item.id === product.id)}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Wishlist;

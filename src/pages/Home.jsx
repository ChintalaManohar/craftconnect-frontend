import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiSliders, FiHeart, FiShoppingCart, FiShoppingBag, FiInfo } from 'react-icons/fi';
import { productService } from '../services/api';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

function Home({ user, cart, wishlist, onAddToCart, onWishlistToggle, onLogout }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isLoading, setIsLoading] = useState(false);
  const [justAddedId, setJustAddedId] = useState(null);

  // Sync category state with search query param
  useEffect(() => {
    const cat = searchParams.get('category') || 'All';
    setSelectedCategory(cat);
  }, [searchParams]);

  // Load products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);

      try {
        let data = [];

        if (searchQuery.trim()) {
          data = await productService.searchProducts(searchQuery);
        } else {
          data = await productService.getAllProducts();
          console.log(data);
        }

        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a slight debounce for search input
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Update URL parameter
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleAddToCartWrapper = (product) => {
    onAddToCart(product);
    setJustAddedId(product.id);
    setTimeout(() => {
      setJustAddedId(null);
    }, 1500);
  };

  const categoriesList = ['All', 'Pottery', 'Paintings', 'Textiles', 'Woodwork', 'Jewelry', 'Home Decor'];

  // Sum up quantity in cart
  const cartCount = cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      {/* Customer Navbar */}
      <Navbar
        user={user}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onLogout={onLogout}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Marketplace Banner */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/15 border border-primary/10 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-bl-full pointer-events-none"></div>
          <h1 className="text-2xl sm:text-3xl font-bold text-accent font-sans">
            CraftConnect Marketplace
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-xl">
            Explore and buy directly from thousands of talented rural creators, keeping Indian art forms alive.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-lg w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
              <FiSearch className="h-5 w-5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or artisan..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </form>

          {/* Category Selector (Pills + Dropdown style) */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="flex-shrink-0 text-gray-400">
              <FiSliders className="h-5 w-5" />
            </div>

            {/* Dropdown for smaller screens / fast choice */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full md:w-56 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Visual Pills for Category selection (Hidden on mobile, beautiful on desktop) */}
        <div className="hidden lg:flex items-center space-x-2.5 mb-8 overflow-x-auto pb-2">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4.5 py-2 rounded-full font-semibold text-xs transition-all duration-200 cursor-pointer ${selectedCategory === cat
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-gray-100 text-gray-500 hover:text-accent hover:border-gray-300'
                }`}
            >
              {cat === 'All' ? '🎨 All Crafts' : cat}
            </button>
          ))}
        </div>

        {/* Products Grid / Loading States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-400 text-sm font-medium">Curating unique crafts...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-xl mx-auto shadow-sm my-10">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-primary flex items-center justify-center mx-auto mb-4">
              <FiInfo className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-accent font-sans">No products found</h3>
            <p className="text-gray-500 text-sm mt-2">
              We couldn't find matches for "{searchQuery}" {selectedCategory !== 'All' ? `in ${selectedCategory}` : ''}. Try another search or filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                handleCategoryChange('All');
              }}
              className="mt-6 px-6 py-2.5 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary-hover shadow transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mb-16">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                inWishlist={wishlist.includes(product.id)}
                onWishlistToggle={onWishlistToggle}
                onAddToCart={handleAddToCartWrapper}
                isAddedToCart={justAddedId === product.id || cart.some(item => item.id === product.id)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;

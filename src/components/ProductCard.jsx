import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar, FiCheck } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

function ProductCard({ product, inWishlist, onWishlistToggle, onAddToCart, isAddedToCart }) {
  const {
    name,
    artisanName,
    price,
    imageUrl,
    category,
    rating
  } = product;
  const navigate = useNavigate();

  const artisanMap = {
    'Ramesh Kumar': '101',
    'Sunita Devi': '102',
    'Arjun Dev': '103',
    'Vikram Singh': '104',
    'Priya Sen': '105',
    'Rajesh Lohar': '106'
  };
  const artisanId = artisanMap[artisanName] || '102';

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(`/products/${product.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group flex flex-col h-full relative cursor-pointer"
    >
      {/* Product Image and Overlay Tags */}
      <div className="relative pt-[100%] bg-gray-50 overflow-hidden">
        <Link to={`/products/${product.id}`}>
          <img
            src={
              imageUrl ||
              "https://via.placeholder.com/400x400?text=CraftConnect"
            }
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Category Tag */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-accent text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full shadow-sm pointer-events-none">
          {category}
        </span>

        {/* Wishlist Button Overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlistToggle(product.id);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm shadow-sm transition-all duration-300 focus:outline-none cursor-pointer ${inWishlist
            ? 'bg-red-50 text-red-500 hover:bg-red-100'
            : 'bg-white/80 text-gray-500 hover:text-red-500 hover:bg-white'
            }`}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {inWishlist ? (
            <FaHeart className="h-4.5 w-4.5 animate-bounce-short" />
          ) : (
            <FiHeart className="h-4.5 w-4.5" />
          )}
        </button>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Artisan & Rating */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-medium font-sans">
              By <Link to={`/artisan/${artisanId}`} className="text-primary font-semibold hover:underline">{artisanName}</Link>
            </span>
            <div className="flex items-center text-amber-500 space-x-0.5">
              <FiStar className="fill-current h-3.5 w-3.5" />
              <span className="font-bold text-gray-700">{rating}</span>
            </div>
          </div>

          {/* Product Name */}
          <Link to={`/products/${product.id}`}>
            <h3 className="text-gray-800 font-bold text-sm sm:text-base leading-snug font-sans group-hover:text-primary transition-colors duration-200 line-clamp-2 mt-1">
              {name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Add To Cart Button */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Price</span>
            <span className="text-lg font-bold text-accent font-sans">
              ₹{price}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className={`flex items-center justify-center space-x-1.5 px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 shadow focus:outline-none cursor-pointer ${isAddedToCart
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-primary hover:bg-primary-hover text-white'
              }`}
          >
            {isAddedToCart ? (
              <>
                <FiCheck className="h-4 w-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <FiShoppingCart className="h-3.5 w-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;

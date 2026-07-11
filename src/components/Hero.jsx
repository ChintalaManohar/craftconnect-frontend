import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

function Hero({ user, onExploreClick }) {
  return (
    <div className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-to-br from-[#FAF7F2] via-[#F4EDE2] to-[#E9DCB9]">
      {/* Background Decorative Circles */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#8B5E3C]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-[#D4A373]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-6 max-w-xl mx-auto lg:mx-0">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-accent uppercase tracking-wider">
              🇮🇳 Celebrating Traditional Craftsmanship
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-accent font-sans leading-tight">
              Discover Authentic <span className="text-primary">Handmade</span> Crafts
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Connecting Rural Artisans with Customers Across India. Discover authentic heritage, support native communities, and purchase direct from creators.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Explore Crafts</span>
                <FiArrowRight className="h-5 w-5" />
              </button>
              
              <Link
                to={user ? "/artisan" : "/register?role=artisan"}
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent hover:bg-primary/5 text-primary border-2 border-primary font-semibold rounded-full text-center transition-all duration-300"
              >
                Become an Artisan
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200/50 text-center lg:text-left">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-accent">5000+</p>
                <p className="text-xs text-gray-500 font-medium">Artisans Connected</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-accent">20+</p>
                <p className="text-xs text-gray-500 font-medium">States Represented</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-accent">100%</p>
                <p className="text-xs text-gray-500 font-medium">Genuine Handmade</p>
              </div>
            </div>
          </div>

          {/* Right Column: Collage */}
          <div className="lg:col-span-7 relative flex justify-center items-center h-[420px] sm:h-[480px] lg:h-[520px]">
            {/* Collage Grid wrapper */}
            <div className="relative w-full max-w-[480px] lg:max-w-none h-full grid grid-cols-2 gap-4 sm:gap-6 p-4">
              
              {/* Card 1: Pottery */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-[80%] my-auto bg-amber-50">
                <img
                  src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80"
                  alt="Clay Pottery"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-secondary tracking-widest">Heritage</span>
                    <h3 className="text-white font-bold text-sm sm:text-base">Clay Pottery</h3>
                  </div>
                </div>
              </div>

              {/* Card 2: Paintings */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-[85%] self-start bg-amber-50">
                <img
                  src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&auto=format&fit=crop&q=80"
                  alt="Madhubani Paintings"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-secondary tracking-widest">Fine Art</span>
                    <h3 className="text-white font-bold text-sm sm:text-base">Traditional Paintings</h3>
                  </div>
                </div>
              </div>

              {/* Card 3: Wooden Crafts */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-[85%] self-end bg-amber-50">
                <img
                  src="https://images.unsplash.com/photo-1606744824163-985d376605aa?w=600&auto=format&fit=crop&q=80"
                  alt="Wooden Crafts"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-secondary tracking-widest">Carving</span>
                    <h3 className="text-white font-bold text-sm sm:text-base">Teakwood Crafts</h3>
                  </div>
                </div>
              </div>

              {/* Card 4: Handloom Products */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-[80%] my-auto bg-amber-50">
                <img
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80"
                  alt="Handloom Weaving"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-secondary tracking-widest">Weaves</span>
                    <h3 className="text-white font-bold text-sm sm:text-base">Handloom Textiles</h3>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Hero;

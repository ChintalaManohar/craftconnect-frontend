import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUsers, FiAward, FiTrendingUp, FiShoppingBag, FiArrowRight, FiUserCheck, FiPlusCircle, FiList, FiTrendingDown, FiMapPin, FiGrid, FiHeart, FiCoffee, FiScissors, FiHome } from 'react-icons/fi';
import { FaPaintBrush, FaStore, FaFileInvoiceDollar, FaBoxOpen, FaHammer, FaGem } from 'react-icons/fa';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeatureCard from '../components/FeatureCard';
import CategoryCard from '../components/CategoryCard';
import Footer from '../components/Footer';

function LandingPage({ user, onLogout }) {
  const categoriesRef = useRef(null);
  const navigate = useNavigate();

  const handleExploreClick = () => {
    categoriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCategoryClick = (category) => {
    navigate(`/login?redirect=home&category=${category}`);
  };

  const features = [
    {
      icon: FiUsers,
      title: 'Direct From Artisans',
      description: 'Buy directly from rural creators without middlemen. Support honest labor and fair pricing.',
    },
    {
      icon: FiAward,
      title: 'Authentic Handmade Products',
      description: 'Unique products crafted with generational expertise and raw regional materials.',
    },
    {
      icon: FiTrendingUp,
      title: 'Empower Rural Communities',
      description: 'Support local artisans and their families directly, fostering sustainable livelihoods.',
    },
  ];

  const categories = [
    {
      name: 'Pottery',
      icon: FiCoffee,
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Paintings',
      icon: FaPaintBrush,
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Textiles',
      icon: FiScissors,
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Woodwork',
      icon: FaHammer,
      image: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Jewelry',
      icon: FaGem,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Home Decor',
      icon: FiHome,
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const customerSteps = [
    {
      number: '01',
      title: 'Browse Products',
      description: 'Explore unique crafts categorized by state and traditional origins.',
      icon: FiList,
    },
    {
      number: '02',
      title: 'Add to Cart',
      description: 'Collect your favorite handmade treasures into your shopping basket.',
      icon: FiShoppingBag,
    },
    {
      number: '03',
      title: 'Place Order',
      description: 'Check out securely with direct payouts routed towards the artisan.',
      icon: FaFileInvoiceDollar,
    },
    {
      number: '04',
      title: 'Receive Product',
      description: 'Get your custom crafted parcel shipped straight to your doorstep.',
      icon: FaBoxOpen,
    },
  ];

  const artisanSteps = [
    {
      number: '01',
      title: 'Register Profile',
      description: 'Create an account and setup your digital workshop profile easily.',
      icon: FiUserCheck,
    },
    {
      number: '02',
      title: 'Add Products',
      description: 'Upload high-quality images and description details for your items.',
      icon: FiPlusCircle,
    },
    {
      number: '03',
      title: 'Receive Orders',
      description: 'Get real-time booking alerts when customers purchase your crafts.',
      icon: FaStore,
    },
    {
      number: '04',
      title: 'Earn Income',
      description: 'Secure direct payments directly transferred straight to your bank.',
      icon: FiTrendingUp,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans">
      {/* Sticky Scroll-reactive Navbar */}
      <Navbar user={user} onLogout={onLogout} />

      {/* Hero Section */}
      <Hero user={user} onExploreClick={handleExploreClick} />

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-accent font-sans">
              Why CraftConnect?
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded"></div>
            <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
              Many talented rural artisans struggle to reach customers directly. CraftConnect bridges this gap by connecting artisans with buyers through a modern online marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <FeatureCard
                key={idx}
                icon={feat.icon}
                title={feat.title}
                description={feat.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section ref={categoriesRef} className="py-20 bg-background-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-accent font-sans">
              Featured Categories
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded"></div>
            <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
              Explore outstanding creations, passed down through generations of rural artisan heritage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {categories.map((cat, idx) => (
              <CategoryCard
                key={idx}
                name={cat.name}
                icon={cat.icon}
                image={cat.image}
                onClick={() => handleCategoryClick(cat.name)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-accent font-sans">
              How It Works
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded"></div>
            <p className="text-gray-600 leading-relaxed">
              We facilitate a simple, premium connection ecosystem whether you are an art lover or a creative master.
            </p>
          </div>

          {/* Workflow Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
            
            {/* Customer Timeline Card */}
            <div className="bg-background-warm/55 rounded-3xl p-8 sm:p-10 border border-gray-100/50 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
              <div>
                <h3 className="text-2xl font-bold text-accent font-sans mb-2">Customer Journey</h3>
                <p className="text-gray-500 text-sm mb-8">Four easy steps to secure authentic Indian heritage items</p>
                
                {/* Timeline Grid */}
                <div className="space-y-6 relative border-l-2 border-primary/20 pl-6 ml-4">
                  {customerSteps.map((step, idx) => {
                    const StepIcon = step.icon;
                    return (
                      <div key={idx} className="relative group">
                        {/* Timeline Circle Bullet */}
                        <div className="absolute -left-[35px] top-1 w-6.5 h-6.5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-4 border-white shadow-sm group-hover:bg-accent transition-colors duration-200">
                          {idx + 1}
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-white rounded-lg shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                            <StepIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 group-hover:text-primary transition-colors text-base font-sans">{step.title}</h4>
                            <p className="text-gray-500 text-sm leading-relaxed mt-0.5">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-2 text-primary font-bold hover:text-primary-hover hover:underline transition-colors"
                >
                  <span>Start Exploring Now</span>
                  <FiArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Artisan Timeline Card */}
            <div className="bg-background-warm/55 rounded-3xl p-8 sm:p-10 border border-gray-100/50 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/15 rounded-bl-full pointer-events-none"></div>
              <div>
                <h3 className="text-2xl font-bold text-accent font-sans mb-2">Artisan Journey</h3>
                <p className="text-gray-500 text-sm mb-8">Empower your creative workshop and expand your customer reach</p>

                {/* Timeline Grid */}
                <div className="space-y-6 relative border-l-2 border-secondary/30 pl-6 ml-4">
                  {artisanSteps.map((step, idx) => {
                    const StepIcon = step.icon;
                    return (
                      <div key={idx} className="relative group">
                        {/* Timeline Circle Bullet */}
                        <div className="absolute -left-[35px] top-1 w-6.5 h-6.5 bg-secondary text-accent text-[10px] font-bold rounded-full flex items-center justify-center border-4 border-white shadow-sm group-hover:bg-accent group-hover:text-white transition-colors duration-200">
                          {idx + 1}
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-white rounded-lg shadow-sm text-secondary group-hover:bg-secondary group-hover:text-accent transition-colors duration-200">
                            <StepIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 group-hover:text-accent transition-colors text-base font-sans">{step.title}</h4>
                            <p className="text-gray-500 text-sm leading-relaxed mt-0.5">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link
                  to="/register?role=artisan"
                  className="inline-flex items-center space-x-2 text-accent font-bold hover:text-accent-hover hover:underline transition-colors"
                >
                  <span>Register as an Artisan</span>
                  <FiArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default LandingPage;

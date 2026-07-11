import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiUsers,
  FiBriefcase,
  FiShoppingBag,
  FiDollarSign,
  FiClock,
  FiLayout,
  FiPlus,
  FiArrowRight,
  FiUserPlus
} from 'react-icons/fi';
import { adminDashboardService } from '../services/api';
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';

const getInitials = (name) => {
  if (!name) return "?";

  return name
    .trim()
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase();
};

function AdminDashboard({ user, onLogout }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const data = await adminDashboardService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen flex flex-col bg-background-warm pt-16 sm:pt-20">
        <AdminNavbar user={user} onLogout={onLogout} />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-28 bg-gray-200 rounded-3xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="h-96 bg-gray-200 rounded-3xl"></div>
              <div className="h-96 bg-gray-200 rounded-3xl"></div>
              <div className="h-96 bg-gray-200 rounded-3xl"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { stats, recentOrders, recentArtisans, recentProducts } = dashboardData;

  const statCards = [
    { label: 'Total Customers', value: stats.totalCustomers, icon: <FiUsers className="h-5 w-5" />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Total Artisans', value: stats.totalArtisans, icon: <FiUserPlus className="h-5 w-5" />, color: 'bg-purple-50 text-purple-600 border-purple-100' },
    { label: 'Total Products', value: stats.totalProducts, icon: <FiBriefcase className="h-5 w-5" />, color: 'bg-green-50 text-green-600 border-green-100' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <FiShoppingBag className="h-5 w-5" />, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: <FiDollarSign className="h-5 w-5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: <FiClock className="h-5 w-5" />, color: 'bg-red-50 text-red-600 border-red-100' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      <AdminNavbar user={user} onLogout={onLogout} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-accent/10 text-accent rounded-2xl flex-shrink-0">
              <FiLayout className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-accent font-sans">Admin Dashboard</h1>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Global overview metrics and recent activity feeds</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-10">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-3xl border bg-white shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md ${card.color.split(' ')[2]}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
                <div className={`p-2 rounded-xl ${card.color.split(' ')[0]} ${card.color.split(' ')[1]} border`}>
                  {card.icon}
                </div>
              </div>
              <div className="mt-4">
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-accent font-sans">{card.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Recent Orders List Card */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 flex flex-col justify-between h-[450px]">
            <div>
              <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-4">
                <h3 className="font-bold text-accent text-base flex items-center">
                  <FiShoppingBag className="mr-2 text-primary" /> Recent Orders
                </h3>
                <Link to="/admin/orders" className="text-xs font-bold text-primary hover:underline flex items-center space-x-0.5">
                  <span>View All</span>
                  <FiArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[320px] pr-1">
                {recentOrders.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-10 font-medium">No recent orders recorded.</p>
                ) : (
                  recentOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl transition-colors">
                      <div className="min-w-0 flex-grow">
                        <p className="text-xs font-bold text-accent truncate">{o.productName}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">Qty: {o.quantity} &bull; {o.customerName}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className="text-xs font-extrabold text-accent">₹{o.price * o.quantity}</span>
                        <span className={`block text-[9px] uppercase tracking-wider font-extrabold mt-1 ${o.status === 'DELIVERED' ? 'text-green-600' : 'text-amber-500'
                          }`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Artisan Registrations Card */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 flex flex-col justify-between h-[450px]">
            <div>
              <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-4">
                <h3 className="font-bold text-accent text-base flex items-center">
                  <FiUsers className="mr-2 text-primary" /> New Artisans
                </h3>
                <Link to="/admin/users?tab=artisans" className="text-xs font-bold text-primary hover:underline flex items-center space-x-0.5">
                  <span>View All</span>
                  <FiArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[320px] pr-1">
                {recentArtisans.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-10 font-medium">No registrations yet.</p>
                ) : (
                  recentArtisans.map((artisan) => (
                    <div key={artisan.id} className="flex items-center space-x-3 p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl transition-colors">
                      <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0 overflow-hidden border border-gray-150">
                        {artisan.avatar ? (
                          <img src={artisan.avatar} alt={artisan.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full text-accent font-black text-xs flex items-center justify-center bg-secondary">
                            {getInitials(artisan.name)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <p className="text-xs font-bold text-accent truncate">{artisan.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-semibold truncate">{artisan.category || 'Specialty unset'} &bull; {artisan.village || 'Location unset'}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`px-2 py-0.5 text-[8px] uppercase tracking-wider font-extrabold rounded-full ${artisan.isComplete ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                          {artisan.isComplete ? 'Complete' : 'Incomplete'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recently Added Products Card */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 flex flex-col justify-between h-[450px]">
            <div>
              <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-4">
                <h3 className="font-bold text-accent text-base flex items-center">
                  <FiBriefcase className="mr-2 text-primary" /> New Listings
                </h3>
                <Link to="/admin/products" className="text-xs font-bold text-primary hover:underline flex items-center space-x-0.5">
                  <span>View All</span>
                  <FiArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[320px] pr-1">
                {recentProducts.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-10 font-medium">No products listed.</p>
                ) : (
                  recentProducts.map((p) => (
                    <div key={p.id} className="flex items-center space-x-3 p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl transition-colors">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-grow">
                        <p className="text-xs font-bold text-accent truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">By {p.artisan} &bull; {p.category}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className="text-xs font-extrabold text-accent">₹{p.price}</span>
                        <span className="block text-[9px] font-bold text-gray-400 mt-0.5">Stock: {p.quantity || 15}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboard;

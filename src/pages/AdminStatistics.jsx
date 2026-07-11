import React, { useState, useEffect } from 'react';
import { 
  FiTrendingUp, 
  FiDollarSign, 
  FiShoppingBag, 
  FiBriefcase, 
  FiAward, 
  FiMapPin 
} from 'react-icons/fi';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { adminStatsService } from '../services/api';
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function AdminStatistics({ user, onLogout }) {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        const data = await adminStatsService.getStatistics();
        setStatsData(data);
      } catch (err) {
        console.error('Error loading admin statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
  }, []);

  if (loading || !statsData) {
    return (
      <div className="min-h-screen flex flex-col bg-background-warm pt-16 sm:pt-20">
        <AdminNavbar user={user} onLogout={onLogout} />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-gray-200 rounded-3xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-80 bg-gray-200 rounded-3xl"></div>
              <div className="h-80 bg-gray-200 rounded-3xl"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { summary, charts, topArtisans } = statsData;

  const topCards = [
    { label: 'Total Revenue', value: `₹${summary.totalRevenue.toLocaleString('en-IN')}`, icon: <FiDollarSign className="h-5 w-5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Monthly Revenue', value: `₹${summary.monthlyRevenue.toLocaleString('en-IN')}`, icon: <FiTrendingUp className="h-5 w-5" />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Total Orders', value: summary.totalOrders, icon: <FiShoppingBag className="h-5 w-5" />, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Total Products', value: summary.totalProducts, icon: <FiBriefcase className="h-5 w-5" />, color: 'bg-purple-50 text-purple-600 border-purple-100' }
  ];

  // 1. Monthly Revenue Chart (Line)
  const revenueChartData = {
    labels: charts.revenueByMonth.labels,
    datasets: [
      {
        label: 'Revenue (₹)',
        data: charts.revenueByMonth.data,
        borderColor: '#8B5E3C',
        backgroundColor: 'rgba(139, 94, 60, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // 2. Orders Per Month Chart (Bar)
  const ordersChartData = {
    labels: charts.ordersByMonth.labels,
    datasets: [
      {
        label: 'Orders Count',
        data: charts.ordersByMonth.data,
        backgroundColor: '#D4A373',
        borderRadius: 8
      }
    ]
  };

  // 3. Top Categories Chart (Doughnut)
  const categoriesChartData = {
    labels: charts.topCategories?.labels || ['Pottery', 'Paintings', 'Textiles', 'Woodwork', 'Jewelry'],
    datasets: [
      {
        data: charts.topCategories?.data || [40, 25, 20, 15, 10],
        backgroundColor: [
          '#6B4226',
          '#8B5E3C',
          '#D4A373',
          '#E9DCB9',
          '#FAF7F2'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // 4. Top Selling Products (Bar)
  const productsChartData = {
    labels: charts.topProducts.labels,
    datasets: [
      {
        label: 'Items Sold',
        data: charts.topProducts.data,
        backgroundColor: '#6B4226',
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 10, weight: 'bold' },
          color: '#4B5563'
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 10 } } },
      y: { grid: { borderDash: [5, 5], color: '#E5E7EB' }, ticks: { color: '#9CA3AF', font: { size: 10 } } }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 10, weight: 'bold' },
          color: '#4B5563'
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      <AdminNavbar user={user} onLogout={onLogout} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-accent/10 text-accent rounded-2xl flex-shrink-0">
              <FiTrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-accent font-sans">Business Analytics</h1>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Track financial performance, sales charts, and artisan standings</p>
            </div>
          </div>
        </div>

        {/* Top Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {topCards.map((card, idx) => (
            <div 
              key={idx} 
              className="p-5 bg-white border border-gray-150 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
                <div className={`p-2 rounded-xl border ${card.color.split(' ')[0]} ${card.color.split(' ')[1]} ${card.color.split(' ')[2]}`}>
                  {card.icon}
                </div>
              </div>
              <div className="mt-4">
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-accent font-sans">{card.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Analytical Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Revenue chart */}
          <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm h-80 flex flex-col">
            <h3 className="text-sm font-bold text-accent mb-4">Monthly Revenue Trends</h3>
            <div className="flex-grow relative">
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </div>

          {/* Orders count chart */}
          <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm h-80 flex flex-col">
            <h3 className="text-sm font-bold text-accent mb-4">Orders Placed By Month</h3>
            <div className="flex-grow relative">
              <Bar data={ordersChartData} options={chartOptions} />
            </div>
          </div>

          {/* Top selling categories */}
          <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm h-80 flex flex-col">
            <h3 className="text-sm font-bold text-accent mb-4">Top Performing Craft Categories</h3>
            <div className="flex-grow relative">
              <Doughnut data={categoriesChartData} options={pieOptions} />
            </div>
          </div>

          {/* Top selling products */}
          <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm h-80 flex flex-col">
            <h3 className="text-sm font-bold text-accent mb-4">Top Selling Handicraft Items</h3>
            <div className="flex-grow relative">
              <Bar data={productsChartData} options={chartOptions} />
            </div>
          </div>

        </div>

        {/* Top Artisans Leaderboard section */}
        <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 sm:p-8">
          <div className="border-b border-gray-50 pb-4 mb-6">
            <h3 className="text-base font-bold text-accent flex items-center">
              <FiAward className="mr-2 text-primary" /> Top Artisans Leaderboard
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Top performing artisan partners ranked by revenue generation</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">Artisan Name</th>
                  <th className="px-6 py-4">Village Origin</th>
                  <th className="px-6 py-4 text-center">Orders Fulfilled</th>
                  <th className="px-6 py-4 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                {topArtisans.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400 font-semibold">
                      No sales data available.
                    </td>
                  </tr>
                ) : (
                  topArtisans.map((artisan, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 flex items-center space-x-3">
                        <div className={`h-6 w-6 rounded-full font-black text-xs flex items-center justify-center ${
                          index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-bold text-accent">{artisan.name}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <span className="inline-flex items-center">
                          <FiMapPin className="text-primary mr-1 h-3 w-3" />
                          {artisan.village}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold">{artisan.ordersCount} orders</td>
                      <td className="px-6 py-4 text-right font-extrabold text-accent">₹{artisan.revenue.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default AdminStatistics;

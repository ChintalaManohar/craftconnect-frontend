import React, { useState, useEffect } from 'react';
import { FiBriefcase, FiShoppingBag, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import { artisanStatsService } from '../services/api';
import ArtisanNavbar from '../components/ArtisanNavbar';
import Footer from '../components/Footer';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function ArtisanStatistics({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await artisanStatsService.getStatistics();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cohesive Artisan Color Palette config
  const chartColors = {
    primary: '#8B5E3C',
    primaryLight: 'rgba(139, 94, 60, 0.15)',
    secondary: '#D4A373',
    accent: '#6B4226',
    pieColors: ['#8B5E3C', '#D4A373', '#6B4226', '#E9DCB9', '#FAF7F2']
  };

  // Chart 1 Options and Data: Monthly Revenue
  const revenueChartData = stats ? {
    labels: stats.charts.revenueByMonth.labels,
    datasets: [
      {
        label: 'Revenue (₹)',
        data: stats.charts.revenueByMonth.data,
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primaryLight,
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointBackgroundColor: chartColors.accent,
        pointBorderColor: '#fff',
        pointHoverRadius: 6
      }
    ]
  } : null;

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: chartColors.accent,
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        borderRadius: 8
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#888', font: { weight: 'bold', size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#888', font: { weight: 'bold', size: 10 } }
      }
    }
  };

  // Chart 2 Options and Data: Orders Count
  const ordersChartData = stats ? {
    labels: stats.charts.ordersByMonth.labels,
    datasets: [
      {
        label: 'Orders Count',
        data: stats.charts.ordersByMonth.data,
        backgroundColor: chartColors.secondary,
        borderRadius: 8,
        hoverBackgroundColor: chartColors.primary
      }
    ]
  } : null;

  const ordersChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: chartColors.accent,
        padding: 10,
        borderRadius: 8
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#888', font: { weight: 'bold', size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#888', font: { weight: 'bold', size: 10 } }
      }
    }
  };

  // Chart 3 Options and Data: Top Selling Products
  const productsChartData = stats ? {
    labels: stats.charts.topProducts.labels,
    datasets: [
      {
        data: stats.charts.topProducts.data,
        backgroundColor: chartColors.pieColors.slice(0, stats.charts.topProducts.labels.length),
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  } : null;

  const productsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#555',
          font: { weight: 'bold', size: 11 },
          padding: 14,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: chartColors.accent,
        padding: 10,
        borderRadius: 8
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      <ArtisanNavbar user={user} onLogout={onLogout} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        
        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-6 mb-8">
          <div className="p-2.5 bg-primary/10 text-primary rounded-2xl flex-shrink-0">
            <FiBarChart2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-accent font-sans">Business Statistics</h1>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Visualize your shop performance, earnings, and product reach</p>
          </div>
        </div>

        {isLoading || !stats ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-400 text-sm">Loading statistical breakdown...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Top Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Total Revenue */}
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3h12M6 8h12M6 3a6 6 0 0 1 0 12h3M9 15l7 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider">Total Revenue</p>
                  <h3 className="text-xl sm:text-2xl font-black text-accent font-sans mt-0.5">₹{stats.summary.totalRevenue}</h3>
                </div>
              </div>

              {/* Card 2: Monthly Revenue */}
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 bg-primary/10 text-primary rounded-xl">
                  <FiTrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider">Monthly Revenue</p>
                  <h3 className="text-xl sm:text-2xl font-black text-accent font-sans mt-0.5">₹{stats.summary.monthlyRevenue}</h3>
                </div>
              </div>

              {/* Card 3: Total Orders */}
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 bg-orange-50 text-orange-600 rounded-xl">
                  <FiShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider">Total Orders</p>
                  <h3 className="text-xl sm:text-2xl font-black text-accent font-sans mt-0.5">{stats.summary.totalOrders}</h3>
                </div>
              </div>

              {/* Card 4: Total Products */}
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                  <FiBriefcase className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider">Listed Crafts</p>
                  <h3 className="text-xl sm:text-2xl font-black text-accent font-sans mt-0.5">{stats.summary.totalProducts} Items</h3>
                </div>
              </div>

            </div>

            {/* Charts Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Chart 1: Revenue Line Graph */}
              <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm lg:col-span-8 flex flex-col justify-between min-h-[350px]">
                <div className="border-b border-gray-100 pb-3 mb-4">
                  <h4 className="font-bold text-accent text-sm sm:text-base">Monthly Revenue Trend</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Earnings progression over past months</p>
                </div>
                <div className="flex-grow h-64 relative">
                  <Line data={revenueChartData} options={revenueChartOptions} />
                </div>
              </div>

              {/* Chart 3: Doughnut of Top Selling Items */}
              <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm lg:col-span-4 flex flex-col justify-between min-h-[350px]">
                <div className="border-b border-gray-100 pb-3 mb-4">
                  <h4 className="font-bold text-accent text-sm sm:text-base">Top Selling Products</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Distribution of unit sales</p>
                </div>
                <div className="flex-grow h-64 relative flex items-center justify-center">
                  <Doughnut data={productsChartData} options={productsChartOptions} />
                </div>
              </div>

              {/* Chart 2: Orders Count Bar Chart */}
              <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm lg:col-span-12 flex flex-col justify-between min-h-[320px]">
                <div className="border-b border-gray-100 pb-3 mb-4">
                  <h4 className="font-bold text-accent text-sm sm:text-base">Orders Received Trend</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Quantity of order items processed monthly</p>
                </div>
                <div className="flex-grow h-56 relative">
                  <Bar data={ordersChartData} options={ordersChartOptions} />
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default ArtisanStatistics;

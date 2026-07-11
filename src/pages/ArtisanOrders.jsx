import React, { useState, useEffect } from 'react';
import { FiShoppingBag, FiCalendar, FiUser, FiClock, FiCheckCircle, FiTruck } from 'react-icons/fi';
import { artisanOrderService } from '../services/api';
import ArtisanNavbar from '../components/ArtisanNavbar';
import Footer from '../components/Footer';

function ArtisanOrders({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await artisanOrderService.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error loading artisan orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsShipped = async (orderId) => {
    try {
      await artisanOrderService.updateOrderStatus(orderId);
      await loadOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    const s = status ? status.toUpperCase() : '';
    switch (s) {
      case 'DELIVERED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'SHIPPED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-250';
    }
  };

  const getStatusIcon = (status) => {
    const s = status ? status.toUpperCase() : '';
    switch (s) {
      case 'DELIVERED':
        return <FiCheckCircle className="h-3.5 w-3.5" />;
      case 'SHIPPED':
        return <FiTruck className="h-3.5 w-3.5" />;
      default:
        return <FiClock className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      <ArtisanNavbar user={user} onLogout={onLogout} />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-6 mb-8">
          <div className="p-2.5 bg-primary/10 text-primary rounded-2xl flex-shrink-0">
            <FiShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-accent font-sans">Orders Received</h1>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Manage and track incoming sales requests for your creations</p>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-400 text-sm">Loading received orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-accent font-sans">No orders received yet</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              Once buyers purchase your listed crafts, details will populate here for packing and dispatch coordinates.
            </p>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => {
              const statusNormalized = order.status ? order.status.toUpperCase() : 'CONFIRMED';
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Top Order Details Bar */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-gray-500">
                    <div className="flex space-x-6">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Order Placed</p>
                        <p className="text-gray-700 flex items-center mt-0.5 font-bold">
                          <FiCalendar className="mr-1 h-3.5 w-3.5 text-gray-400" /> {order.date}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Total Payout</p>
                        <p className="text-accent font-extrabold mt-0.5 flex items-center">
                          <svg className="mr-1 h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 3h12M6 8h12M6 3a6 6 0 0 1 0 12h3M9 15l7 7" />
                          </svg>
                          <span>₹{order.price * order.quantity}</span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide text-right font-semibold">Order ID</p>
                      <p className="text-gray-700 font-mono mt-0.5 font-bold">{order.id}</p>
                    </div>
                  </div>

                  {/* Main content body */}
                  <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <img
                        src={order.image}
                        alt={order.productName}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-150 flex-shrink-0"
                      />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Status Badge */}
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wide ${getStatusColor(statusNormalized)}`}>
                          {getStatusIcon(statusNormalized)}
                          <span>{statusNormalized}</span>
                        </span>

                        <h4 className="font-bold text-gray-800 text-sm sm:text-base leading-snug truncate">
                          {order.productName}
                        </h4>

                        {/* Customer details */}
                        <p className="text-xs text-gray-500 font-semibold flex items-center">
                          <FiUser className="mr-1.5 h-3.5 w-3.5 text-gray-300" />
                          Customer: <span className="text-gray-700 font-bold ml-1">{order.customerName || 'Aarav Sharma'}</span>
                        </p>

                        <p className="text-xs text-gray-400 font-semibold">
                          Qty: <span className="font-bold text-gray-700">{order.quantity}</span> &bull; Unit Price: <span className="font-bold text-accent">₹{order.price}</span>
                        </p>
                      </div>
                    </div>

                    {/* Action Flow Container */}
                    <div className="w-full md:w-auto flex-shrink-0 flex items-center md:justify-end pt-4 md:pt-0 border-t border-gray-100 md:border-t-0">
                      {statusNormalized === 'CONFIRMED' ? (
                        <button
                          onClick={() => handleMarkAsShipped(order.id)}
                          className="w-full md:w-auto px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow hover:shadow-md transition-all cursor-pointer text-center"
                        >
                          Mark as Shipped
                        </button>
                      ) : statusNormalized === 'SHIPPED' ? (
                        <div className="flex items-center space-x-1.5 text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                          <FiTruck className="h-4 w-4" />
                          <span>Shipped</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-green-600 font-bold text-xs uppercase tracking-wider bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                          <FiCheckCircle className="h-4 w-4" />
                          <span>Delivered</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default ArtisanOrders;

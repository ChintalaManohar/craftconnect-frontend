import React, { useState, useEffect } from 'react';
import {
  FiShoppingBag,
  FiSearch,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiXCircle,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiX
} from 'react-icons/fi';
import { adminOrderService } from '../services/api';
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';

function AdminOrders({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal details state
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminOrderService.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error loading admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const s = status ? status.toUpperCase() : '';
    switch (s) {
      case 'DELIVERED':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'SHIPPED':
        return <FiTruck className="h-4 w-4" />;
      case 'CANCELLED':
        return <FiXCircle className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    const s = status ? status.toUpperCase() : '';
    switch (s) {
      case 'DELIVERED':
        return 'bg-green-50 text-green-600 border border-green-100';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'CANCELLED':
        return 'bg-red-50 text-red-600 border border-red-100';
      default:
        return 'bg-amber-50 text-amber-500 border border-amber-100';
    }
  };

  // Get unique statuses for filters
  const statuses = [
    'All',
    'PENDING_PAYMENT',
    'CONFIRMED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
  ];

  // Filters
  const filteredOrders = orders.filter(o => {

    const query = searchQuery.toLowerCase();

    const matchesSearch =
      String(o.id).includes(query) ||
      o.customerName?.toLowerCase().includes(query) ||
      o.customerEmail?.toLowerCase().includes(query);

    const matchesStatus =
      selectedStatus === 'All' ||
      o.status?.toUpperCase() ===
      selectedStatus.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      <AdminNavbar user={user} onLogout={onLogout} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-accent/10 text-accent rounded-2xl flex-shrink-0">
              <FiShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-accent font-sans">Marketplace Orders</h1>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Audit transaction invoices and track shipping statuses</p>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filter Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-xs sm:text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FiSearch className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search by Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-400 text-sm">Loading orders list...</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Products</th>
                    <th className="px-6 py-4 text-center">Amount</th>
                    <th className="px-6 py-4 text-center">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-center">Order Date</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-400 font-semibold">
                        No orders match filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-accent">{o.id}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{o.customerName || 'Aarav Sharma'}</td>
                        <td className="px-6 py-4">

                          <div className="flex items-center space-x-2.5">

                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">

                              <img
                                src={o.items?.[0]?.image}
                                alt={o.items?.[0]?.productName || 'Product'}
                                className="w-full h-full object-cover"
                              />

                            </div>

                            <div className="min-w-0">

                              <span
                                className="block truncate max-w-[160px] font-semibold text-accent"
                                title={o.items?.[0]?.productName}
                              >
                                {o.items?.[0]?.productName || 'No Products'}
                              </span>

                              {o.items.length > 1 && (

                                <span className="text-[10px] text-gray-400 font-semibold">

                                  +{o.items.length - 1} more product(s)

                                </span>

                              )}

                            </div>

                          </div>

                        </td>
                        <td className="px-6 py-4 text-center font-extrabold text-accent">₹{o.totalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">

                          <div className="flex flex-col items-center">

                            <span className="text-xs font-bold text-accent">

                              {o.paymentMethod}

                            </span>

                            <span
                              className={`text-[9px] font-bold ${o.paymentStatus === 'SUCCESS'
                                ? 'text-green-600'
                                : 'text-amber-500'
                                }`}
                            >

                              {o.paymentStatus}

                            </span>

                          </div>

                        </td>
                        <td className="px-6 py-4 text-center text-gray-400">{o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString('en-IN')
                          : '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded-full ${getStatusColor(o.status)}`}>
                            {getStatusIcon(o.status)}
                            <span>{o.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="p-2 bg-gray-50 hover:bg-primary/10 border border-gray-200 text-gray-500 hover:text-primary rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1"
                          >
                            <FiEye className="h-4 w-4" />
                            <span className="text-xs font-bold px-1 hidden sm:inline">Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col">

            {/* Header banner */}
            <div className="px-6 py-4 bg-gradient-to-tr from-accent to-accent-hover text-white flex justify-between items-center flex-shrink-0">
              <div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Order Details</span>
                <h3 className="text-base sm:text-lg font-bold font-mono mt-1">{selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white/80 hover:text-white focus:outline-none cursor-pointer bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">

              {/* Product and Artisan details */}
              {/* ORDER ITEMS */}

              <div className="space-y-3">

                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">

                  Products ({selectedOrder.items.length})

                </h4>

                {selectedOrder.items.map(item => (

                  <div
                    key={item.productId}
                    className="flex items-start space-x-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl"
                  >

                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-150 flex-shrink-0 bg-white">

                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />

                    </div>

                    <div className="min-w-0 flex-grow pt-0.5">

                      <h4 className="font-bold text-accent text-sm leading-snug">

                        {item.productName}

                      </h4>

                      <p className="text-[10px] text-gray-400 mt-1 font-semibold">

                        Artisan:{' '}

                        <span className="text-primary font-bold">

                          {item.artisan}

                        </span>

                      </p>

                      <div className="flex justify-between items-center mt-2.5">

                        <span className="text-xs font-black text-accent">

                          ₹{item.price.toFixed(2)} × {item.quantity}

                        </span>

                        <span className="text-sm font-black text-primary">

                          ₹{(item.price * item.quantity).toFixed(2)}

                        </span>

                      </div>

                    </div>

                  </div>

                ))}

                <div className="flex justify-between items-center px-4 py-3 bg-primary/5 rounded-xl">

                  <span className="text-xs font-bold text-gray-500">

                    Order Total

                  </span>

                  <span className="text-lg font-black text-primary">

                    ₹{selectedOrder.totalAmount.toFixed(2)}

                  </span>

                </div>

              </div>

              {/* Status details pipeline (monitoring) */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Shipment Roadmap (Monitoring)</h4>
                <div className="relative pl-6 space-y-4">
                  {/* Timeline bar line */}
                  <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-gray-150"></div>

                  {/* Confirmed step */}
                  <div className="relative flex items-start">
                    <div className={`absolute -left-6 rounded-full p-0.5 bg-white border-2 z-10 ${selectedOrder.status !== 'CANCELLED' ? 'border-green-500 text-green-500' : 'border-gray-300 text-gray-300'
                      }`}>
                      <FiCheckCircle className="h-3 w-3" />
                    </div>
                    <div className="pl-2">
                      <p className="text-xs font-bold text-accent">Order Confirmed</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Payment processed successfully &bull; {selectedOrder.date}</p>
                    </div>
                  </div>

                  {/* Shipped step */}
                  <div className="relative flex items-start">
                    <div className={`absolute -left-6 rounded-full p-0.5 bg-white border-2 z-10 ${selectedOrder.status === 'SHIPPED' || selectedOrder.status === 'DELIVERED'
                      ? 'border-green-500 text-green-500'
                      : 'border-gray-300 text-gray-300'
                      }`}>
                      <FiTruck className="h-3 w-3" />
                    </div>
                    <div className="pl-2">
                      <p className="text-xs font-bold text-accent">Shipped</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Handed over to local rural logistics courier</p>
                    </div>
                  </div>

                  {/* Delivered step */}
                  <div className="relative flex items-start">
                    <div className={`absolute -left-6 rounded-full p-0.5 bg-white border-2 z-10 ${selectedOrder.status === 'DELIVERED' ? 'border-green-500 text-green-500' : 'border-gray-300 text-gray-300'
                      }`}>
                      <FiCheckCircle className="h-3 w-3" />
                    </div>
                    <div className="pl-2">
                      <p className="text-xs font-bold text-accent">Delivered</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Package arrived safely at buyer delivery address</p>
                    </div>
                  </div>

                  {/* Cancelled step (if applicable) */}
                  {selectedOrder.status === 'CANCELLED' && (
                    <div className="relative flex items-start">
                      <div className="absolute -left-6 rounded-full p-0.5 bg-white border-2 z-10 border-red-500 text-red-500">
                        <FiXCircle className="h-3 w-3" />
                      </div>
                      <div className="pl-2">
                        <p className="text-xs font-bold text-red-600">Cancelled</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">This transaction has been terminated</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">

                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">

                  Payment Information

                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">

                  <div>

                    <span className="text-gray-400">
                      Payment Method
                    </span>

                    <p className="font-bold text-accent">
                      {selectedOrder.paymentMethod}
                    </p>

                  </div>

                  <div>

                    <span className="text-gray-400">
                      Payment Status
                    </span>

                    <p className="font-bold text-accent">
                      {selectedOrder.paymentStatus}
                    </p>

                  </div>

                  {selectedOrder.razorpayPaymentId && (

                    <div className="col-span-2">

                      <span className="text-gray-400">
                        Razorpay Payment ID
                      </span>

                      <p className="font-mono font-bold text-accent break-all">

                        {selectedOrder.razorpayPaymentId}

                      </p>

                    </div>

                  )}

                </div>

              </div>

              {/* Delivery and Customer details */}
              <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-gray-600">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider flex items-center">
                    <FiUser className="mr-1 text-primary" /> Customer Info
                  </span>
                  <p className="font-bold text-accent">
                    {selectedOrder.customerName}
                  </p>

                  <p className="text-[10px] text-gray-400">
                    {selectedOrder.customerEmail}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider flex items-center">
                    <FiMapPin className="mr-1 text-primary" /> Shipping Destination
                  </span>
                  <p className="font-bold text-accent leading-relaxed">
                    {selectedOrder.deliveryAddress || 'Aarav Sharma, Madanpur, Bhubaneswar, Khurda, Odisha - 751024'}
                  </p>
                </div>
              </div>

            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow transition-all cursor-pointer"
              >
                Close Invoice
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AdminOrders;

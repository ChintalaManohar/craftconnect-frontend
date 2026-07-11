import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiCalendar, FiArrowRight, FiCheckCircle, FiTruck, FiClock, FiX, FiMapPin, FiCompass } from 'react-icons/fi';
import { orderService } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Orders({ user, cart, wishlist, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);

  const cartCount = cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status) => {
    const normalized = (status || '').toUpperCase();
    switch (normalized) {
      case 'DELIVERED':
        return 'bg-green-50 text-green-700 border-green-150';
      case 'PENDING_PAYMENT':
        return 'bg-amber-50 text-amber-700 border-amber-150';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-700 border-blue-150';
      case 'CONFIRMED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-150';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-150';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-150';
    }
  };

  const getStatusIcon = (status) => {
    const normalized = (status || '').toUpperCase();
    switch (normalized) {
      case 'DELIVERED':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'SHIPPED':
        return <FiTruck className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      {/* Navbar */}
      <Navbar
        user={user}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onLogout={onLogout}
      />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {/* Breadcrumb */}
        <nav className="text-xs sm:text-sm text-gray-400 font-semibold mb-6 flex items-center space-x-2">
          <Link to="/home" className="hover:text-primary transition-colors">Marketplace</Link>
          <span>&bull;</span>
          <span className="text-accent">My Orders</span>
        </nav>

        {/* Header */}
        <div className="flex items-center space-x-2.5 mb-8">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
            <FiPackage className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-accent font-sans">
              Your Orders ({orders.length})
            </h1>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Track and view history of your artisan orders</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-400 text-sm">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <FiPackage className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-accent font-sans">You haven't ordered yet</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              Explore and purchase authentic handmade items from rural Indian artisans.
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
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* Order Top Summary Bar */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-gray-500">
                  <div className="flex space-x-6">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Order Placed</p>
                      <p className="text-gray-700 flex items-center mt-0.5 font-bold">
                        <FiCalendar className="mr-1 h-3.5 w-3.5" /> {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total Amount</p>
                      <p className="text-accent font-bold mt-0.5">₹{order.totalAmount}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide text-right">Order ID</p>
                    <p className="text-gray-700 font-mono mt-0.5 font-bold">{order.id}</p>
                  </div>
                </div>

                {/* Order Main Content */}
                <div className="p-6 flex flex-col md:flex-row items-start justify-between gap-6">
                  {/* Loop through order items */}
                  <div className="space-y-4 flex-grow w-full md:w-auto">
                    <div className="mb-2">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>
                          {(order.status || "")
                            .replaceAll("_", " ")
                            .toLowerCase()
                            .replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      </span>
                    </div>

                    {(order.items || []).map((item) => (
                      <div key={item.productId} className="flex items-start space-x-4 border-b border-gray-50 pb-4 last:border-b-0 last:pb-0">
                        <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-gray-100 hover:opacity-90 transition-opacity"
                          />
                        </Link>
                        <div className="space-y-1 flex-1 min-w-0">
                          <Link to={`/products/${item.productId}`} className="hover:text-primary transition-colors">
                            <h4 className="font-bold text-gray-800 text-sm leading-snug truncate">{item.productName}</h4>
                          </Link>
                          <p className="text-xs text-gray-400 font-medium">Artisan: <span className="text-primary font-bold">{item.artisanName}</span></p>
                          <p className="text-xs text-gray-500 font-medium">Qty: <span className="font-bold text-gray-700">{item.quantity}</span> &bull; Price: <span className="font-bold text-accent">₹{item.price}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-col gap-2 w-full md:w-40 md:flex-shrink-0 md:mt-8">
                    <button
                      onClick={() => setTrackingOrder(order)}
                      className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow hover:shadow-md transition-all cursor-pointer text-center"
                    >
                      Track Order
                    </button>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="w-full py-2 border border-gray-250 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      View Details
                    </button>

                    {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to cancel this order?')) {
                            try {
                              await orderService.cancelOrder(order.id);
                              await loadOrders();
                            } catch (err) {
                              console.error('Error cancelling order:', err);
                            }
                          }
                        }}
                        className="w-full py-2 border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* TRACKING PROGRESS MODAL */}
      {trackingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-gray-100 shadow-2xl relative space-y-6">
            <button
              onClick={() => setTrackingOrder(null)}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-accent font-sans">Track Shipment</h3>
              <p className="text-xs text-gray-400 mt-1">ID: <span className="font-mono">{trackingOrder.id}</span></p>
            </div>

            {/* Visual Tracking Stepper */}
            <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">

              {/* Step 1: Confirmed */}
              <div className="relative">
                <span className="absolute -left-6 top-1.5 w-4.5 h-4.5 rounded-full bg-green-500 border-4 border-white flex items-center justify-center"></span>
                <div>
                  <h5 className="text-sm font-bold text-gray-800">Order Confirmed</h5>
                  <p className="text-[10px] text-gray-400 font-semibold">Artisan acknowledged raw materials</p>
                </div>
              </div>

              {/* Step 2: Processing */}
              <div className="relative">
                <span className={`absolute -left-6 top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white ${['PENDING_PAYMENT', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(trackingOrder.status)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
                  }`}></span>
                <div>
                  <h5 className="text-sm font-bold text-gray-800">Crafting & Packaging</h5>
                  <p className="text-[10px] text-gray-400 font-semibold">Handmade production at village cluster</p>
                </div>
              </div>

              {/* Step 3: Shipped */}
              <div className="relative">
                <span className={`absolute -left-6 top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white ${['SHIPPED', 'DELIVERED', 'Shipped', 'Delivered'].includes(trackingOrder.status)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
                  }`}></span>
                <div>
                  <h5 className="text-sm font-bold text-gray-800">Dispatched from District Hub</h5>
                  <p className="text-[10px] text-gray-400 font-semibold">Partner courier transit initiated</p>
                </div>
              </div>

              {/* Step 4: Delivered */}
              <div className="relative">
                <span className={`absolute -left-6 top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white ${['DELIVERED', 'Delivered'].includes(trackingOrder.status)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
                  }`}></span>
                <div>
                  <h5 className="text-sm font-bold text-gray-800">Out for Delivery / Completed</h5>
                  <p className="text-[10px] text-gray-400 font-semibold">Handed over directly to customer</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setTrackingOrder(null)}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* VIEW ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-gray-150 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-accent font-sans">Order Invoice</h3>
              <p className="text-xs text-gray-400 mt-1">ID: <span className="font-mono">{selectedOrder.id}</span></p>
            </div>

            <div className="border-t border-b border-gray-100 py-4 space-y-4 text-xs font-semibold text-gray-600">

              {/* Loop through order items inside modal */}
              <div className="space-y-3">
                {(selectedOrder.items || []).map((item) => (
                  <div key={item.productId} className="flex items-center space-x-3 border-b border-gray-50 pb-3 last:border-b-0 last:pb-0">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                    />
                    <div>
                      <h5 className="font-bold text-gray-800 text-sm">{item.productName}</h5>
                      <p className="text-[10px] text-primary">Rural Artisan: {item.artisanName}</p>
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity} &bull; Price: ₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold flex items-center">
                  <FiMapPin className="mr-1 h-3.5 w-3.5" /> Shipping Address
                </p>
                <p className="font-bold text-gray-800">{selectedOrder.deliveryAddress?.name || user?.name || 'Aarav Sharma'}</p>
                <p className="text-gray-500 leading-relaxed font-medium">
                  {selectedOrder.deliveryAddress || 'Madanpur, Bhubaneswar, Khurda, Odisha - 751024'}
                </p>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">
                  Payment Details
                </p>
                <p className="font-bold text-gray-800">
                  {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                </p>
              </div>

              {/* Payout Information */}
              <div className="bg-green-50/50 p-3.5 rounded-xl border border-green-100 space-y-1.5">
                <p className="text-[10px] text-green-700 uppercase tracking-wide font-extrabold flex items-center">
                  <FiCompass className="mr-1 h-3.5 w-3.5" /> Artisan Contribution
                </p>
                <p className="text-green-800 font-semibold leading-relaxed">
                  85% of this transaction (₹{(selectedOrder.totalAmount * 0.85).toFixed(0)}) has been transferred directly to the artisan's local bank account. Thank you for supporting rural heritage!
                </p>
              </div>

              {/* Financial Breakdowns */}
              <div className="space-y-1.5 pt-2 font-bold">
                <div className="flex justify-between">
                  <span>Items Total:</span>
                  <span>₹{selectedOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Handling:</span>
                  <span className="text-green-600 font-extrabold">FREE</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 text-sm text-accent">
                  <span>Grand Total:</span>
                  <span>₹{selectedOrder.totalAmount}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all cursor-pointer"
            >
              Close Invoice
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Orders;

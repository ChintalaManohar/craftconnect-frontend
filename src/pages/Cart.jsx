import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiTrash2, FiHeart, FiGift, FiShield, FiArrowRight, FiCheck } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Cart({
  user,
  cart,
  wishlist,
  onUpdateCartQty,
  onRemoveFromCart,
  onWishlistToggle,
  onLogout
}) {
  const navigate = useNavigate();
  const [isGift, setIsGift] = useState(false);
  const [showOrderPlaced, setShowOrderPlaced] = useState(false);

  const cartCount = cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
  const itemsSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Delivery Threshold Calculation
  const FREE_DELIVERY_THRESHOLD = 999;
  const deliveryCost = itemsSubtotal >= FREE_DELIVERY_THRESHOLD || itemsSubtotal === 0 ? 0 : 99;
  const totalCost = itemsSubtotal + deliveryCost;

  const handleQtyChange = (
    cartItemId,
    event
  ) => {

    const qty =
      parseInt(
        event.target.value,
        10
      );

    onUpdateCartQty(
      cartItemId,
      qty
    );
  };

  const handleMoveToWishlist = (product) => {
    // Add to wishlist if not already there
    if (!wishlist.includes(product.id)) {
      onWishlistToggle(product.id);
    }
    // Remove from cart
    onRemoveFromCart(product.id);
    alert(`${product.name} moved to your Wishlist!`);
  };

  const handlePlaceOrder = () => {
    setShowOrderPlaced(true);
    setTimeout(() => {
      // Clear cart by removing items one by one (or triggering logout / cart clear)
      cart.forEach(item => onRemoveFromCart(item.cartItemId));
      setShowOrderPlaced(false);
      navigate('/home');
    }, 3000);
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;

    navigate('/checkout', {
      state: {
        orderSource: 'CART'
      }
    });
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

      {/* Standalone Cart Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">

        {/* Order Placed Success Alert Screen */}
        {showOrderPlaced && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-gray-100 shadow-2xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-2 animate-bounce">
                <FiCheck className="h-9 w-9 stroke-[3]" />
              </div>
              <h3 className="text-xl font-bold text-accent font-sans">Order Placed Successfully!</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Thank you for your purchase. We have notified the rural artisans of your order. Payouts have been processed directly to their accounts.
              </p>
              <p className="text-xs text-primary font-semibold">Redirecting to marketplace...</p>
            </div>
          </div>
        )}

        {/* Breadcrumb navigation */}
        <nav className="text-xs sm:text-sm text-gray-400 font-semibold mb-6 flex items-center space-x-2">
          <Link to="/home" className="hover:text-primary transition-colors">Marketplace</Link>
          <span>&bull;</span>
          <span className="text-accent">Shopping Cart</span>
        </nav>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-xl mx-auto shadow-sm my-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-accent font-sans">Your Cart is empty</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              Looks like you haven't added any authentic handicrafts to your cart yet. Explore our clay pottery, woven sarees, hand-carved woodworks, and more.
            </p>
            <Link
              to="/home"
              className="mt-6 inline-block px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-full font-semibold text-sm shadow hover:shadow-md transition-all cursor-pointer"
            >
              Shop Handcrafted Items
            </Link>
          </div>
        ) : (
          /* Standalone Two Column Cart Details */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Cart List */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-accent font-sans">Shopping Cart</h1>
                <span className="text-sm text-gray-400 font-medium">Price</span>
              </div>



              {/* Items List */}
              <div className="divide-y divide-gray-150">
                {cart.map((item) => (

                  <div key={item.cartItemId} className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-start space-x-4 flex-grow">
                      {/* Image */}
                      <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-gray-100 hover:opacity-90 transition-opacity"
                        />
                      </Link>


                      {/* Details & Actions */}
                      <div className="space-y-1">
                        <Link to={`/products/${item.productId}`} className="hover:text-primary transition-colors">
                          <h4 className="font-bold text-gray-800 text-sm sm:text-base leading-snug">{item.productName}</h4>
                        </Link>
                        <p className="text-xs text-gray-400">By <span className="text-primary font-semibold">{item.artisanName}</span></p>

                        <p className="text-xs text-green-600 font-bold">In stock</p>

                        {/* Amazon Style Action Controls */}
                        <div className="flex flex-wrap items-center gap-3 pt-3">
                          {/* Qty Selector */}
                          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                            <span className="text-[11px] font-bold text-gray-500 uppercase">Qty:</span>
                            <select
                              value={item.quantity}
                              onChange={(e) => handleQtyChange(item.cartItemId, e)}
                              className="bg-transparent text-gray-700 font-bold text-xs focus:outline-none cursor-pointer"
                            >
                              {[...Array(10).keys()].map((n) => (
                                <option key={n + 1} value={n + 1}>
                                  {n + 1}
                                </option>
                              ))}
                            </select>
                          </div>

                          <span className="text-gray-300">|</span>

                          {/* Delete Button */}
                          <button
                            onClick={() => onRemoveFromCart(item.cartItemId)}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>

                          <span className="text-gray-300">|</span>

                          {/* Move to Wishlist */}
                          <button
                            onClick={() => handleMoveToWishlist(item)}
                            className="text-xs text-primary hover:text-primary-hover font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                          >
                            <FiHeart className="h-3.5 w-3.5" />
                            <span>Save for Later</span>
                          </button>

                          <span className="text-gray-300">|</span>

                          {/* Buy Now */}
                          <button
                            onClick={() =>
                              navigate('/checkout', {
                                state: {
                                  orderSource: 'BUY_NOW',
                                  product: item,
                                  quantity: item.quantity
                                }
                              })
                            }
                            className="text-xs text-green-600 hover:text-green-800 font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                          >
                            <FiShoppingBag className="h-3.5 w-3.5" />
                            <span>Buy Now</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Cost */}
                    <div className="text-right self-start sm:self-center">
                      <p className="font-bold text-accent font-sans text-base sm:text-lg">
                        ₹{item.price * item.quantity}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-gray-400 font-medium">
                          (₹{item.price} each)
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal summary below the list */}
              <div className="border-t border-gray-100 pt-6 flex justify-end">
                <p className="text-gray-700 text-sm sm:text-base">
                  Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'}):{' '}
                  <span className="font-bold text-accent text-lg font-sans">
                    ₹{itemsSubtotal}
                  </span>
                </p>
              </div>
            </div>

            {/* Right Column: Checkout Billing Sidebar */}
            <div className="lg:col-span-4 space-y-6">

              {/* Order Summary box */}
              <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-5">

                {/* Free Delivery Trigger Message */}
                {itemsSubtotal < FREE_DELIVERY_THRESHOLD ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed font-semibold">
                    💡 Add <span className="font-bold">₹{FREE_DELIVERY_THRESHOLD - itemsSubtotal}</span> more to unlock <span className="text-green-700">FREE Standard Delivery</span>!
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 leading-relaxed font-semibold flex items-center space-x-1.5">
                    <span className="text-lg">🎉</span>
                    <span>Your order qualifies for <span className="font-bold">FREE Delivery</span>.</span>
                  </div>
                )}

                {/* Subtotal calculation */}
                <div>
                  <p className="text-gray-700 text-base">
                    Subtotal ({cartCount} items):{' '}
                    <span className="font-bold text-accent text-xl font-sans block mt-1">
                      ₹{itemsSubtotal}
                    </span>
                  </p>
                </div>

                {/* Gift Option checkbox */}
                <label className="flex items-start space-x-2.5 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary/20 mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs sm:text-sm text-gray-600 font-semibold flex items-center">
                      <FiGift className="mr-1 text-primary" /> This order contains a gift
                    </span>
                    <p className="text-[10px] text-gray-400 leading-relaxed mt-0.5">We will print a custom message card for your loved ones.</p>
                  </div>
                </label>

                {/* Pricing Breakdowns */}
                <div className="border-t border-b border-gray-100 py-3 space-y-2 text-xs font-semibold text-gray-500">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span>₹{itemsSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Charges:</span>
                    <span>{deliveryCost === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryCost}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-800 pt-1">
                    <span>Grand Total:</span>
                    <span className="text-accent font-sans">₹{totalCost}</span>
                  </div>
                </div>

                {/* Place Order CTA Button */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-4 rounded-xl shadow hover:shadow-md transition-all duration-300 text-sm sm:text-base flex items-center justify-center space-x-2 focus:outline-none cursor-pointer"
                >
                  <span>Proceed to Buy ({cartCount} items)</span>
                  <FiArrowRight className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Secure Transaction badge */}
              <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-3 text-xs text-gray-400">
                <FiShield className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-gray-600">Secure Direct Artisan Payouts</h5>
                  <p className="leading-relaxed mt-0.5">CraftConnect processes transfers straight to the weaver/creator accounts securely. Authenticity verified.</p>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Cart;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  FiPackage, FiCheck, FiArrowRight, FiPlus, FiEdit2, FiTrash2,
  FiCreditCard, FiSmartphone, FiHome, FiCheckCircle, FiTruck,
  FiClock, FiArrowLeft, FiX, FiInfo, FiLock
} from 'react-icons/fi';
import { FaStar, FaCreditCard, FaMobileAlt, FaUniversity } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { addressService, orderService, paymentService, productService } from '../services/api';
import loadRazorpay from "../utils/loadRazorpay";


const normalizeProduct = (p) => {
  if (!p) return null;

  return {
    ...p,
    productId: p.productId ?? p.id,
    productName: p.productName ?? p.name,
    imageUrl: p.imageUrl ?? p.image,
    artisanName: p.artisanName ?? p.artisan,
    selectedQuantity: p.quantity ?? 1,
    availableStock: p.availableStock ?? p.quantity ?? 15,
  };
};

const normalizePlacedOrder = (o) => {
  if (!o) return null;
  if (o.items && o.items.length > 0) {
    const firstItem = o.items[0];
    return {
      ...o,
      productId: firstItem.productId,
      productName: firstItem.productName,
      artisan: firstItem.artisanName,
      image: firstItem.imageUrl,
      price: firstItem.price,
      quantity: firstItem.quantity,
      totalAmount: o.totalAmount,
      date:
        o.createdAt
          ? new Date(o.createdAt).toLocaleDateString()
          : new Date().toLocaleDateString(),
    };
  }
  return {
    ...o,
    productId: o.productId || o.id,
    productName: o.productName || o.name,
    artisan: o.artisanName || o.artisan,
    image: o.imageUrl || o.image,
    price: o.price,
    quantity: o.quantity,
    totalAmount: o.totalAmount || (o.price * o.quantity),
    date: o.date || new Date().toLocaleDateString()
  };
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function Checkout({ user, cart, onRemoveFromCart, loadCart, onLogout, onClearCart }) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    product: stateProduct,
    quantity: stateQty,
    orderSource
  } = location.state || {};

  const isBuyNow =
    orderSource === 'BUY_NOW';

  // Core Checkout States
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(product?.quantity ?? 1);

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [step, setStep] = useState(1); // 1 = Address & Quantity, 2 = Payment, 3 = Confirmation
  const [isProcessing, setIsProcessing] = useState(false);

  // Address States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: 'Home',
    name: '',
    mobile: '',
    village: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  const [addressErrors, setAddressErrors] = useState({});

  // Payment States
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Razorpay'); // 'Razorpay', 'Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'COD'
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);

  // Simulated Razorpay Details
  const [simulatedCard, setSimulatedCard] = useState({ number: '', expiry: '', cvv: '' });
  const [simulatedUpi, setSimulatedUpi] = useState('');
  const [simulatedBank, setSimulatedBank] = useState('SBI');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Success / Placed Order details
  const [placedOrder, setPlacedOrder] = useState(null);
  const [orderResult, setOrderResult] = useState(null);
  const orderDetails = normalizePlacedOrder(orderResult || placedOrder);

  // Load product, quantity, and addresses
  useEffect(() => {

    // ==========================
    // 1. RESOLVE CHECKOUT ITEMS
    // ==========================

    if (isBuyNow) {

      // BUY NOW FLOW

      setProduct(
        normalizeProduct(stateProduct)
      );

      setQuantity(
        Number(stateQty) || 1
      );

      // BUY_NOW does not use cart items
      setCheckoutItems([]);

    } else if (cart && cart.length > 0) {

      // CART CHECKOUT FLOW

      const normalizedCartItems =
        cart.map(item => {

          /*
           * Supports both possible structures:
           *
           * item.product
           *
           * OR
           *
           * product fields directly inside item
           */

          const normalized =
            normalizeProduct(
              item.product || item
            );

          return {

            ...normalized,

            quantity:
              Number(item.quantity) || 1

          };

        });

      setCheckoutItems(
        normalizedCartItems
      );

      // CART checkout does not use
      // the single product state
      setProduct(null);

      setQuantity(1);

    } else {

      /*
       * No BUY_NOW product
       * and cart is empty.
       *
       * Do NOT load a random/default product.
       * Checkout should redirect to home/cart.
       */

      setCheckoutItems([]);
      setProduct(null);

      navigate('/home');
    }


    // ==========================
    // 2. LOAD ADDRESSES
    // ==========================

    const loadAddresses = async () => {

      try {

        const list =
          await addressService.getAddresses();

        setAddresses(list);

        if (list.length > 0) {

          const defaultAddress =
            list.find(
              a =>
                a.isDefault ||
                a.defaultAddress
            ) || list[0];

          setSelectedAddressId(
            defaultAddress.id
          );

        }

      } catch (err) {

        console.error(
          'Error fetching addresses:',
          err
        );

      }

    };

    loadAddresses();

  }, [
    isBuyNow,
    stateProduct,
    stateQty,
    cart,
    navigate
  ]);

  // Billing Mathematics
  const subtotal = isBuyNow

    ? Number(product?.price || 0) * quantity

    : checkoutItems.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
        Number(item.quantity || 0),
      0
    );
  const FREE_DELIVERY_THRESHOLD = 999;
  const deliveryCost = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 99;
  const platformFee = 29; // Optional minor platform fee
  const totalAmount = subtotal + deliveryCost + platformFee;

  const hasCheckoutItems = isBuyNow
    ? product !== null
    : checkoutItems.length > 0;

  // Address validation
  const validateAddress = () => {
    const errs = {};
    if (!addressForm.name.trim()) errs.name = 'Recipient Name is required';
    if (!addressForm.mobile.trim()) {
      errs.mobile = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(addressForm.mobile)) {
      errs.mobile = 'Must be a valid 10-digit number';
    }
    if (!addressForm.city.trim()) errs.city = 'City/Town is required';
    if (!addressForm.district.trim()) errs.district = 'District is required';
    if (!addressForm.state.trim()) errs.state = 'State is required';
    if (!addressForm.pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(addressForm.pincode)) {
      errs.pincode = 'Must be a 6-digit pin code';
    }
    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!validateAddress()) return;

    try {
      if (editingAddress) {
        await addressService.updateAddress(editingAddress.id, addressForm);
        const list = await addressService.getAddresses();
        setAddresses(list);
      } else {
        const added = await addressService.addAddress(addressForm);
        const list = await addressService.getAddresses();
        setAddresses(list);
        setSelectedAddressId(added.id);
      }
      setIsAddressFormOpen(false);
      setEditingAddress(null);
      setAddressForm({
        type: 'Home',
        name: '',
        mobile: '',
        village: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        landmark: ''
      });
    } catch (err) {
      console.error('Error saving address:', err);
    }
  };

  const handleEditAddressClick = (addr) => {
    setEditingAddress(addr);
    setAddressForm({ ...addr });
    setAddressErrors({});
    setIsAddressFormOpen(true);
  };

  const handleDeleteAddressClick = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this address?')) return;
    try {
      await addressService.deleteAddress(id);
      const list = await addressService.getAddresses();
      setAddresses(list);

      if (selectedAddressId === id && list.length > 0) {
        const defaultAddress = list.find(a => a.isDefault || a.defaultAddress) || list[0];
        setSelectedAddressId(defaultAddress.id);
      } else if (list.length === 0) {
        setSelectedAddressId(null);
      }
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  // Stepper handlers
  const handleProceedToPayment = () => {
    if (!selectedAddressId) {
      alert('Please select or add a shipping address to proceed.');
      return;
    }
    setStep(2);
  };

  // Payment verification and finalization
  const finalizeOrder = async () => {

    try {

      setIsProcessing(true);

      const loaded = await loadRazorpay();

      if (!loaded) {

        alert("Unable to load Razorpay.");

        return;
      }

      // Create CraftConnect Order
      const orderRequest = isBuyNow
        ? {
          paymentMethod: "ONLINE",
          orderSource: "BUY_NOW",
          productId: product.productId,
          quantity: quantity
        }
        : {
          paymentMethod: "ONLINE",
          orderSource: "CART"
        };

      const order =
        await orderService.placeOrder(orderRequest);

      console.log("Craft Order:", order);

      // Create Razorpay Order
      const razorpayOrder =
        await paymentService.createPayment(
          order.id
        );

      console.log("Razorpay:", razorpayOrder);

      const options = {

        key: razorpayOrder.key,

        amount: razorpayOrder.amount,

        currency: "INR",

        name: "CraftConnect",

        description: "Purchase Handicrafts",

        order_id:
          razorpayOrder.razorpayOrderId,

        handler: async function (response) {

          try {

            await paymentService.verifyPayment({

              razorpayOrderId:
                response.razorpay_order_id,

              razorpayPaymentId:
                response.razorpay_payment_id,

              razorpaySignature:
                response.razorpay_signature

            });

            //alert("Payment Successful!");


            if (!isBuyNow) {
              await loadCart();
            }



            navigate("/orders");

          } catch (err) {

            console.error(err);

            alert("Payment Verification Failed");

          }

        },

        theme: {

          color: "#8B5E3C"

        }

      };

      const rzp =
        new window.Razorpay(options);

      rzp.open();

    } catch (err) {

      console.error(err);

      alert("Payment Failed");

    } finally {

      setIsProcessing(false);

    }

  };

  const placeCodOrder = async () => {

    try {

      setIsProcessing(true);

      const orderRequest = isBuyNow
        ? {
          paymentMethod: "COD",
          orderSource: "BUY_NOW",
          productId: product.productId,
          quantity: quantity
        }
        : {
          paymentMethod: "COD",
          orderSource: "CART"
        };

      const order =
        await orderService.placeOrder(orderRequest);


      if (!isBuyNow) {
        await loadCart();
      }

      console.log("COD Order:", order);

      //alert("Order Placed Successfully!");

      navigate("/orders");

    } catch (err) {

      console.error("COD Order Failed:", err);

      alert(
        err.response?.data?.message ||
        "Unable to place COD order"
      );

    } finally {

      setIsProcessing(false);

    }

  };

  const handlePaymentSubmit = async () => {

    if (selectedPaymentMethod === "COD") {

      await placeCodOrder();

    } else {

      await finalizeOrder();

    }

  };

  const handleSimulatedPaymentPay = async () => {
    setPaymentProcessing(true);
    try {
      // Simulate Razorpay order creation + payment verification
      const amount = totalAmount;
      const order = await paymentService.createRazorpayOrder(amount);
      const verification = await paymentService.verifyPayment({
        razorpayOrderId: order.razorpayOrderId || order.id,
        razorpayPaymentId: `pay_${Math.random().toString(36).substring(2, 10)}`,
        razorpaySignature: `sig_${Math.random().toString(36).substring(2, 20)}`
      });

      if (verification.success) {
        setIsRazorpayModalOpen(false);

        const selectedAddress = addresses.find(a => a.id === selectedAddressId);
        const checkoutSnapshot = {
          productId: product.productId,
          productName: product.productName,
          imageUrl: product.imageUrl,
          artisanName: product.artisanName,
          price: product.price,
          quantity: quantity,
          deliveryAddress: selectedAddress,
          paymentMethod: 'Razorpay Online Payment (Simulated)'
        };

        const confirmationOrder = {
          ...verification,
          ...checkoutSnapshot,
          totalAmount: verification.totalAmount || totalAmount
        };

        setOrderResult(confirmationOrder);
        onClearCart();
        setStep(3);
      } else {
        alert('Payment verification failed. Please try again.');
      }
    } catch (e) {
      console.error('Simulated payment failed', e);
      alert('Payment processing failed.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Quantity handled inline

  const cartCount = cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      {/* Navbar */}
      <Navbar
        user={user}
        cartCount={cartCount}
        wishlistCount={0} // not showing wishlist badge on checkout for focus
        onLogout={onLogout}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Checkout Header and Progress Stepper */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-accent">
              {step === 1 && 'Checkout'}
              {step === 2 && 'Payment Method'}
              {step === 3 && 'Order Confirmed!'}
            </h1>
            <p className="text-gray-400 text-xs font-semibold mt-1">Direct payout supporting rural handicraft creators</p>
          </div>

          {/* Steps Progress Indicator */}
          <div className="flex items-center space-x-3 text-xs sm:text-sm font-semibold">
            {/* Step 1 */}
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center border-2 font-bold ${step > 1 ? 'bg-primary border-primary text-white' : 'border-primary bg-white text-primary'
                }`}>
                {step > 1 ? <FiCheck className="h-3.5 w-3.5" /> : '1'}
              </div>
              <span>Address & Qty</span>
            </div>

            <div className={`h-0.5 w-8 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>

            {/* Step 2 */}
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center border-2 font-bold ${step > 2 ? 'bg-primary border-primary text-white' : step === 2 ? 'border-primary bg-white text-primary' : 'border-gray-300 bg-white'
                }`}>
                {step > 2 ? <FiCheck className="h-3.5 w-3.5" /> : '2'}
              </div>
              <span>Payment</span>
            </div>

            <div className={`h-0.5 w-8 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>

            {/* Step 3 */}
            <div className={`flex items-center space-x-2 ${step === 3 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center border-2 font-bold ${step === 3 ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white'
                }`}>
                {step === 3 ? <FiCheck className="h-3.5 w-3.5" /> : '3'}
              </div>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        {/* STEP 1: ADDRESS & QUANTITY */}
        {step === 1 && hasCheckoutItems && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Addresses */}
            <div className="lg:col-span-8 space-y-6">

              {/* Address Form Toggle Form */}
              {isAddressFormOpen ? (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-bold text-accent font-sans">
                      {editingAddress ? 'Modify Shipping Address' : 'Register New Shipping Address'}
                    </h3>
                    <button
                      onClick={() => { setIsAddressFormOpen(false); setEditingAddress(null); }}
                      className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Recipient Full Name</label>
                        <input
                          type="text"
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${addressErrors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                            }`}
                          placeholder="e.g. Aarav Sharma"
                        />
                        {addressErrors.name && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{addressErrors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Mobile Number (10 digit)</label>
                        <input
                          type="text"
                          value={addressForm.mobile}
                          onChange={(e) => setAddressForm({ ...addressForm, mobile: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${addressErrors.mobile ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                            }`}
                          placeholder="e.g. 9876543210"
                        />
                        {addressErrors.mobile && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{addressErrors.mobile}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Village / Street Address</label>
                        <input
                          type="text"
                          value={addressForm.village}
                          onChange={(e) => setAddressForm({ ...addressForm, village: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-250 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder="e.g. Madanpur Road"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">City / Town</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${addressErrors.city ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                            }`}
                          placeholder="e.g. Bhubaneswar"
                        />
                        {addressErrors.city && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{addressErrors.city}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">District</label>
                        <input
                          type="text"
                          value={addressForm.district}
                          onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${addressErrors.district ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                            }`}
                          placeholder="e.g. Khurda"
                        />
                        {addressErrors.district && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{addressErrors.district}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">State</label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${addressErrors.state ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                            }`}
                          placeholder="e.g. Odisha"
                        />
                        {addressErrors.state && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{addressErrors.state}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Pincode (6 digits)</label>
                        <input
                          type="text"
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${addressErrors.pincode ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                            }`}
                          placeholder="e.g. 751024"
                        />
                        {addressErrors.pincode && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{addressErrors.pincode}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Landmark (Optional)</label>
                      <input
                        type="text"
                        value={addressForm.landmark}
                        onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-250 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="e.g. Near Shiva Temple"
                      />
                    </div>

                    <div className="flex items-center space-x-3 text-xs font-bold uppercase tracking-wider mb-2">
                      <label className="text-gray-500">Address Type:</label>
                      <div className="flex space-x-2">
                        {['Home', 'Work'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setAddressForm({ ...addressForm, type: t })}
                            className={`px-4.5 py-2 rounded-xl transition-all border font-bold cursor-pointer ${addressForm.type === t
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                              }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <FiCheck className="h-4.5 w-4.5" />
                        <span>{editingAddress ? 'Save Changes' : 'Register Address'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsAddressFormOpen(false); setEditingAddress(null); }}
                        className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-sm transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Address selection container */
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
                  <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-accent font-sans">1. Select Delivery Address</h2>
                    <button
                      onClick={() => setIsAddressFormOpen(true)}
                      className="inline-flex items-center space-x-1 px-4 py-2 border border-primary hover:bg-primary/5 text-primary rounded-xl font-bold text-xs transition-all cursor-pointer"
                    >
                      <FiPlus className="h-3.5 w-3.5" />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <FiHome className="mx-auto h-8 w-8 mb-2" />
                      <p className="text-sm font-bold text-gray-600">No addresses saved yet</p>
                      <p className="text-xs text-gray-400 mt-0.5">Please add a shipping address to receive your order.</p>
                      <button
                        onClick={() => setIsAddressFormOpen(true)}
                        className="mt-4 px-5 py-2 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-hover shadow cursor-pointer"
                      >
                        Create First Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between h-full relative ${selectedAddressId === addr.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-gray-150 bg-white hover:border-gray-300'
                            }`}
                        >
                          <div className="space-y-1.5 text-xs sm:text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-800">{addr.name}</span>
                              <div className="flex items-center space-x-1.5">
                                <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${addr.type === 'Home' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                  }`}>
                                  {addr.type}
                                </span>
                                {(addr.isDefault || addr.defaultAddress) && (
                                  <span className="bg-green-50 text-green-600 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-500 font-medium font-sans flex items-center">
                              <span className="font-bold text-gray-700 mr-1.5">Mob:</span> {addr.mobile}
                            </p>
                            <p className="text-gray-600 leading-relaxed font-sans mt-1">
                              {addr.village && `${addr.village}, `}{addr.city}, {addr.district}, {addr.state} - <span className="font-bold text-gray-700">{addr.pincode}</span>
                            </p>
                            {addr.landmark && (
                              <p className="text-[11px] text-gray-400 font-medium">Ref: {addr.landmark}</p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 pt-4 mt-4 border-t border-gray-100/50 text-[11px] font-bold">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedAddressId(addr.id); }}
                              className={`px-3 py-1.5 rounded-lg border transition-all ${selectedAddressId === addr.id
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                              Select
                            </button>
                            {!(addr.isDefault || addr.defaultAddress) && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await addressService.setDefaultAddress(addr.id);
                                    const list = await addressService.getAddresses();
                                    setAddresses(list);
                                    setSelectedAddressId(addr.id);
                                  } catch (err) {
                                    console.error('Error setting default address:', err);
                                  }
                                }}
                                className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg transition-all"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditAddressClick(addr); }}
                              className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg flex items-center space-x-0.5 transition-all"
                            >
                              <FiEdit2 className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteAddressClick(addr.id, e)}
                              className="px-3 py-1.5 border border-red-100 hover:bg-red-50 text-red-500 rounded-lg flex items-center space-x-0.5 transition-all ml-auto"
                            >
                              <FiTrash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Back Link */}
              <Link to="/home" className="inline-flex items-center space-x-2 text-gray-500 hover:text-primary font-semibold transition-colors duration-200">
                <FiArrowLeft className="h-4 w-4" />
                <span>Return to Shopping</span>
              </Link>
            </div>

            {/* Right Column: Product Summary & Quantity Selection */}
            <div className="lg:col-span-4 space-y-6">

              {/* Product Summary card */}
              <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-5">
                <h3 className="text-base font-bold text-accent border-b border-gray-100 pb-3 font-sans">Product Summary</h3>

                <div className="space-y-4">
                  {(isBuyNow
                    ? product
                      ? [{ ...product, quantity }]
                      : []
                    : checkoutItems
                  ).map(item => (
                    <div
                      key={item.productId || item.id}
                      className="flex gap-4 border-b border-gray-100 pb-4 text-xs sm:text-sm font-semibold"
                    >
                      <img
                        src={item.imageUrl || item.image}
                        alt={item.name || item.productName}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">
                          {item.name || item.productName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                        <p className="font-bold text-accent">
                          ₹{(
                            Number(item.price) *
                            Number(item.quantity)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {isBuyNow && product && (
                  <div className="border-t border-gray-50 pt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <span>Availability</span>
                      <span className="text-green-600 font-bold">IN STOCK ({product.availableStock} LEFT)</span>
                    </div>

                    {/* Quantity selector buttons */}
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-150">
                      <span className="text-xs font-bold text-gray-500 uppercase">Quantity</span>
                      <div className="flex items-center space-x-3.5">
                        <button
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          disabled={quantity <= 1}
                          className="w-7 h-7 rounded-lg bg-white border border-gray-250 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-all cursor-pointer focus:outline-none"
                        >
                          -
                        </button>
                        <span className="font-bold text-gray-800 text-sm">{quantity}</span>
                        <button
                          onClick={() => setQuantity(prev => Math.min(prev + 1, product.availableStock))}
                          disabled={quantity >= product.availableStock}
                          className="w-7 h-7 rounded-lg bg-white border border-gray-250 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer focus:outline-none"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtotal summary section */}
                <div className="border-t border-gray-50 pt-4 space-y-2.5 text-xs font-semibold text-gray-500">
                  {isBuyNow && product && (
                    <div className="flex justify-between">
                      <span>Price Calculation:</span>
                      <span>₹{product.price} &times; {quantity}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-100/50 pt-2.5 text-sm font-bold text-gray-800">
                    <span>Subtotal:</span>
                    <span className="text-accent font-sans">₹{subtotal}</span>
                  </div>
                </div>

                {/* Continue CTA */}
                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-4 rounded-xl shadow hover:shadow-md transition-all duration-300 text-sm sm:text-base flex items-center justify-center space-x-2 focus:outline-none cursor-pointer"
                >
                  <span>Proceed to Payment</span>
                  <FiArrowRight className="h-4.5 w-4.5" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* STEP 2: PAYMENT METHOD */}
        {step === 2 && hasCheckoutItems && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Payment Options */}
            <div className="lg:col-span-8 space-y-6">

              {/* Payment details panel */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-bold text-accent font-sans">2. Select Payment Method</h2>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">Secure payments via encrypted connection gateways</p>
                </div>

                {/* Payment Options Grid */}
                <div className="space-y-3.5">
                  {[
                    { id: 'Razorpay', label: 'Online Payment (Recommended)', desc: 'Pay securely using UPI, Credit Card, Debit Card, Net Banking & Wallets via Razorpay.', icon: <FiLock className="h-4.5 w-4.5" />, recommended: true },
                    { id: 'COD', label: 'Cash on Delivery', desc: 'Pay with physical cash upon home delivery.', icon: <FiPackage className="h-4.5 w-4.5" /> }
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-4 ${selectedPaymentMethod === method.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-gray-150 bg-white hover:border-gray-300'
                        }`}
                    >
                      <input
                        type="radio"
                        checked={selectedPaymentMethod === method.id}
                        onChange={() => setSelectedPaymentMethod(method.id)}
                        className="mt-1 w-4.5 h-4.5 text-primary border-gray-300 focus:ring-primary/20 cursor-pointer"
                      />
                      <div className="flex-grow space-y-1.5 text-xs sm:text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-800">{method.label}</span>
                          {method.recommended && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5 shadow-sm animate-pulse">
                              <span className="text-[10px]">&starf;</span> <span>Recommended</span>
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 leading-relaxed font-medium">{method.desc}</p>
                      </div>
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${selectedPaymentMethod === method.id ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-400'
                        }`}>
                        {method.icon}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stepper buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center space-x-2 text-gray-500 hover:text-primary font-semibold transition-colors duration-200 cursor-pointer"
                >
                  <FiArrowLeft className="h-4 w-4" />
                  <span>Back to Address</span>
                </button>
              </div>
            </div>

            {/* Right Column: Billing Order Summary */}
            <div className="lg:col-span-4 space-y-6">

              {/* Order Billing Summary card */}
              <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-5">
                <h3 className="text-base font-bold text-accent border-b border-gray-100 pb-3 font-sans">Order Summary</h3>

                <div className="space-y-4">
                  {(isBuyNow
                    ? product
                      ? [{ ...product, quantity }]
                      : []
                    : checkoutItems
                  ).map(item => (
                    <div
                      key={item.productId || item.id}
                      className="flex gap-4 border-b border-gray-100 pb-4 text-xs sm:text-sm font-semibold"
                    >
                      <img
                        src={item.imageUrl || item.image}
                        alt={item.name || item.productName}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">
                          {item.name || item.productName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                        <p className="font-bold text-accent">
                          ₹{(
                            Number(item.price) *
                            Number(item.quantity)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm font-semibold text-gray-600">
                  <div className="border-t border-gray-100/50 pt-3.5 space-y-2.5">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-bold text-gray-800">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Charges:</span>
                      <span>{deliveryCost === 0 ? <span className="text-green-600 font-extrabold">FREE</span> : `₹${deliveryCost}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Charges:</span>
                      <span>₹{platformFee}</span>
                    </div>
                  </div>

                  <div className="flex justify-between border-t border-gray-150 pt-3.5 text-base text-accent font-black">
                    <span>Total Amount:</span>
                    <span className="font-sans">₹{totalAmount}</span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  onClick={handlePaymentSubmit}
                  disabled={isProcessing}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-4 rounded-xl shadow hover:shadow-md transition-all duration-300 text-sm sm:text-base flex items-center justify-center space-x-2 focus:outline-none cursor-pointer"
                >
                  {isProcessing ? "Placing Order..." : "Place Order"}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* STEP 3: ORDER CONFIRMATION */}
        {step === 3 && placedOrder && (
          <div className="max-w-2xl w-full mx-auto bg-white rounded-3xl border border-gray-150 shadow-lg overflow-hidden mb-12">

            {/* Confirmation Header Banner */}
            <div className="bg-gradient-to-r from-primary to-accent text-white p-8 text-center space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-bl-full pointer-events-none"></div>

              <div className="w-16 h-16 rounded-full bg-white/10 text-white border-2 border-white/20 flex items-center justify-center mx-auto mb-2 animate-bounce">
                <FiCheck className="h-9 w-9 stroke-[3]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-sans">Order Placed Successfully!</h2>
              <p className="text-white/80 text-sm font-semibold">Your support helps keep generational Indian art forms alive.</p>
              <div className="inline-block bg-white/20 px-4 py-1 rounded-full text-xs font-mono font-bold tracking-wide">
                ID: {placedOrder.id}
              </div>
            </div>

            {/* Confirmation Details Invoice Body */}
            <div className="p-6 sm:p-8 space-y-6">

              {/* Product receipt card */}
              <div className="bg-gray-50 border border-gray-100 p-4.5 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-semibold">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={orderDetails.image}
                    alt={orderDetails.productName}
                    className="w-12 h-12 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800">{orderDetails.productName}</h4>
                    <p className="text-[10px] text-gray-400 uppercase mt-0.5">Artisan Partner: {orderDetails.artisan}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-accent font-bold">₹{orderDetails.price} &times; {orderDetails.quantity}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Grand Total: <span className="font-bold text-accent">₹{orderDetails.totalAmount}</span></p>
                </div>
              </div>

              {/* Detailed Invoice Properties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm font-semibold text-gray-500">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Delivery Address</p>
                    <p className="text-gray-800 mt-1 font-bold">Recipient Name</p>
                    <p className="text-gray-600 leading-relaxed font-sans font-medium mt-0.5">
                      {typeof orderDetails.deliveryAddress === 'object'
                        ? `${orderDetails.deliveryAddress.name}, ${orderDetails.deliveryAddress.village || orderDetails.deliveryAddress.city}, ${orderDetails.deliveryAddress.district}, ${orderDetails.deliveryAddress.state} - ${orderDetails.deliveryAddress.pincode}`
                        : orderDetails.deliveryAddress}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Billing Total</p>
                    <p className="text-accent text-lg font-black font-sans mt-0.5">₹{orderDetails.totalAmount}</p>
                    <p className="text-[10px] text-green-600 font-extrabold bg-green-50 px-2.5 py-0.5 rounded-full inline-block mt-1 uppercase">Free shipping applied</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Payment Method</p>
                    <p className="text-gray-800 mt-1 font-bold">{orderDetails.paymentMethod}</p>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${orderDetails.paymentStatus === 'SUCCESS' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                      {orderDetails.paymentStatus === 'SUCCESS' ? 'Success / Verified' : 'Pending COD Cash'}
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Transaction Date</p>
                    <p className="text-gray-800 font-sans mt-1 font-bold">{orderDetails.date}</p>
                  </div>
                </div>
              </div>

              {/* Order Status Timeline Stepper */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-gray-400">Order Delivery Roadmap</h4>

                <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 flex flex-col space-y-6">
                  {/* Step 1: Confirmed */}
                  <div className="relative">
                    <span className="absolute -left-6 top-1.5 w-4.5 h-4.5 rounded-full bg-green-500 border-4 border-white flex items-center justify-center"></span>
                    <div>
                      <h5 className="text-sm font-bold text-gray-800">Order Confirmed</h5>
                      <p className="text-[10px] text-gray-400 font-semibold">Artisan preparing handcrafted item</p>
                    </div>
                  </div>

                  {/* Step 2: Shipped */}
                  <div className="relative">
                    <span className="absolute -left-6 top-1.5 w-4.5 h-4.5 rounded-full bg-gray-300 border-4 border-white flex items-center justify-center"></span>
                    <div>
                      <h5 className="text-sm font-bold text-gray-400">Shipped</h5>
                      <p className="text-[10px] text-gray-400 font-semibold">Will be dispatched from rural cluster depot</p>
                    </div>
                  </div>

                  {/* Step 3: Out for delivery */}
                  <div className="relative">
                    <span className="absolute -left-6 top-1.5 w-4.5 h-4.5 rounded-full bg-gray-300 border-4 border-white flex items-center justify-center"></span>
                    <div>
                      <h5 className="text-sm font-bold text-gray-400">Out For Delivery</h5>
                      <p className="text-[10px] text-gray-400 font-semibold">Courier dispatch from district warehouse</p>
                    </div>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="relative">
                    <span className="absolute -left-6 top-1.5 w-4.5 h-4.5 rounded-full bg-gray-300 border-4 border-white flex items-center justify-center"></span>
                    <div>
                      <h5 className="text-sm font-bold text-gray-400">Delivered</h5>
                      <p className="text-[10px] text-gray-400 font-semibold">Handed over directly to customer</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <Link
                  to="/home"
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all text-center"
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/orders"
                  className="flex-1 py-3 border border-gray-250 hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-sm transition-all text-center"
                >
                  View My Orders
                </Link>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* DETAILED RAZORPAY CUSTOM POPUP OVERLAY */}
      {isRazorpayModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-250 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">

            {/* Razorpay Header */}
            <div className="bg-[#0b1e47] text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded bg-blue-500 text-white flex items-center justify-center font-extrabold text-sm uppercase">
                  CC
                </div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-wide">CraftConnect</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Secured by Razorpay Checkout</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Amount to Pay</p>
                <p className="text-lg font-black text-blue-400 font-sans">₹{totalAmount}</p>
              </div>
            </div>

            {/* Razorpay Body */}
            <div className="p-6 space-y-5">

              {/* Payment Details forms */}
              <div className="space-y-4">
                <h5 className="text-xs uppercase font-extrabold tracking-widest text-gray-400">Payment Channel Details</h5>

                {selectedPaymentMethod === 'Credit Card' || selectedPaymentMethod === 'Debit Card' || selectedPaymentMethod === 'Razorpay' ? (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength="19"
                          value={simulatedCard.number}
                          onChange={(e) => {
                            // format card number with spaces
                            const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                            const matches = v.match(/\d{4,16}/g);
                            const match = matches && matches[0] || '';
                            const parts = [];
                            for (let i = 0, len = match.length; i < len; i += 4) {
                              parts.push(match.substring(i, i + 4));
                            }
                            if (parts.length > 0) {
                              setSimulatedCard({ ...simulatedCard, number: parts.join(' ') });
                            } else {
                              setSimulatedCard({ ...simulatedCard, number: v });
                            }
                          }}
                          className="w-full pl-3 pr-10 py-2 rounded-lg border border-gray-250 text-xs focus:outline-none focus:border-blue-500 font-mono"
                          placeholder="4111 2222 3333 4444"
                        />
                        <span className="absolute right-3.5 top-2.5 text-gray-400">
                          <FiCreditCard className="h-4 w-4" />
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expiry Date</label>
                        <input
                          type="text"
                          maxLength="5"
                          value={simulatedCard.expiry}
                          onChange={(e) => {
                            let v = e.target.value.replace(/[^0-9]/g, '');
                            if (v.length > 2) {
                              v = v.substring(0, 2) + '/' + v.substring(2, 4);
                            }
                            setSimulatedCard({ ...simulatedCard, expiry: v });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-gray-250 text-xs focus:outline-none focus:border-blue-500 font-mono"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength="3"
                          value={simulatedCard.cvv}
                          onChange={(e) => setSimulatedCard({ ...simulatedCard, cvv: e.target.value.replace(/[^0-9]/g, '') })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-250 text-xs focus:outline-none focus:border-blue-500 font-mono"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                ) : selectedPaymentMethod === 'UPI' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">UPI ID (VPA)</label>
                      <input
                        type="text"
                        value={simulatedUpi}
                        onChange={(e) => setSimulatedUpi(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-250 text-xs focus:outline-none focus:border-blue-500 font-sans"
                        placeholder="aarav@okhdfcbank"
                      />
                      <p className="text-[9px] text-gray-400 mt-1 leading-relaxed">Enter your Virtual Private Address to request a checkout ping</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Select Bank</label>
                      <select
                        value={simulatedBank}
                        onChange={(e) => setSimulatedBank(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-250 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="SBI">State Bank of India</option>
                        <option value="HDFC">HDFC Bank</option>
                        <option value="ICICI">ICICI Bank</option>
                        <option value="AXIS">Axis Bank</option>
                        <option value="PNB">Punjab National Bank</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Safety message */}
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-start space-x-2 text-[10px] leading-relaxed text-blue-800">
                <FiInfo className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                <span>This is a test sandbox purchase transaction. No real funds will be charged. Click Pay to verify mock payout routing to the rural artisan.</span>
              </div>

              {/* Form Controls */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleSimulatedPaymentPay}
                  disabled={paymentProcessing}
                  className="flex-1 py-3 bg-[#0a52ec] hover:bg-[#0946c7] disabled:bg-blue-300 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow cursor-pointer focus:outline-none"
                >
                  {paymentProcessing ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <span>Pay ₹{totalAmount}</span>
                      <FiLock className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsRazorpayModalOpen(false)}
                  disabled={paymentProcessing}
                  className="px-5 py-3 border border-gray-250 hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Checkout;

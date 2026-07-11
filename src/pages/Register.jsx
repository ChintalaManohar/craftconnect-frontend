import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiArrowLeft, FiTag, FiEye, FiEyeOff } from 'react-icons/fi';
import logoImg from '../assets/logo.png';
import { authService } from '../services/api';

function Register({ onLoginSuccess }) {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'artisan' ? 'ARTISAN' : 'BUYER';

  const [activeTab, setActiveTab] = useState(initialRole); // 'BUYER' (Customer) or 'ARTISAN'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Reset inputs when switching tabs
  useEffect(() => {
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    setApiError('');
  }, [activeTab]);

  const validate = () => {
    const tempErrors = {};
    if (!fullName) {
      tempErrors.name = 'Full Name is required';
    } else if (fullName.length < 3) {
      tempErrors.name = 'Name must be at least 3 characters';
    }

    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      tempErrors.confirmPassword = 'Confirm Password is required';
    } else if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authService.register(
        { fullName, email, password },
        activeTab
      );

      console.log(response);

      alert("Registration Successful!");

      navigate("/login");

    } catch (err) {
      setApiError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#FAF7F2] via-[#F4EDE2] to-[#E9DCB9] p-4 sm:p-6 lg:p-8">
      {/* Return to Home link */}
      <Link to="/" className="absolute top-6 left-6 inline-flex items-center text-primary font-bold hover:text-primary-hover text-sm">
        <FiArrowLeft className="mr-1.5 h-4.5 w-4.5" /> Back to Home
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-8 sm:p-10 relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none"></div>

        {/* Branding Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-14 w-14 rounded-full border border-primary/20 bg-white shadow-sm overflow-hidden flex items-center justify-center mb-3">
            <img
              src={logoImg}
              alt="CraftConnect Logo"
              className="h-full w-full object-cover scale-[1.28]"
            />
          </div>
          <h2 className="text-2xl font-bold text-accent font-sans">Create Account</h2>
          <p className="text-gray-500 text-sm mt-1">Start your journey with CraftConnect</p>
        </div>

        {/* Tabs Control */}
        <div className="flex bg-gray-50 p-1.5 rounded-xl mb-6 border border-gray-100">
          <button
            onClick={() => setActiveTab('BUYER')}
            className={`w-1/2 text-center py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 focus:outline-none cursor-pointer ${activeTab === 'BUYER'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            Customer
          </button>
          <button
            onClick={() => setActiveTab('ARTISAN')}
            className={`w-1/2 text-center py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 focus:outline-none cursor-pointer ${activeTab === 'ARTISAN'
              ? 'bg-white text-accent shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            Artisan
          </button>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start space-x-3 text-red-700 text-sm">
            <FiAlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dynamic Helper Note */}
          {activeTab === 'ARTISAN' && (
            <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-xl text-[11px] text-accent font-semibold leading-relaxed flex items-start space-x-2">
              <FiTag className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <span>Note: Address, profile image, and shop descriptions are set later on your Dashboard profile settings.</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <FiUser className="h-5 w-5" />
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 transition-all text-sm ${errors.name
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                  }`}
                placeholder="Aarav Sharma"
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <FiMail className="h-5 w-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 transition-all text-sm ${errors.email
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                  }`}
                placeholder="aarav@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <FiLock className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 transition-all text-sm ${errors.password
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                  }`}
                placeholder="Min 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <FiLock className="h-5 w-5" />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 transition-all text-sm ${errors.confirmPassword
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                  }`}
                placeholder="Repeat password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              >
                {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword}</p>}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none disabled:opacity-75 flex items-center justify-center space-x-2 text-sm sm:text-base cursor-pointer ${activeTab === 'BUYER' ? 'bg-primary hover:bg-primary-hover' : 'bg-accent hover:bg-accent-hover'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating account...</span>
              </span>
            ) : (
              <span>Register</span>
            )}
          </button>
        </form>

        {/* Separator / Links */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-hover font-bold transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

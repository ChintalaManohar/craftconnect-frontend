import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock, FiAlertCircle, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import logoImg from '../assets/logo.png';
import { authService } from '../services/api';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || 'home';
  const categoryFilter = searchParams.get('category') || '';

  const validate = () => {
    const tempErrors = {};
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

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authService.login(email, password);

      console.log("FULL LOGIN RESPONSE:", response);
      console.log("ROLE RECEIVED:", response.role);
      // Save credentials locally
      localStorage.setItem('craft_token', response.token);
      localStorage.setItem('craft_role', response.role);
      localStorage.setItem('craft_user_name', response.fullName);
      localStorage.setItem('craft_user_email', response.email);

      if (onLoginSuccess) {
        onLoginSuccess(response);
      }

      // Role logic navigation
      if (response.role === 'ADMIN') {

        navigate('/admin/dashboard');

      } else if (response.role === 'ARTISAN') {

        navigate('/artisan/products');

      } else {

        const destination = categoryFilter
          ? `/home?category=${categoryFilter}`
          : '/home';

        navigate(destination);
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Invalid credentials. Please try again.');
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

        {/* Branding header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-14 w-14 rounded-full border border-primary/20 bg-white shadow-sm overflow-hidden flex items-center justify-center mb-3">
            <img
              src={logoImg}
              alt="CraftConnect Logo"
              className="h-full w-full object-cover scale-[1.28]"
            />
          </div>
          <h2 className="text-2xl font-bold text-accent font-sans">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1">Connect with rural Indian heritage</p>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start space-x-3 text-red-700 text-sm">
            <FiAlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
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
                placeholder="name@example.com"
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
                placeholder="••••••••"
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

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none disabled:opacity-75 flex items-center justify-center space-x-2 text-sm sm:text-base cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Logging in...</span>
              </span>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>

        {/* Separator / Links */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary-hover font-bold transition-colors">
              Register
            </Link>
          </p>
        </div>


      </div>
    </div>
  );
}

export default Login;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Wishlist from '../pages/Wishlist';
import Cart from '../pages/Cart';
import Profile from '../pages/Profile';
import Orders from '../pages/Orders';
import ProductDetails from '../pages/ProductDetails';
import ArtisanProfileView from '../pages/ArtisanProfileView';
import Checkout from '../pages/Checkout';

// Artisan Portal Pages
import ArtisanProducts from '../pages/ArtisanProducts';
import ArtisanOrders from '../pages/ArtisanOrders';
import ArtisanStatistics from '../pages/ArtisanStatistics';
import ArtisanProfile from '../pages/ArtisanProfile';

// Admin Portal Pages
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';
import AdminProducts from '../pages/AdminProducts';
import AdminOrders from '../pages/AdminOrders';
import AdminStatistics from '../pages/AdminStatistics';
import AdminProfile from '../pages/AdminProfile';

// A simple Route Guard to prevent access to dashboards if not logged in (optional but highly professional!)
function ProtectedRoute({ user, allowedRole, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'ARTISAN') return <Navigate to="/artisan" replace />;
    return <Navigate to="/home" replace />;
  }

  return children;
}

function AppRoutes({
  user,
  cart,
  loadCart,
  wishlist,
  onLoginSuccess,
  onLogout,
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onWishlistToggle,
  onClearCart,
  onProfileUpdate
}) {
  return (
    <Routes>
      {/* Public Pages */}
      <Route
        path="/"
        element={<LandingPage user={user} onLogout={onLogout} />}
      />
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'ARTISAN' ? '/artisan' : '/home'} replace />
          ) : (
            <Login onLoginSuccess={onLoginSuccess} />
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'ARTISAN' ? '/artisan' : '/home'} replace />
          ) : (
            <Register onLoginSuccess={onLoginSuccess} />
          )
        }
      />

      {/* Buyer Protected Pages */}
      <Route
        path="/home"
        element={
          <ProtectedRoute user={user} allowedRole="BUYER">
            <Home
              user={user}
              cart={cart}
              wishlist={wishlist}
              onAddToCart={onAddToCart}
              onWishlistToggle={onWishlistToggle}
              onLogout={onLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute user={user} allowedRole="BUYER">
            <Wishlist
              user={user}
              cart={cart}
              wishlist={wishlist}
              onAddToCart={onAddToCart}
              onWishlistToggle={onWishlistToggle}
              onLogout={onLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute user={user} allowedRole="BUYER">
            <Cart
              user={user}
              cart={cart}
              wishlist={wishlist}
              onUpdateCartQty={onUpdateCartQty}
              onRemoveFromCart={onRemoveFromCart}
              onWishlistToggle={onWishlistToggle}
              onLogout={onLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute user={user} allowedRole="BUYER">
            <Profile
              user={user}
              cart={cart}
              wishlist={wishlist}
              onLogout={onLogout}
              onProfileUpdate={onProfileUpdate}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute user={user} allowedRole="BUYER">
            <Orders
              user={user}
              cart={cart}
              wishlist={wishlist}
              onLogout={onLogout}
            />
          </ProtectedRoute>
        }
      />

      {/* Artisan Protected Pages */}
      <Route
        path="/artisan"
        element={
          <ProtectedRoute user={user} allowedRole="ARTISAN">
            <Navigate to="/artisan/products" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/artisan/products"
        element={
          <ProtectedRoute user={user} allowedRole="ARTISAN">
            <ArtisanProducts user={user} onLogout={onLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/artisan/orders"
        element={
          <ProtectedRoute user={user} allowedRole="ARTISAN">
            <ArtisanOrders user={user} onLogout={onLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/artisan/statistics"
        element={
          <ProtectedRoute user={user} allowedRole="ARTISAN">
            <ArtisanStatistics user={user} onLogout={onLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/artisan/profile"
        element={
          <ProtectedRoute user={user} allowedRole="ARTISAN">
            <ArtisanProfile 
              user={user} 
              onLogout={onLogout} 
              onProfileUpdate={onProfileUpdate} 
            />
          </ProtectedRoute>
        }
      />

      {/* Product Details & Public Artisan Views */}
      <Route
        path="/products/:id"
        element={
          <ProtectedRoute user={user} allowedRole="BUYER">
            <ProductDetails
              user={user}
              cart={cart}
              wishlist={wishlist}
              onAddToCart={onAddToCart}
              onWishlistToggle={onWishlistToggle}
              onLogout={onLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/artisan/:artisanId"
        element={
          <ProtectedRoute user={user} allowedRole="BUYER">
            <ArtisanProfileView
              user={user}
              cart={cart}
              wishlist={wishlist}
              onAddToCart={onAddToCart}
              onWishlistToggle={onWishlistToggle}
              onLogout={onLogout}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute user={user} allowedRole="BUYER">
            <Checkout
              user={user}
              cart={cart}
              wishlist={wishlist}
              onAddToCart={onAddToCart}
              onRemoveFromCart={onRemoveFromCart}
              loadCart={loadCart}
              onLogout={onLogout}
              onClearCart={onClearCart}
            />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Pages */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute user={user} allowedRole="ADMIN">
            <Navigate to="/admin/dashboard" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute user={user} allowedRole="ADMIN">
            <AdminDashboard user={user} onLogout={onLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute user={user} allowedRole="ADMIN">
            <AdminUsers user={user} onLogout={onLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute user={user} allowedRole="ADMIN">
            <AdminProducts user={user} onLogout={onLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute user={user} allowedRole="ADMIN">
            <AdminOrders user={user} onLogout={onLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/statistics"
        element={
          <ProtectedRoute user={user} allowedRole="ADMIN">
            <AdminStatistics user={user} onLogout={onLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute user={user} allowedRole="ADMIN">
            <AdminProfile 
              user={user} 
              onLogout={onLogout} 
              onProfileUpdate={onProfileUpdate} 
            />
          </ProtectedRoute>
        }
      />

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;

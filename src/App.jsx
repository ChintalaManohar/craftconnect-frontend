import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { wishlistService, cartService } from './services/api';


function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('craft_token');
    const role = localStorage.getItem('craft_role');

    if (token && role) {
      return {
        token,
        role,
        name:
          localStorage.getItem('craft_user_name') ||
          (role === 'ARTISAN'
            ? 'Ramesh Kumar'
            : role === 'ADMIN'
              ? 'Super Admin'
              : 'Aarav Sharma'),

        email:
          localStorage.getItem('craft_user_email') ||
          (role === 'ARTISAN'
            ? 'artisan@craftconnect.com'
            : role === 'ADMIN'
              ? 'admin@craftconnect.com'
              : 'buyer@craftconnect.com'),
      };
    }
    return null;
  });
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const loadWishlist = async () => {
    try {
      const data = await wishlistService.getWishlist();

      console.log("WISHLIST API RESPONSE:", data);

      const wishlistItems = data.items ?? data.wishlistItems ?? data;

      const wishlistIds = wishlistItems.map(
        (item) => item.productId ?? item.product?.id
      );

      setWishlist(wishlistIds);
    } catch (err) {
      console.error("Error loading wishlist", err);
      setWishlist([]);
    }
  };

  const loadCart = async () => {
    try {
      const data = await cartService.getCart();

      console.log("CART API RESPONSE:", data);

      const cartItems = data.items ?? data.cartItems ?? data;

      setCart(cartItems);
    } catch (err) {
      console.error("Error loading cart", err);
      setCart([]);
    }
  };

  useEffect(() => {

    if (
      user &&
      user.role === "BUYER"
    ) {

      loadWishlist();

      loadCart();
    }

  }, [user]);



  const handleLoginSuccess = (session) => {
    setUser({
      token: session.token,
      role: session.role,
      name: session.fullName,
      email: session.email,
    });
    localStorage.setItem('craft_user_name', session.fullName);
    localStorage.setItem('craft_user_email', session.email);
  };

  const handleProfileUpdate = (updatedName, updatedEmail) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        name: updatedName || prev.name,
        email: updatedEmail || prev.email,
      };
    });
    if (updatedName) localStorage.setItem('craft_user_name', updatedName);
    if (updatedEmail) localStorage.setItem('craft_user_email', updatedEmail);
  };

  const handleLogout = () => {
    localStorage.removeItem('craft_token');
    localStorage.removeItem('craft_role');
    localStorage.removeItem('craft_user_name');
    localStorage.removeItem('craft_user_email');
    setUser(null);
    setCart([]);
    setWishlist([]);
    localStorage.removeItem('craft_cart');
    localStorage.removeItem('craft_wishlist');
  };

  const handleAddToCart = async (product) => {
    try {

      await cartService.addToCart(
        product.id,
        1
      );

      await loadCart();

    } catch (err) {
      console.error(
        "Add to cart failed",
        err
      );
    }
  };

  const handleUpdateCartQty = async (
    cartItemId,
    newQty
  ) => {

    try {

      await cartService.updateQuantity(
        cartItemId,
        newQty
      );

      await loadCart();

    } catch (err) {

      console.error(err);
    }
  };

  const handleRemoveFromCart = async (
    cartItemId
  ) => {

    try {

      await cartService.removeCartItem(
        cartItemId
      );

      await loadCart();

    } catch (err) {
      console.error(err);
    }
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleWishlistToggle = async (productId) => {
    try {
      if (wishlist.includes(productId)) {
        await wishlistService.removeFromWishlist(productId);
      } else {
        await wishlistService.addToWishlist(productId);
      }

      await loadWishlist();

    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  return (
    <Router>
      <AppRoutes
        user={user}
        cart={cart}
        loadCart={loadCart}
        wishlist={wishlist}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onAddToCart={handleAddToCart}
        onUpdateCartQty={handleUpdateCartQty}
        onRemoveFromCart={handleRemoveFromCart}
        onWishlistToggle={handleWishlistToggle}
        onClearCart={handleClearCart}
        onProfileUpdate={handleProfileUpdate}
      />
    </Router>
  );
}

export default App;
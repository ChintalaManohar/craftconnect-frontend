import axios from 'axios';


// Configure Axios Instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Request interceptor to attach auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('craft_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);




export const imageUploadService = {
  uploadImage: async (file, folder) => {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('folder', folder);

    const response = await API.post(
      '/images/upload',
      formData
    );

    return response.data;
  }
};

export const cartService = {

  addToCart: async (productId, quantity = 1) => {
    const response = await API.post("/cart/add", {
      productId,
      quantity
    });

    return response.data;
  },

  getCart: async () => {
    const response = await API.get("/cart");
    return response.data;
  },

  removeCartItem: async (cartItemId) => {
    const response = await API.delete(
      `/cart/item/${cartItemId}`
    );

    return response.data;
  },

  updateQuantity: async (
    cartItemId,
    quantity
  ) => {

    const response =
      await API.put(
        `/cart/item/${cartItemId}`,
        { quantity }
      );

    return response.data;
  },
};
// Profile completion verification helper
export function isProfileComplete(profile) {
  if (!profile) return false;
  const requiredFields = [
    'avatar',
    'phone',
    'village',
    'district',
    'state',
    'category',
    'storyTitle',
    'storyDescription'
  ];
  return requiredFields.every(field => {
    const val = profile[field];
    return val && String(val).trim() !== '';
  });
}

export function getArtisanProfileByName(artisanName) {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('craft_artisan_profile_')) {
      try {
        const prof = JSON.parse(localStorage.getItem(key));
        if (prof && prof.name === artisanName) {
          return prof;
        }
      } catch (e) { }
    }
  }

  try {
    const legacy = localStorage.getItem('craft_artisan_profile');
    if (legacy) {
      const prof = JSON.parse(legacy);
      if (prof && prof.name === artisanName) return prof;
    }
  } catch (e) { }

  const publicArtisan = Object.values(MOCK_PUBLIC_ARTISANS || {}).find(a => a.name === artisanName);
  if (publicArtisan) {
    return {
      avatar: publicArtisan.avatar,
      phone: publicArtisan.phone,
      village: publicArtisan.village,
      district: publicArtisan.district,
      state: publicArtisan.state,
      category: publicArtisan.category,
      storyTitle: publicArtisan.storyTitle,
      storyDescription: publicArtisan.storyDescription
    };
  }
  return null;
}

// Mock Data
const MOCK_PRODUCTS = [];

// Helper to simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API implementations for fallback
export const authService = {
  login: async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData, role) => {
    try {
      const response = await API.post('/auth/register', { ...userData, role });
      return response.data;
    } catch (err) {
      throw err;
    }
  },
};

export const wishlistService = {
  getWishlist: async () => {
    const response = await API.get("/wishlist");
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await API.post(`/wishlist/${productId}`);
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await API.delete(`/wishlist/${productId}`);
    return response.data;
  }
};
// Local Storage Helpers for Marketplace Products
const getLocalProducts = () => {
  let productsStr = localStorage.getItem('craft_marketplace_products');
  let products;
  if (!productsStr) {
    products = MOCK_PRODUCTS.map(p => ({ ...p, quantity: p.quantity || 15 }));
    localStorage.setItem('craft_marketplace_products', JSON.stringify(products));
  } else {
    products = JSON.parse(productsStr).map(p => ({ ...p, quantity: p.quantity !== undefined ? p.quantity : 15 }));
  }
  return products;
};

const saveLocalProducts = (products) => {
  localStorage.setItem('craft_marketplace_products', JSON.stringify(products));
};

export const productService = {
  getAllProducts: async (filters = {}) => {
    const response = await API.get('/products/getallproducts', { params: filters });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await API.get(`/products/${id}`);
    return response.data;
  },

  getSimilarProducts: async (id) => {
    const response = await API.get(`/products/${id}/similar`);
    return response.data;
  },

  getRecommendedProducts: async (id) => {
    const response = await API.get(`/products/${id}/recommended`);
    return response.data;
  }
};

// Local Storage Helpers for Reviews
const getLocalReviews = () => {
  let reviewsStr = localStorage.getItem('craft_reviews');
  if (!reviewsStr) {
    const defaultReviews = {};
    localStorage.setItem('craft_reviews', JSON.stringify(defaultReviews));
    return defaultReviews;
  }
  return JSON.parse(reviewsStr);
};

const saveLocalReviews = (reviews) => {
  localStorage.setItem('craft_reviews', JSON.stringify(reviews));
};

export const reviewService = {
  getProductReviews: async (productId) => {
    await delay(300);
    const reviews = getLocalReviews();
    return reviews[String(productId)] || [];
  },

  createReview: async (productId, reviewData) => {
    await delay(400);
    const reviews = getLocalReviews();
    const prodIdStr = String(productId);
    if (!reviews[prodIdStr]) {
      reviews[prodIdStr] = [];
    }
    const newReview = {
      id: Date.now(),
      userName: reviewData.userName || 'Anonymous',
      rating: Number(reviewData.rating),
      comment: reviewData.comment || '',
      date: new Date().toISOString().split('T')[0],
      isVerified: true
    };
    reviews[prodIdStr].push(newReview);
    saveLocalReviews(reviews);

    // Update the average rating in product list
    const products = getLocalProducts();
    const productIndex = products.findIndex((p) => String(p.id) === prodIdStr);
    if (productIndex !== -1) {
      const prodReviews = reviews[prodIdStr];
      const sum = prodReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = Number((sum / prodReviews.length).toFixed(1));
      products[productIndex].rating = avg;
      saveLocalProducts(products);
    }

    return newReview;
  }
};

export const userProfileService = {
  getMyProfile: async () => {
    const response = await API.get('/profile');
    return response.data;
  },

  updateMyProfile: async (profileData) => {
    const response = await API.put('/profile', profileData);
    return response.data;
  }
};

const MOCK_PUBLIC_ARTISANS = {};

export const artisanPublicService = {

  getArtisanById: async (artisanId) => {

    const response = await API.get(
      `/artisan/${artisanId}`
    );

    return response.data;
  },


  getArtisanProducts: async (artisanId) => {

    const response = await API.get(
      `/products/artisan/${artisanId}`
    );

    return response.data;
  }

};

export const userService = {
  getProfile: async () => {
    const response = await API.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await API.put('/users/profile', profileData);
    return response.data;
  }
};

export const addressService = {
  getAddresses: async () => {
    const response = await API.get('/address');
    return response.data;
  },

  addAddress: async (addressData) => {
    const response = await API.post('/address', addressData);
    return response.data;
  },

  updateAddress: async (id, addressData) => {
    const response = await API.put(`/address/${id}`, addressData);
    return response.data;
  },

  deleteAddress: async (id) => {
    await API.delete(`/address/${id}`);
    return { success: true };
  },

  setDefaultAddress: async (id) => {
    const response = await API.put(`/address/default/${id}`);
    return response.data;
  }
};

export const orderService = {

  placeOrder: async (orderData) => {

    const response =
      await API.post('/orders', orderData);

    return response.data;
  },

  placeCODOrder: async (deliveryAddress) => {
    const response = await API.post("/orders/cod", { deliveryAddress });
    return response.data;
  },

  getMyOrders: async () => {
    const response = await API.get("/orders/my-orders");
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await API.put(`/orders/${orderId}/cancel`);
    return response.data;
  }

};

export const paymentService = {

  createPayment: async (orderId) => {

    const response = await API.post(
      `/payments/create/${orderId}`
    );

    return response.data;
  },

  verifyPayment: async (paymentData) => {

    const response = await API.post(
      "/payments/verify",
      paymentData
    );

    return response.data;
  }

};

// Artisan specific services
export const artisanProductService = {
  getProducts: async () => {
    const response = await API.get('/products/my-products');
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await API.post('/products/createproduct', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await API.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    await API.delete(`/products/${id}`);
    return { success: true };
  }
};

export const artisanOrderService = {
  getOrders: async () => {
    const response = await API.get('/artisan/orders');

    return response.data.map(order => ({
      id: order.orderId,
      customerName: order.buyerName,
      productName: order.productName,
      image: order.imageUrl,
      quantity: order.quantity,
      price: order.price,
      status: order.status,
      date: new Date(order.createdAt).toLocaleDateString('en-IN')
    }));
  },

  updateOrderStatus: async (id, status) => {
    const response = await API.put(`/artisan/orders/${id}/ship`);
    return response.data;
  }
};

export const artisanProfileService = {
  getProfile: async () => {
    const response = await API.get('/artisan/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await API.put('/artisan/profile', profileData);
    return response.data;
  }
};



export const artisanStatsService = {
  getStatistics: async () => {
    const response = await API.get('/artisans/statistics');
    return response.data;
  }
};

export const adminUserService = {

  getUsers: async () => {

    const response = await API.get('/admin/users');

    const users = response.data;

    const customers = users
      .filter(user => user.role === 'BUYER')
      .map(user => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone || '-',
        role: user.role,
        active: user.active
      }));

    const artisans = users
      .filter(user => user.role === 'ARTISAN')
      .map(user => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone || '-',

        village: user.village || '-',
        district: user.district || '-',
        state: user.state || '-',
        pincode: user.pincode || '-',
        category: user.category || '-',

        avatar: user.avatar,
        coverImage: user.coverImage,

        storyTitle: user.storyTitle || '-',
        storyDescription: user.storyDescription || '-',

        active: user.active,

        isComplete:
          !!user.village &&
          !!user.district &&
          !!user.state &&
          !!user.pincode &&
          !!user.category &&
          !!user.storyDescription
      }));

    return {
      customers,
      artisans
    };
  },

  deleteUser: async (id) => {

    const response =
      await API.delete(`/admin/users/${id}`);

    return response.data;
  }
};

export const adminDashboardService = {
  getDashboardData: async () => {
    const response = await API.get('/admin/dashboard');

    const data = response.data;

    return {
      stats: {
        totalCustomers: data.totalCustomers,
        totalArtisans: data.totalArtisans,
        totalProducts: data.totalProducts,
        totalOrders: data.totalOrders,
        totalRevenue: data.totalRevenue,
        pendingOrders: data.pendingOrders
      },

      recentOrders: data.recentOrders,

      recentProducts: data.recentProducts,

      recentArtisans: data.recentArtisans
    };
  }
};

export const adminProductService = {

  getProducts: async () => {
    const response = await API.get('/admin/products');

    return response.data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      quantity: product.quantity,
      active: product.active,

      image: product.imageUrl,

      categoryId: product.categoryId,
      category: product.categoryName,

      artisanId: product.artisanId,
      artisan: product.artisanName,

      createdAt: product.createdAt
    }));
  },

  deleteProduct: async (id) => {
    const response =
      await API.delete(`/admin/products/${id}`);

    return response.data;
  }
};

export const adminOrderService = {

  getOrders: async () => {

    const response = await API.get('/admin/orders');

    return response.data.map(order => ({

      id: order.orderId,

      buyerId: order.buyerId,
      customerName: order.buyerName,
      customerEmail: order.buyerEmail,

      totalAmount: Number(order.totalAmount),

      status: order.status,

      createdAt: order.createdAt,

      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      razorpayPaymentId: order.razorpayPaymentId,

      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        image: item.imageUrl,

        quantity: item.quantity,
        price: Number(item.price),

        artisanId: item.artisanId,
        artisan: item.artisanName
      }))

    }));
  }
};

export const adminStatsService = {
  getStatistics: async () => {
    await delay(600);
    const products = getLocalProducts();
    const ordersStr = localStorage.getItem('craft_orders') || '[]';
    const orders = JSON.parse(ordersStr);

    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.price) * Number(o.quantity)), 0);
    const monthlyRevenue = orders
      .filter((o) => o.date && o.date.startsWith('2026-06'))
      .reduce((acc, o) => acc + (Number(o.price) * Number(o.quantity)), 0);

    const categoriesCount = {};
    products.forEach(p => {
      categoriesCount[p.category] = (categoriesCount[p.category] || 0) + 15;
    });

    const productSales = {};
    orders.forEach(o => {
      productSales[o.productName] = (productSales[o.productName] || 0) + Number(o.quantity);
    });
    const topSellingProductsLabels = Object.keys(productSales).slice(0, 5);
    const topSellingProductsData = Object.values(productSales).slice(0, 5);

    const artisanRevenue = {};
    const artisanOrders = {};
    orders.forEach(o => {
      artisanRevenue[o.artisan] = (artisanRevenue[o.artisan] || 0) + (Number(o.price) * Number(o.quantity));
      artisanOrders[o.artisan] = (artisanOrders[o.artisan] || 0) + Number(o.quantity);
    });

    const topArtisans = Object.keys(artisanRevenue).map(name => {
      const profile = getArtisanProfileByName(name) || {};
      return {
        name,
        village: profile.village || 'Heritage Village',
        revenue: artisanRevenue[name],
        ordersCount: artisanOrders[name] || 1
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
      summary: {
        totalRevenue,
        monthlyRevenue: monthlyRevenue || totalRevenue,
        totalOrders,
        totalProducts
      },
      charts: {
        revenueByMonth: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [12000, 18500, 15000, 24000, 22000, totalRevenue || 5500]
        },
        ordersByMonth: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [15, 24, 20, 32, 28, totalOrders || 12]
        },
        topCategories: {
          labels: Object.keys(categoriesCount).slice(0, 5),
          data: Object.values(categoriesCount).slice(0, 5)
        },
        topProducts: {
          labels: topSellingProductsLabels.length ? topSellingProductsLabels : ['Terracotta Tea Cups', 'Wooden Elephant', 'Madhubani Canvas'],
          data: topSellingProductsData.length ? topSellingProductsData : [18, 12, 8]
        }
      },
      topArtisans
    };
  }
};

export const adminProfileService = {
  getProfile: async () => {
    await delay(500);
    const email = localStorage.getItem('craft_user_email') || 'admin@craftconnect.com';
    const profileKey = `craft_admin_profile_${email}`;
    let profile = localStorage.getItem(profileKey);
    if (!profile) {
      const defaultProfile = {
        name: localStorage.getItem('craft_user_name') || 'Super Admin',
        email,
        role: 'ADMIN',
        lastLogin: new Date().toLocaleString()
      };
      localStorage.setItem(profileKey, JSON.stringify(defaultProfile));
      return defaultProfile;
    }
    return JSON.parse(profile);
  },

  updateProfile: async (profileData) => {
    await delay(600);
    const email = localStorage.getItem('craft_user_email') || 'admin@craftconnect.com';
    const profileKey = `craft_admin_profile_${email}`;
    localStorage.setItem(profileKey, JSON.stringify(profileData));
    if (profileData.name) {
      localStorage.setItem('craft_user_name', profileData.name);
    }
    return profileData;
  }
};

export default API;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSettings, FiDollarSign, FiPackage, FiShoppingBag, FiMapPin, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import logoImg from '../assets/logo.png';

function ArtisanDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('Pottery');
  const [productDesc, setProductDesc] = useState('');
  const [artisanProducts, setArtisanProducts] = useState([
    {
      id: 101,
      name: 'Glazed Amber Pottery Mug',
      price: 249,
      category: 'Pottery',
      sales: 12,
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 102,
      name: 'Organic Clay Serving Platter',
      price: 599,
      category: 'Pottery',
      sales: 8,
      image: 'https://images.unsplash.com/photo-1576016770956-debb63d90029?w=600&auto=format&fit=crop&q=80',
    }
  ]);

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!productName || !productPrice) return;

    const newProd = {
      id: Date.now(),
      name: productName,
      price: parseFloat(productPrice),
      category: productCategory,
      sales: 0,
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80', // default clay image
    };

    setArtisanProducts([newProd, ...artisanProducts]);
    setProductName('');
    setProductPrice('');
    setProductDesc('');
    setShowAddForm(false);
    alert('Product listed successfully for sale on CraftConnect!');
  };

  return (
    <div className="min-h-screen bg-background-warm text-gray-800 font-sans">
      
      {/* Mini Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-full border border-primary/20 bg-white shadow-sm overflow-hidden flex items-center justify-center flex-shrink-0">
              <img 
                src={logoImg} 
                alt="CraftConnect Logo" 
                className="h-full w-full object-cover scale-[1.28]" 
              />
            </div>
            <span className="font-bold text-lg text-accent">CraftConnect <span className="text-primary text-xs bg-primary/10 px-2.5 py-0.5 rounded-full uppercase ml-1.5">Artisan Portal</span></span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-primary transition-colors text-sm font-semibold flex items-center"
            >
              <FiArrowLeft className="mr-1" /> View Storefront
            </button>
            <button
              onClick={handleLogoutClick}
              className="text-red-500 hover:text-red-700 transition-colors text-sm font-semibold flex items-center"
            >
              <FiLogOut className="mr-1" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Profile Introduction Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center space-x-4 sm:space-x-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary text-accent font-bold text-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-accent font-sans">Namaste, {user?.name || 'Artisan Partner'}!</h2>
              <p className="text-gray-500 text-sm mt-1 flex items-center">
                <FiMapPin className="text-primary mr-1" /> Raghurajpur Village, Odisha State
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full md:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <FiPlus className="h-5 w-5" />
            <span>Add New Craft</span>
          </button>
        </div>

        {/* Stats Cards Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3.5 bg-green-50 text-green-600 rounded-xl">
              <FiDollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Sales</p>
              <h3 className="text-2xl font-bold text-accent font-sans mt-0.5">₹7,782</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
              <FiPackage className="h-6 w-6" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Products Listed</p>
              <h3 className="text-2xl font-bold text-accent font-sans mt-0.5">{artisanProducts.length} Items</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3.5 bg-orange-50 text-orange-600 rounded-xl">
              <FiShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Active Orders</p>
              <h3 className="text-2xl font-bold text-accent font-sans mt-0.5">3 Pending</h3>
            </div>
          </div>

        </div>

        {/* Modal: Add New Product Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 border border-gray-100 shadow-2xl relative">
              <h3 className="text-xl font-bold text-accent mb-6 font-sans">List a New Handcrafted Item</h3>
              
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Handmade Hand-painted Madhubani Plate"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Price (INR)</label>
                    <input
                      type="number"
                      required
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="e.g. 450"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Category</label>
                    <select
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                    >
                      <option value="Pottery">Pottery</option>
                      <option value="Paintings">Paintings</option>
                      <option value="Textiles">Textiles</option>
                      <option value="Woodwork">Woodwork</option>
                      <option value="Jewelry">Jewelry</option>
                      <option value="Home Decor">Home Decor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Artisan Description</label>
                  <textarea
                    rows="3"
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value)}
                    placeholder="Describe how you made it, material source, and traditional technique..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  ></textarea>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="w-1/2 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl shadow transition-all"
                  >
                    Publish Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Existing Products List Grid */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-accent mb-6 font-sans flex items-center">
            <FiPackage className="mr-2 text-primary" /> Listed Crafts ({artisanProducts.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {artisanProducts.map((p) => (
              <div key={p.id} className="p-4 border border-gray-50 hover:border-primary/10 rounded-2xl flex items-center justify-between group transition-all">
                <div className="flex items-center space-x-4">
                  <img src={p.image} alt={p.name} className="w-14 h-14 object-cover rounded-xl border" />
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm group-hover:text-primary transition-colors">{p.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{p.category} &bull; Sold: {p.sales} times</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-accent text-base">₹{p.price}</span>
                  <span className="block text-[10px] text-green-600 font-bold mt-0.5 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

    </div>
  );
}

export default ArtisanDashboard;

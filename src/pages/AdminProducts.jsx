import React, { useState, useEffect } from 'react';
import {
  FiTag,
  FiSearch,
  FiTrash2,
  FiEye,
  FiAlertTriangle,
  FiCheckCircle,
  FiX
} from 'react-icons/fi';
import { adminProductService } from '../services/api';
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';

const FALLBACK_IMAGE =
  'https://placehold.co/600x400?text=No+Product+Image';

function AdminProducts({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');


  // Moderation modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await adminProductService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete || deactivating) return;

    try {
      setDeactivating(true);

      await adminProductService.deleteProduct(productToDelete.id);

      setProducts(prev =>
        prev.map(product =>
          product.id === productToDelete.id
            ? { ...product, active: false }
            : product
        )
      );

      setSelectedProduct(prev =>
        prev?.id === productToDelete.id
          ? { ...prev, active: false }
          : prev
      );

      setShowDeleteConfirm(false);
      setProductToDelete(null);

    } catch (err) {
      console.error(
        'Error deactivating product:',
        err.response?.data || err.message
      );
    } finally {
      setDeactivating(false);
    }
  };

  // Get unique categories for filter
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filters
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      <AdminNavbar user={user} onLogout={onLogout} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-accent/10 text-accent rounded-2xl flex-shrink-0">
              <FiTag className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-accent font-sans">Marketplace Products</h1>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Audit catalog listings and moderate policy violations</p>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filter Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-xs sm:text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
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
              placeholder="Search products by name..."
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
            <p className="text-gray-400 text-sm">Loading products list...</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-4">Product Details</th>
                    <th className="px-6 py-4">Artisan Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Price</th>
                    <th className="px-6 py-4 text-center">Stock</th>
                    <th className="px-6 py-4 text-center">Created Date</th>
                    <th className="px-6 py-4 text-center">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-400 font-semibold">
                        No products match search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                            <img
                              src={p.image || FALLBACK_IMAGE}
                              alt={p.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_IMAGE;
                              }}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-bold text-accent truncate max-w-[200px]" title={p.name}>{p.name}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{p.artisan}</td>
                        <td className="px-6 py-4 font-semibold text-primary">{p.category}</td>
                        <td className="px-6 py-4 text-center font-extrabold text-accent">₹{p.price}</td>
                        <td className="px-6 py-4 text-center font-bold">{p.quantity !== undefined ? p.quantity : 15}</td>
                        <td className="px-6 py-4 text-center text-gray-400">{p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString('en-IN')
                          : '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold ${p.active
                              ? 'bg-green-50 text-green-600 border border-green-100'
                              : 'bg-red-50 text-red-600 border border-red-100'
                              }`}
                          >
                            {p.active ? 'ACTIVE' : 'DEACTIVATED'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end space-x-2 pt-6">
                          <button
                            onClick={() => setSelectedProduct(p)}
                            className="p-2 bg-gray-50 hover:bg-primary/10 border border-gray-200 text-gray-500 hover:text-primary rounded-xl transition-all cursor-pointer"
                            title="View Product"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(p)}
                            disabled={!p.active}
                            className={`p-2 border rounded-xl transition-all ${p.active
                              ? 'bg-gray-50 hover:bg-red-50 border-gray-200 hover:border-red-200 text-gray-500 hover:text-red-600 cursor-pointer'
                              : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                              }`}
                            title={p.active ? 'Deactivate Product' : 'Product Deactivated'}
                          >
                            <FiTrash2 className="h-4 w-4" />
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

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

            {/* Header Image */}
            <div className="h-48 sm:h-56 bg-gray-50 relative flex-shrink-0 border-b border-gray-100 overflow-hidden">
              <img
                src={selectedProduct.image || FALLBACK_IMAGE}
                alt={selectedProduct.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 focus:outline-none cursor-pointer bg-white/80 hover:bg-white p-2 rounded-full shadow transition-all"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-grow space-y-4">
              <div>

                <div className="flex items-center gap-2">

                  {/* Category */}
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {selectedProduct.category}
                  </span>

                  {/* Product Status */}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${selectedProduct.active
                      ? 'bg-green-50 text-green-600 border border-green-100'
                      : 'bg-red-50 text-red-600 border border-red-100'
                      }`}
                  >
                    {selectedProduct.active ? 'ACTIVE' : 'DEACTIVATED'}
                  </span>

                </div>

                <h3 className="text-lg sm:text-xl font-bold text-accent mt-2 font-sans leading-tight">
                  {selectedProduct.name}
                </h3>

                <p className="text-xs text-gray-400 mt-1 font-semibold">
                  Listed by {selectedProduct.artisan}
                </p>

              </div>

              <div className="flex gap-4">
                <div className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                  <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">Price</span>
                  <p className="text-base font-black text-accent mt-0.5">₹{selectedProduct.price}</p>
                </div>
                <div className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                  <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">Available Stock</span>
                  <p className="text-base font-black text-accent mt-0.5">{selectedProduct.quantity !== undefined ? selectedProduct.quantity : 15} items</p>
                </div>
              </div>

              <div className="space-y-1.5 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Description</span>
                <p className="text-xs text-gray-500 font-medium leading-relaxed whitespace-pre-line">
                  {selectedProduct.description || 'No detailed catalog description provided.'}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-gray-100 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center">

            <div className="text-red-500 text-5xl mb-4 flex justify-center">
              <FiAlertTriangle />
            </div>

            <h3 className="text-lg font-bold text-accent font-sans mb-2">
              Deactivate Product Listing?
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
              Are you sure you want to deactivate{' '}
              <span className="font-bold text-accent">
                "{productToDelete?.name}"
              </span>
              ? The product will no longer be available to buyers, but its order history will be preserved.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProductToDelete(null);
                }}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deactivating}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm shadow transition-all ${deactivating
                  ? 'bg-red-300 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                  }`}
              >
                {deactivating ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AdminProducts;

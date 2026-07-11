import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiBriefcase } from 'react-icons/fi';
import { artisanProductService, artisanProfileService, imageUploadService, isProfileComplete } from '../services/api';
import ArtisanNavbar from '../components/ArtisanNavbar';
import Footer from '../components/Footer';

// Seed Unsplash defaults for categories
const DEFAULT_IMAGES = {
  Pottery: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80',
  Paintings: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&auto=format&fit=crop&q=80',
  Textiles: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
  Woodwork: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=600&auto=format&fit=crop&q=80',
  Jewelry: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
  'Home Decor': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'
};

function ArtisanProducts({ user, onLogout }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = add product
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: 'Pottery',
    imageUrl: '',
    images: []
  });
  const [errors, setErrors] = useState({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');

  useEffect(() => {
    loadProducts();
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const profile = await artisanProfileService.getProfile();
      setProfileComplete(isProfileComplete(profile));
    } catch (e) {
      console.error('Error checking profile status in products page', e);
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await artisanProductService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching artisan products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    setErrors({});
    if (product) {
      setEditingProduct(product);
      const existingImages =
        product.images && product.images.length > 0
          ? product.images.map(image => ({
            imageUrl: image.imageUrl,
            publicId: image.publicId
          }))
          : product.imageUrl
            ? [{
              imageUrl: product.imageUrl,
              publicId: null
            }]
            : [];

      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        quantity: product.quantity || '',
        category: product.categoryName || 'Pottery',

        imageUrl:
          existingImages[0]?.imageUrl || '',

        images: existingImages

      });
    } else {
      setEditingProduct(null);
      setForm({
        name: '',
        description: '',
        price: '',
        quantity: '',
        category: 'Pottery',
        imageUrl: '',
        images: []
      });
    }
    setIsModalOpen(true);
  };

  const validate = () => {
    const tempErrs = {};
    if (!form.images || form.images.length === 0) {
      tempErrs.images =
        'At least one product image is required';
    }
    if (!form.name.trim()) tempErrs.name = 'Product Name is required';
    if (!form.description.trim()) tempErrs.description = 'Description is required';

    if (!form.price) {
      tempErrs.price = 'Price is required';
    } else if (Number(form.price) <= 0) {
      tempErrs.price = 'Price must be greater than 0';
    }

    if (!form.quantity) {
      tempErrs.quantity = 'Quantity is required';
    } else if (Number(form.quantity) <= 0) {
      tempErrs.quantity = 'Quantity must be greater than 0';
    }

    setErrors(tempErrs);
    return Object.keys(tempErrs).length === 0;
  };

  const handleProductImagesUpload = async (fileList) => {

    const files = Array.from(fileList || []);

    if (files.length === 0) {
      return;
    }

    setImageUploadError('');

    const availableSlots =
      4 - form.images.length;

    if (availableSlots <= 0) {
      setImageUploadError(
        'Maximum 4 product images are allowed.'
      );
      return;
    }

    const selectedFiles =
      files.slice(0, availableSlots);

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    for (const file of selectedFiles) {

      if (!allowedTypes.includes(file.type)) {

        setImageUploadError(
          'Only JPG, PNG and WEBP images are allowed.'
        );

        return;
      }

      if (file.size > 5 * 1024 * 1024) {

        setImageUploadError(
          'Each image must be less than 5MB.'
        );

        return;
      }
    }


    try {

      setIsUploadingImage(true);

      const uploadedImages = [];

      for (const file of selectedFiles) {

        const result =
          await imageUploadService.uploadImage(
            file,
            'craftconnect/products'
          );

        uploadedImages.push({
          imageUrl: result.imageUrl,
          publicId: result.publicId
        });
      }


      setForm(prev => {

        const finalImages = [
          ...prev.images,
          ...uploadedImages
        ].slice(0, 4);

        return {
          ...prev,

          images: finalImages,

          imageUrl:
            finalImages[0]?.imageUrl || ''
        };
      });

    } catch (err) {

      console.error(
        'Product image upload failed:',
        err
      );

      setImageUploadError(
        'Unable to upload images. Please try again.'
      );

    } finally {

      setIsUploadingImage(false);
    }
  };
  const handleRemoveProductImage = (index) => {

    setForm(prev => {

      const updatedImages =
        prev.images.filter(
          (_, imageIndex) =>
            imageIndex !== index
        );

      return {
        ...prev,

        images: updatedImages,

        imageUrl:
          updatedImages[0]?.imageUrl || ''
      };
    });

    setImageUploadError('');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Use default Unsplash category image if no images are provided
    const productImages = form.images && form.images.length > 0
      ? form.images
      : [form.imageUrl.trim()];

    const CATEGORY_MAP = {
      Pottery: 1,
      Paintings: 2,
      Textiles: 3,
      Woodwork: 4,
      Jewelry: 5,
      "Home Decor": 6
    };

    const productPayload = {

      name: form.name.trim(),

      description: form.description.trim(),

      price: Number(form.price),

      quantity: Number(form.quantity),

      categoryId:
        CATEGORY_MAP[form.category],

      images: form.images.map(image => ({
        imageUrl: image.imageUrl,
        publicId: image.publicId
      }))
    };

    try {
      if (editingProduct) {
        // Edit flow
        await artisanProductService.updateProduct(editingProduct.id, productPayload);
      } else {
        // Add flow
        await artisanProductService.createProduct(productPayload);
      }
      await loadProducts();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await artisanProductService.deleteProduct(id);
      await loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      <ArtisanNavbar user={user} onLogout={onLogout} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-2xl flex-shrink-0">
              <FiBriefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-accent font-sans">My Products</h1>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Manage and monitor your handicraft inventory catalog</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!profileComplete) {
                setShowIncompleteModal(true);
              } else {
                handleOpenModal(null);
              }
            }}
            className={`inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-300 self-start sm:self-auto cursor-pointer ${!profileComplete
              ? 'bg-gray-300 hover:bg-gray-400 text-gray-600 opacity-80'
              : 'bg-primary hover:bg-primary-hover text-white hover:shadow-lg'
              }`}
          >
            <FiPlus className="h-4.5 w-4.5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-400 text-sm">Loading listed products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <FiBriefcase className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-accent font-sans">No products listed</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              Start showcasing your heritage skills by listing your first authentic handmade item for sale!
            </p>
            <button
              onClick={() => {
                if (!profileComplete) {
                  setShowIncompleteModal(true);
                } else {
                  handleOpenModal(null);
                }
              }}
              className={`mt-6 inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow transition-all duration-300 cursor-pointer ${!profileComplete
                ? 'bg-gray-300 hover:bg-gray-400 text-gray-600 opacity-80'
                : 'bg-primary hover:bg-primary-hover text-white hover:shadow-lg'
                }`}
            >
              <FiPlus className="h-4.5 w-4.5" />
              <span>List First Product</span>
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                {/* Image Section with Category Tag */}
                <div className="h-48 sm:h-52 w-full overflow-hidden bg-gray-50 relative flex-shrink-0">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-extrabold uppercase tracking-wider text-white">
                    {product.category}
                  </span>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-base sm:text-lg line-clamp-1 group-hover:text-primary transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Price</p>
                      <p className="font-extrabold text-accent text-lg">₹{product.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Stock Qty</p>
                      <p className={`font-bold text-sm ${product.quantity <= 3 ? 'text-red-500' : 'text-gray-700'}`}>
                        {product.quantity} items
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100/50">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="inline-flex items-center justify-center space-x-1.5 py-2 border border-gray-250 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <FiEdit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="inline-flex items-center justify-center space-x-1.5 py-2 border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <FiTrash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-gray-100 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
            >
              <FiX className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-accent font-sans">
                {editingProduct ? 'Modify Craft Details' : 'Add Handcrafted Item'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">Publish and display your handmade crafts in the marketplace</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${errors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                    }`}
                  placeholder="e.g. Amber Glazed Studio Pottery Mug"
                />
                {errors.name && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{errors.name}</p>}
              </div>

              {/* Price and Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Price (INR)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${errors.price ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                      }`}
                    placeholder="e.g. 599"
                  />
                  {errors.price && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Available Quantity</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${errors.quantity ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                      }`}
                    placeholder="e.g. 15"
                  />
                  {errors.quantity && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{errors.quantity}</p>}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-250 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  <option value="Pottery">Pottery</option>
                  <option value="Paintings">Paintings</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Woodwork">Woodwork</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Home Decor">Home Decor</option>
                </select>
              </div>

              {/* Product Images Uploader */}
              <div>

                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Product Images
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  disabled={
                    isUploadingImage ||
                    form.images.length >= 4
                  }
                  onChange={(e) => {

                    handleProductImagesUpload(
                      e.target.files
                    );

                    e.target.value = '';
                  }}
                  className="
      w-full
      px-4
      py-2.5
      rounded-xl
      border
      border-gray-200
      text-sm
      cursor-pointer
      disabled:opacity-50
      disabled:cursor-not-allowed
    "
                />

                <p className="mt-2 text-xs text-gray-500">
                  Upload up to 4 images. The first image is used as the product card image.
                </p>


                {isUploadingImage && (

                  <p className="mt-2 text-xs font-semibold text-primary">
                    Uploading images...
                  </p>

                )}


                {imageUploadError && (

                  <p className="mt-2 text-xs font-semibold text-red-500">
                    {imageUploadError}
                  </p>

                )}


                {errors.images && (

                  <p className="mt-2 text-xs font-semibold text-red-500">
                    {errors.images}
                  </p>

                )}


                {form.images.length > 0 && (

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">

                    {form.images.map((image, index) => (

                      <div
                        key={`${image.imageUrl}-${index}`}
                        className="relative"
                      >

                        <img
                          src={image.imageUrl}
                          alt={`Product preview ${index + 1}`}
                          className="
              w-full
              h-24
              object-cover
              rounded-xl
              border
              border-gray-200
            "
                        />


                        {index === 0 && (

                          <span
                            className="
                absolute
                left-1.5
                bottom-1.5
                px-2
                py-0.5
                rounded-md
                bg-black/70
                text-white
                text-[10px]
                font-bold
              "
                          >
                            PRIMARY
                          </span>

                        )}


                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveProductImage(index)
                          }
                          disabled={isUploadingImage}
                          className="
              absolute
              top-1.5
              right-1.5
              p-1.5
              rounded-full
              bg-black/60
              text-white
              hover:bg-red-600
              disabled:opacity-50
            "
                          aria-label={`Remove product image ${index + 1}`}
                        >
                          <FiX className="h-3.5 w-3.5" />
                        </button>

                      </div>

                    ))}

                  </div>

                )}

              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Artisan Description</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${errors.description ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                    }`}
                  placeholder="Describe your raw materials, craft tradition, and creation time..."
                />
                {errors.description && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{errors.description}</p>}
              </div>

              {/* Save/Cancel Controls */}
              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isUploadingImage}
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-all shadow hover:shadow-md cursor-pointer flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiCheck className="h-4.5 w-4.5" />

                  <span>
                    {isUploadingImage
                      ? 'Uploading Images...'
                      : editingProduct
                        ? 'Save Changes'
                        : 'Publish Product'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUploadingImage}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Incomplete Modal */}
      {showIncompleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-100 shadow-2xl transform transition-all duration-300 scale-100 flex flex-col relative">
            <button
              onClick={() => setShowIncompleteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              <FiX className="h-6 w-6" />
            </button>
            <div className="text-amber-500 text-5xl mb-4 self-center">⚠️</div>
            <h2 className="text-xl sm:text-2xl font-bold text-accent text-center mb-3 font-sans">Profile Incomplete</h2>
            <p className="text-gray-500 text-sm text-center leading-relaxed mb-6">
              To list your authentic handmade products for sale, please complete your artisan profile first. The following fields are required:
            </p>
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 mb-6">
              <ul className="text-xs text-amber-800 space-y-2 font-semibold">
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                  <span>Profile Photo</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                  <span>Contact Phone Number</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                  <span>Full Address (Village, District, State)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                  <span>Craft Category</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                  <span>Artisan Story (Title & Description)</span>
                </li>
              </ul>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowIncompleteModal(false)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowIncompleteModal(false);
                  navigate('/artisan/profile');
                }}
                className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow transition-all cursor-pointer"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ArtisanProducts;

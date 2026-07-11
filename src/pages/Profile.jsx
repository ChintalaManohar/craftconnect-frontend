import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiTrash2, FiPlus, FiX, FiCheck, FiCompass, FiCamera } from 'react-icons/fi';
import { userProfileService, imageUploadService, addressService } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Profile({ user, cart, wishlist, onLogout, onProfileUpdate }) {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: ''
  });
  const [addresses, setAddresses] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile edit form fields
  const [editProfileForm, setEditProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: ''
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Photo upload states
  const [isChangingPhoto, setIsChangingPhoto] = useState(false);
  const [photoUploadVal, setPhotoUploadVal] = useState('');

  const [isUploadingPhoto, setIsUploadingPhoto] =
    useState(false);

  const [photoUploadError, setPhotoUploadError] =
    useState('');

  // Address modal states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // null means adding a new address
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
  const [isLoading, setIsLoading] = useState(false);

  const cartCount = cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  // Fetch profile and addresses on mount
  useEffect(() => {
    const loadProfileAndAddresses = async () => {
      setIsLoading(true);
      try {
        const profileData =
          await userProfileService.getMyProfile();

        setProfile(profileData);

        setEditProfileForm({
          fullName: profileData.fullName || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          avatar: profileData.avatar || ''
        });

        setPhotoUploadVal(profileData.avatar || '');

        const addressData = await addressService.getAddresses();
        setAddresses(addressData);
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfileAndAddresses();
  }, []);


  const handleProfilePhotoUpload = async (file) => {

    if (!file) return;

    setPhotoUploadError('');

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      setPhotoUploadError(
        'Only JPG, PNG and WEBP images are allowed.'
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoUploadError(
        'Image must be less than 5MB.'
      );
      return;
    }

    try {

      setIsUploadingPhoto(true);

      const result =
        await imageUploadService.uploadImage(
          file,
          'craftconnect/profiles'
        );

      setPhotoUploadVal(result.imageUrl);

    } catch (err) {

      console.error(
        'Profile photo upload failed:',
        err
      );

      setPhotoUploadError(
        'Unable to upload profile photo.'
      );

    } finally {

      setIsUploadingPhoto(false);
    }
  };

  const handleSavePhoto = async () => {

    if (!photoUploadVal) {
      setPhotoUploadError(
        'Please select a profile photo.'
      );
      return;
    }

    try {

      const updated =
        await userProfileService.updateMyProfile({
          avatar: photoUploadVal
        });

      setProfile(updated);

      setEditProfileForm(prev => ({
        ...prev,
        avatar: updated.avatar || ''
      }));

      setPhotoUploadVal(updated.avatar || '');

      setIsChangingPhoto(false);

    } catch (err) {

      console.error(
        'Error saving profile photo:',
        err
      );

      setPhotoUploadError(
        'Unable to save profile photo.'
      );
    }
  };

  // Validation functions
  const validateProfile = () => {
    const errs = {};
    if (!editProfileForm.fullName.trim())
      errs.fullName = 'Full Name is required';

    if (!editProfileForm.phone.trim()) {
      errs.phone = 'Phone Number is required';
    } else if (!/^\d{10}$/.test(editProfileForm.phone.replace(/\D/g, ''))) {
      errs.phone = 'Phone number must be exactly 10 digits';
    }

    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateAddress = () => {
    const errs = {};
    if (!addressForm.name.trim()) errs.name = 'Recipient Name is required';
    if (!addressForm.mobile.trim()) {
      errs.mobile = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(addressForm.mobile.replace(/\D/g, ''))) {
      errs.mobile = 'Mobile number must be exactly 10 digits';
    }
    if (!addressForm.village.trim()) errs.village = 'Village/Locality is required';
    if (!addressForm.city.trim()) errs.city = 'City/Town is required';
    if (!addressForm.district.trim()) errs.district = 'District is required';
    if (!addressForm.state.trim()) errs.state = 'State is required';
    if (!addressForm.pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(addressForm.pincode)) {
      errs.pincode = 'Pincode must be exactly 6 digits';
    }
    if (!addressForm.landmark.trim()) errs.landmark = 'Full Address / Landmark is required';

    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit profile edit
  const handleSaveProfile = async (e) => {

    e.preventDefault();

    if (!validateProfile()) return;

    try {

      const updated =
        await userProfileService.updateMyProfile({
          fullName: editProfileForm.fullName.trim(),
          phone: editProfileForm.phone,
          avatar: editProfileForm.avatar || null
        });

      setProfile(updated);

      setEditProfileForm({
        fullName: updated.fullName || '',
        email: updated.email || '',
        phone: updated.phone || '',
        avatar: updated.avatar || ''
      });

      if (onProfileUpdate) {
        onProfileUpdate(updated.fullName, updated.email);
      }

      setIsEditingProfile(false);

    } catch (err) {

      console.error(
        'Error updating profile:',
        err
      );
    }
  };

  // Delete address action
  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await addressService.deleteAddress(id);
      setAddresses(addresses.filter((addr) => addr.id !== id));
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  // Open address modal for adding or editing
  const handleOpenAddressModal = (address = null) => {
    setAddressErrors({});
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        type: address.type || 'Home',
        name: address.name || '',
        mobile: address.mobile || '',
        village: address.village || '',
        city: address.city || '',
        district: address.district || '',
        state: address.state || '',
        pincode: address.pincode || '',
        landmark: address.landmark || ''
      });
    } else {
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
    }
    setIsAddressModalOpen(true);
  };

  // Save address (Add/Update)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!validateAddress()) return;

    try {
      if (editingAddress) {
        // Edit flow
        const updated = await addressService.updateAddress(editingAddress.id, addressForm);
        setAddresses(addresses.map((a) => (a.id === editingAddress.id ? updated : a)));
      } else {
        // Add flow
        const added = await addressService.addAddress(addressForm);
        setAddresses([...addresses, added]);
      }
      setIsAddressModalOpen(false);
    } catch (err) {
      console.error('Error saving address:', err);
    }
  };

  // Get initials for profile placeholder
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
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

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {/* Breadcrumb */}
        <nav className="text-xs sm:text-sm text-gray-400 font-semibold mb-6 flex items-center space-x-2">
          <Link to="/home" className="hover:text-primary transition-colors">Marketplace</Link>
          <span>&bull;</span>
          <span className="text-accent">My Profile</span>
        </nav>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-400 text-sm">Loading profile details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT COLUMN: Profile Header overview & Links */}
            <div className="lg:col-span-4 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 text-center relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 left-0 right-0 h-20 bg-secondary/10 pointer-events-none"></div>

                {/* Circular Avatar */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-secondary overflow-hidden border-2 border-white shadow-md select-none mt-4 z-10 transition-all duration-300 relative group">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full text-accent text-2xl sm:text-3xl font-bold flex items-center justify-center bg-secondary">
                      {getInitials(profile.fullName)}
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-accent mt-4 font-sans leading-tight">{profile.fullName}</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">{profile.email}</p>
                <span className="mt-2.5 px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  {user ? user.role : 'Buyer'}
                </span>

                {/* Change Photo Button */}
                <button
                  type="button"
                  onClick={() => {
                    setPhotoUploadVal(profile.avatar || profile.profileImageUrl || '');
                    setIsChangingPhoto(true);
                  }}
                  className="mt-3 text-xs font-bold text-primary hover:text-primary-hover flex items-center space-x-1.5 transition-colors cursor-pointer bg-primary/5 hover:bg-primary/10 px-3 py-1 rounded-full border border-primary/15"
                >
                  <FiCamera className="h-3.5 w-3.5" />
                  <span>Change Photo</span>
                </button>

                <div className="w-full border-t border-gray-100 my-5"></div>

                {/* Quick Link Actions */}
                <div className="flex flex-col w-full gap-2.5">
                  <Link
                    to="/orders"
                    className="w-full py-2.5 border border-gray-250 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-2"
                  >
                    <span>📦</span> <span>My Orders</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    className="w-full py-2.5 border border-gray-250 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-2"
                  >
                    <span>❤️</span> <span>My Wishlist</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Edit Info and Addresses */}
            <div className="lg:col-span-8 space-y-6">

              {/* PERSONAL INFORMATION CARD */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 sm:p-7 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-bold text-accent font-sans">
                    Personal Information
                  </h2>
                  {!isEditingProfile && (
                    <button
                      onClick={() => {
                        setEditProfileForm(profile);
                        setProfileErrors({});
                        setIsEditingProfile(true);
                      }}
                      className="px-4 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-full font-bold text-xs shadow-sm transition-all duration-300 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <FiEdit2 className="h-3 w-3" />
                      <span>Edit Details</span>
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                        <input
                          type="text"
                          value={editProfileForm.fullName}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 transition-all ${profileErrors.fullName ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                            }`}
                        />
                        {profileErrors.fullName && <p className="text-red-500 text-xs mt-1">{profileErrors.fullName}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                        <input
                          type="email"
                          value={editProfileForm.email}
                          disabled
                          className="
                          w-full
                          px-4
    py-2.5
    rounded-xl
    border
    border-gray-200
    bg-gray-100
    text-gray-500
    text-sm
    cursor-not-allowed
  "
                        />
                        {profileErrors.email && <p className="text-red-500 text-xs mt-1">{profileErrors.email}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm font-semibold select-none">
                            +91
                          </span>
                          <input
                            type="text"
                            maxLength="10"
                            value={editProfileForm.phone}
                            onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value.replace(/\D/g, '') })}
                            className={`w-full pl-12 pr-4 py-2.5 rounded-xl border bg-gray-50/50 text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 transition-all ${profileErrors.phone ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                              }`}
                            placeholder="9876543210"
                          />
                        </div>
                        {profileErrors.phone && <p className="text-red-500 text-xs mt-1">{profileErrors.phone}</p>}
                      </div>


                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-full font-semibold text-sm transition-all shadow hover:shadow-md cursor-pointer flex items-center space-x-1"
                      >
                        <FiCheck className="h-4 w-4" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-full font-semibold text-sm transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-sm">
                    <div className="space-y-1.5 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</span>
                      <p className="font-bold text-gray-800">{profile.fullName}</p>
                    </div>
                    <div className="space-y-1.5 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</span>
                      <p className="font-bold text-gray-800 break-all">{profile.email}</p>
                    </div>
                    <div className="space-y-1.5 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</span>
                      <p className="font-bold text-gray-800">+91 {profile.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ADDRESS MANAGEMENT CARD */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 sm:p-7 space-y-6">
                <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-accent font-sans">Saved Addresses</h2>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">Manage your shipping endpoints</p>
                  </div>

                  <button
                    onClick={() => handleOpenAddressModal(null)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-full font-bold text-xs shadow-sm hover:shadow transition-all duration-300 cursor-pointer self-start sm:self-auto"
                  >
                    <FiPlus className="h-4 w-4" />
                    <span>Add Address</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl p-5">
                    <FiMapPin className="mx-auto h-7 w-7 text-gray-300 mb-2" />
                    <p className="text-sm font-bold text-gray-400">No saved addresses found</p>
                    <p className="text-xs text-gray-400 mt-1">Please add a shipping address to facilitate quicker checkout.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border border-gray-150 hover:border-primary/30 rounded-xl p-4.5 hover:shadow-md transition-all duration-300 bg-white relative flex flex-col justify-between min-h-[220px]"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${address.type === 'Home'
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : address.type === 'Work'
                                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                : 'bg-amber-50 text-amber-600 border border-amber-100'
                              }`}>
                              {address.type}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <h4 className="font-bold text-gray-800 text-sm leading-tight">{address.name}</h4>
                            <p className="text-xs text-gray-400 font-bold flex items-center">
                              <FiPhone className="mr-1 h-3.5 w-3.5 text-gray-300" /> +91 {address.mobile}
                            </p>
                          </div>

                          <div className="text-[11px] text-gray-500 space-y-0.5 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 font-medium">
                            <p><span className="font-bold text-gray-400">Locality:</span> {address.village}</p>
                            <p><span className="font-bold text-gray-400">City/State:</span> {address.city}, {address.state}</p>
                            <p><span className="font-bold text-gray-400">Pincode:</span> {address.pincode}</p>
                            <p className="mt-1 border-t border-gray-200/50 pt-1 text-[10px] text-gray-400 italic">
                              <span className="font-bold not-italic text-gray-400">Landmark:</span> {address.landmark}
                            </p>
                          </div>
                        </div>

                        {/* Card Action footer */}
                        <div className="flex items-center justify-end space-x-3 pt-3 mt-3 border-t border-gray-100 flex-shrink-0">
                          <button
                            onClick={() => handleOpenAddressModal(address)}
                            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center space-x-1 transition-colors cursor-pointer"
                          >
                            <FiEdit2 className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                          <span className="text-gray-200 text-xs">|</span>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center space-x-1 transition-colors cursor-pointer"
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

            </div>

          </div>
        )}
      </main>

      {/* ADDRESS ADD/EDIT MODAL OVERLAY */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 border border-gray-150 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
            >
              <FiX className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-accent font-sans">
                {editingAddress ? 'Modify Address' : 'Add Shipping Address'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Provide delivery credentials for your orders</p>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Type Selection */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Address Type</label>
                  <select
                    value={addressForm.type}
                    onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-250 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-gray-700 cursor-pointer"
                  >
                    <option value="Home">Home (Delivery all day)</option>
                    <option value="Work">Work (Delivery between 9 AM - 5 PM)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Recipient Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Recipient Name</label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${addressErrors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                      }`}
                    placeholder="e.g. Aarav Sharma"
                  />
                  {addressErrors.name && <p className="text-red-500 text-[10px] mt-1 font-semibold">{addressErrors.name}</p>}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mobile Number</label>
                  <input
                    type="text"
                    maxLength="10"
                    value={addressForm.mobile}
                    onChange={(e) => setAddressForm({ ...addressForm, mobile: e.target.value.replace(/\D/g, '') })}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${addressErrors.mobile ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                      }`}
                    placeholder="10-digit mobile number"
                  />
                  {addressErrors.mobile && <p className="text-red-500 text-[10px] mt-1 font-semibold">{addressErrors.mobile}</p>}
                </div>

                {/* Village / Locality */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Village / Locality</label>
                  <input
                    type="text"
                    value={addressForm.village}
                    onChange={(e) => setAddressForm({ ...addressForm, village: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${addressErrors.village ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                      }`}
                    placeholder="Village name or street"
                  />
                  {addressErrors.village && <p className="text-red-500 text-[10px] mt-1 font-semibold">{addressErrors.village}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">City / Town</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${addressErrors.city ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                      }`}
                    placeholder="City or Town name"
                  />
                  {addressErrors.city && <p className="text-red-500 text-[10px] mt-1 font-semibold">{addressErrors.city}</p>}
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">District</label>
                  <input
                    type="text"
                    value={addressForm.district}
                    onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${addressErrors.district ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                      }`}
                    placeholder="District"
                  />
                  {addressErrors.district && <p className="text-red-500 text-[10px] mt-1 font-semibold">{addressErrors.district}</p>}
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${addressErrors.state ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                      }`}
                    placeholder="State"
                  />
                  {addressErrors.state && <p className="text-red-500 text-[10px] mt-1 font-semibold">{addressErrors.state}</p>}
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pincode</label>
                  <input
                    type="text"
                    maxLength="6"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${addressErrors.pincode ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                      }`}
                    placeholder="6-digit pincode"
                  />
                  {addressErrors.pincode && <p className="text-red-500 text-[10px] mt-1 font-semibold">{addressErrors.pincode}</p>}
                </div>

                {/* Full Address / Landmark */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Address / Landmark</label>
                  <textarea
                    rows="3"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 ${addressErrors.landmark ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                      }`}
                    placeholder="Flat/House No., Building, Landmark details"
                  />
                  {addressErrors.landmark && <p className="text-red-500 text-[10px] mt-1 font-semibold">{addressErrors.landmark}</p>}
                </div>

              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-all shadow hover:shadow-md cursor-pointer flex items-center justify-center space-x-1"
                >
                  <FiCheck className="h-4.5 w-4.5" />
                  <span>Save Address</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Photo Modal */}
      {isChangingPhoto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-gray-100 shadow-2xl relative animate-in zoom-in-95 duration-200 space-y-6">
            <button
              onClick={() => setIsChangingPhoto(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
            >
              <FiX className="h-5 w-5" />
            </button>
            <div>
              <h3 className="text-lg font-bold text-accent font-sans">Update Profile Photo</h3>
              <p className="text-xs text-gray-400 mt-1">Upload a profile picture from your local device</p>
            </div>

            <div className="space-y-4">

              <div className="flex justify-center">

                <div className="
      w-32
      h-32
      rounded-full
      overflow-hidden
      border-2
      border-gray-200
      bg-gray-100
    ">

                  {photoUploadVal ? (

                    <img
                      src={photoUploadVal}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <div className="
          w-full
          h-full
          flex
          items-center
          justify-center
          text-gray-400
        ">
                      <FiUser className="h-10 w-10" />
                    </div>

                  )}

                </div>

              </div>


              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isUploadingPhoto}
                onChange={(e) => {

                  handleProfilePhotoUpload(
                    e.target.files?.[0]
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


              {isUploadingPhoto && (

                <p className="text-xs font-semibold text-primary text-center">
                  Uploading profile photo...
                </p>

              )}


              {photoUploadError && (

                <p className="text-xs font-semibold text-red-500 text-center">
                  {photoUploadError}
                </p>

              )}

            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleSavePhoto}
                disabled={
                  isUploadingPhoto ||
                  !photoUploadVal
                }
                className="
    flex-1
    py-2.5
    bg-primary
    hover:bg-primary-hover
    text-white
    rounded-xl
    text-xs
    font-bold
    shadow
    transition-all
    cursor-pointer
    disabled:opacity-50
    disabled:cursor-not-allowed
  "
              >
                {isUploadingPhoto
                  ? 'Uploading...'
                  : 'Save Photo'}
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPhoto(false)}
                disabled={isUploadingPhoto}
                className="flex-1 py-2.5 border border-gray-250 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Profile;

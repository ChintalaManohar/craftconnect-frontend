import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiMail,
  FiClock,
  FiShield,
  FiEdit2,
  FiCheck,
  FiCamera
} from 'react-icons/fi';
import {
  userProfileService,
  imageUploadService
} from '../services/api';
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';

function AdminProfile({ user, onLogout, onProfileUpdate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: ''
  });
  const [errors, setErrors] = useState({});

  const [isUploadingPhoto, setIsUploadingPhoto] =
    useState(false);

  const [photoUploadError, setPhotoUploadError] =
    useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);

    try {
      const data =
        await userProfileService.getMyProfile();

      setProfile(data);

      setForm({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        avatar: data.avatar || ''
      });

    } catch (err) {
      console.error(
        'Error fetching admin profile:',
        err
      );
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const validate = () => {
    const errs = {};

    if (!form.fullName.trim()) {
      errs.fullName =
        'Administrator Name is required';
    }

    if (
      form.phone &&
      !/^\d{10}$/.test(
        form.phone.replace(/\D/g, '')
      )
    ) {
      errs.phone =
        'Phone number must be exactly 10 digits';
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };


  const handleAvatarUpload = async (file) => {
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

      setForm(prev => ({
        ...prev,
        avatar: result.imageUrl
      }));

    } catch (err) {
      console.error(
        'Admin profile photo upload failed:',
        err
      );

      setPhotoUploadError(
        'Unable to upload profile photo.'
      );

    } finally {
      setIsUploadingPhoto(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const updated =
        await userProfileService.updateMyProfile({
          fullName: form.fullName.trim(),
          phone: form.phone,
          avatar: form.avatar || null
        });

      setProfile(updated);

      setForm({
        fullName: updated.fullName || '',
        email: updated.email || '',
        phone: updated.phone || '',
        avatar: updated.avatar || ''
      });

      if (onProfileUpdate) {
        onProfileUpdate(updated.fullName, updated.email);
      }

      setIsEditing(false);

    } catch (err) {
      console.error(
        'Error updating admin profile:',
        err
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      <AdminNavbar user={user} onLogout={onLogout} />

      <main className="flex-grow max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16">

        {loading || !profile ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-400 text-sm">Loading admin profile...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">

            {/* Main profile card layout */}
            <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden p-6 sm:p-8 flex flex-col items-center relative">
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-tr from-accent to-accent-hover"></div>

              {/* Profile icon */}
              <div className="relative z-10 mt-8">

                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-secondary border-4 border-white shadow-md overflow-hidden flex items-center justify-center select-none text-accent text-2xl sm:text-3xl font-black">

                  {form.avatar || profile.avatar ? (
                    <img
                      src={form.avatar || profile.avatar}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(profile.fullName)
                  )}

                </div>


                {isEditing && (

                  <label
                    className="
        absolute
        -bottom-1
        -right-1
        w-8
        h-8
        rounded-full
        bg-primary
        hover:bg-primary-hover
        text-white
        flex
        items-center
        justify-center
        shadow
        cursor-pointer
      "
                    title="Upload profile photo"
                  >

                    <FiCamera className="h-4 w-4" />

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isUploadingPhoto}
                      onChange={(e) => {
                        handleAvatarUpload(
                          e.target.files?.[0]
                        );

                        e.target.value = '';
                      }}
                      className="hidden"
                    />

                  </label>

                )}

              </div>
              {isUploadingPhoto && (
                <p className="relative z-10 mt-2 text-xs font-semibold text-primary">
                  Uploading profile photo...
                </p>
              )}

              {photoUploadError && (
                <p className="relative z-10 mt-2 text-xs font-semibold text-red-500">
                  {photoUploadError}
                </p>
              )}

              <h2 className="text-xl font-bold text-accent mt-4 font-sans">{profile.fullName}</h2>
              <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 mt-2 select-none">
                System Administrator
              </span>

              {/* Data elements / Edit form */}
              <div className="w-full mt-8 border-t border-gray-50 pt-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Full Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Administrator Name</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                          <FiUser className="h-4.5 w-4.5" />
                        </span>
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              fullName: e.target.value
                            })
                          }
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${errors.fullName ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                            }`}
                        />
                      </div>
                      {errors.fullName && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.fullName}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                          <FiMail className="h-4.5 w-4.5" />
                        </span>
                        <input
                          type="email"
                          value={form.email}
                          disabled
                          className="
    w-full
    pl-10
    pr-4
    py-2.5
    rounded-xl
    border
    border-gray-250
    bg-gray-100
    text-gray-500
    text-sm
    cursor-not-allowed
  "
                        />
                      </div>

                    </div>

                    <div>

                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            phone: e.target.value
                          })
                        }
                        maxLength={10}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${errors.phone
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                          }`}
                      />

                      {errors.phone && (
                        <p className="text-red-500 text-[10px] mt-1 font-bold">
                          {errors.phone}
                        </p>
                      )}

                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-gray-50">
                      <button
                        type="submit"
                        disabled={isUploadingPhoto}
                        className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-full font-bold text-xs transition-all shadow hover:shadow-md cursor-pointer flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiCheck className="h-4.5 w-4.5" />

                        <span>
                          {isUploadingPhoto
                            ? 'Uploading Photo...'
                            : 'Save Changes'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-full font-bold text-xs transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* Name display */}
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary flex-shrink-0">
                          <FiUser className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">Admin Name</span>
                          <p className="font-bold text-accent leading-tight truncate">{profile.fullName}</p>
                        </div>
                      </div>

                      {/* Email display */}
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary flex-shrink-0">
                          <FiMail className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">Email Address</span>
                          <p className="font-bold text-accent leading-tight truncate" title={profile.email}>{profile.email}</p>
                        </div>
                      </div>

                      {/* Security Role display */}
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary flex-shrink-0">
                          <FiShield className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">Access Level</span>
                          <p className="font-bold text-accent leading-tight">{profile.role}</p>
                        </div>
                      </div>

                      {/* Last Login display */}
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary flex-shrink-0">
                          <FiClock className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">Last Session</span>
                          <p className="font-bold text-accent leading-tight">{profile.lastLogin || 'Just now'}</p>
                        </div>
                      </div>

                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => {
                          setForm({
                            fullName: profile.fullName || '',
                            email: profile.email || '',
                            phone: profile.phone || '',
                            avatar: profile.avatar || ''
                          });

                          setPhotoUploadError('');
                          setIsEditing(true);
                        }}
                        className="px-6 py-2.5 border border-primary hover:bg-primary hover:text-white text-primary rounded-full font-bold text-xs shadow-sm transition-all duration-300 flex items-center space-x-1.5 cursor-pointer"
                      >
                        <FiEdit2 className="h-3 w-3" />
                        <span>Edit Details</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default AdminProfile;

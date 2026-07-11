import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit2,
  FiCheck,
  FiBookOpen,
  FiCamera,
  FiAward,
  FiCheckCircle,
  FiAlertTriangle
} from 'react-icons/fi';
import {
  artisanProfileService,
  imageUploadService,
  isProfileComplete
} from '../services/api';
import ArtisanNavbar from '../components/ArtisanNavbar';
import Footer from '../components/Footer';

const AVATAR_PRESETS = [
  { name: 'Pottery Style', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { name: 'Painting Style', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { name: 'Weaving Style', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' },
  { name: 'Carving Style', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80' },
  { name: 'Jewelry Style', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { name: 'Metalwork Style', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80' }
];

const COVER_PRESETS = [
  { name: 'Pottery Cover', url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Painting Cover', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Weaving Cover', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Carving Cover', url: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Jewelry Cover', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Metalwork Cover', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80' }
];

function ArtisanProfile({ user, onLogout, onProfileUpdate }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Profile Form States
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [detailsForm, setDetailsForm] = useState({
    name: '',
    email: '',
    phone: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    category: '',
    experience: '',
    avatar: ''
  });
  const [detailsErrors, setDetailsErrors] = useState({});

  // Story Form States
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [storyForm, setStoryForm] = useState({
    storyTitle: '',
    storyDescription: '',
    coverImage: ''
  });
  const [storyErrors, setStoryErrors] = useState({});
  const [isUploadingAvatar, setIsUploadingAvatar] =
    useState(false);

  const [isUploadingCover, setIsUploadingCover] =
    useState(false);

  const [avatarUploadError, setAvatarUploadError] =
    useState('');

  const [coverUploadError, setCoverUploadError] =
    useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await artisanProfileService.getProfile();
      setProfile(data);
      setDetailsForm({
        name: data.fullName || data.name || user?.name || '',
        phone: data.phone || '',
        village: data.village || '',
        district: data.district || '',
        state: data.state || '',
        pincode: data.pincode || '',
        category: data.category || '',
        experience: data.experience !== undefined && data.experience !== null ? String(data.experience) : '',
        avatar: data.avatar || ''
      });
      setStoryForm({
        storyTitle: data.storyTitle || '',
        storyDescription: data.storyDescription || '',
        coverImage: data.coverImage || ''
      });
    } catch (err) {
      console.error('Error loading artisan profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayExperience = (exp) => {
    if (exp === null || exp === undefined || String(exp).trim() === '') return 'Not set';
    const expStr = String(exp).trim();
    if (expStr.toLowerCase().includes('year')) return expStr;
    return `${expStr} Years`;
  };

  // Grouped completion percentage calculations
  const getGroupCompletion = (group) => {
    if (!profile) return 0;
    let fields = [];
    if (group === 'personal') fields = ['avatar', 'phone'];
    else if (group === 'location') fields = ['village', 'district', 'state'];
    else if (group === 'craft') fields = ['category'];
    else if (group === 'story') fields = ['storyTitle', 'storyDescription'];

    const completed = fields.filter(f => profile[f] && String(profile[f]).trim() !== '');
    return Math.round((completed.length / fields.length) * 100);
  };

  const getTotalCompletion = () => {
    if (!profile) return 0;
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
    const completed = requiredFields.filter(f => profile[f] && String(profile[f]).trim() !== '');
    return Math.round((completed.length / requiredFields.length) * 100);
  };

  // Validations
  const validateDetails = () => {
    const errs = {};
    if (!detailsForm.name.trim()) errs.name = 'Full Name is required';

    if (!detailsForm.phone.trim()) {
      errs.phone = 'Phone Number is required';
    } else if (!/^\d{10}$/.test(detailsForm.phone.replace(/\D/g, ''))) {
      errs.phone = 'Phone number must be exactly 10 digits';
    }

    if (!detailsForm.village.trim()) errs.village = 'Village name is required';
    if (!detailsForm.district.trim()) errs.district = 'District is required';
    if (!detailsForm.state.trim()) errs.state = 'State is required';

    if (detailsForm.pincode.trim() && !/^\d{6}$/.test(detailsForm.pincode)) {
      errs.pincode = 'Pincode must be exactly 6 digits';
    }

    if (!detailsForm.category.trim()) errs.category = 'Craft Category is required';
    if (!detailsForm.avatar.trim()) errs.avatar = 'Profile Photo is required';

    setDetailsErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStory = () => {
    const errs = {};
    if (!storyForm.storyTitle.trim()) errs.storyTitle = 'Story Title is required';
    if (!storyForm.storyDescription.trim()) errs.storyDescription = 'Story description is required';

    setStoryErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateImageFile = (file) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Only JPG, PNG and WEBP images are allowed.';
    }

    if (file.size > 5 * 1024 * 1024) {
      return 'Image must be less than 5MB.';
    }

    return null;
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;

    setAvatarUploadError('');

    const validationError =
      validateImageFile(file);

    if (validationError) {
      setAvatarUploadError(validationError);
      return;
    }

    try {
      setIsUploadingAvatar(true);

      const result =
        await imageUploadService.uploadImage(
          file,
          'craftconnect/profiles'
        );

      setDetailsForm(prev => ({
        ...prev,
        avatar: result.imageUrl
      }));

    } catch (err) {
      console.error(
        'Avatar upload failed:',
        err
      );

      setAvatarUploadError(
        'Unable to upload profile photo.'
      );

    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (file) => {
    if (!file) return;

    setCoverUploadError('');

    const validationError =
      validateImageFile(file);

    if (validationError) {
      setCoverUploadError(validationError);
      return;
    }

    try {
      setIsUploadingCover(true);

      const result =
        await imageUploadService.uploadImage(
          file,
          'craftconnect/covers'
        );

      setStoryForm(prev => ({
        ...prev,
        coverImage: result.imageUrl
      }));

    } catch (err) {
      console.error(
        'Cover upload failed:',
        err
      );

      setCoverUploadError(
        'Unable to upload cover image.'
      );

    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!validateDetails()) return;

    try {
      const parsedExp = parseInt(detailsForm.experience, 10);
      const experienceValue = isNaN(parsedExp) ? null : parsedExp;

      const updatedProfile = {
        ...profile,
        ...detailsForm,
        fullName: detailsForm.name,
        name: detailsForm.name,
        experience: experienceValue
      };
      await artisanProfileService.updateProfile(updatedProfile);
      
      // Propagate changes to parent/navbar context
      if (onProfileUpdate) {
        onProfileUpdate(detailsForm.name, user?.email || profile.email);
      }
      
      // Reload profile from backend to ensure changes reflect immediately
      await loadProfile();
      setIsEditingDetails(false);
    } catch (err) {
      console.error('Error saving details:', err);
    }
  };

  const handleSaveStory = async (e) => {
    e.preventDefault();
    if (!validateStory()) return;

    try {
      const updatedProfile = {
        ...profile,
        ...storyForm
      };
      await artisanProfileService.updateProfile(updatedProfile);
      
      // Reload profile from backend to ensure changes reflect immediately
      await loadProfile();
      setIsEditingStory(false);
    } catch (err) {
      console.error('Error saving story:', err);
    }
  };

  const isFieldComplete = (field) => {
    return profile && profile[field] && String(profile[field]).trim() !== '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      <ArtisanNavbar user={user} onLogout={onLogout} />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        {/* Breadcrumbs */}
        <nav className="text-xs sm:text-sm text-gray-400 font-semibold mb-6 flex items-center space-x-2">
          <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => window.location.href = '/artisan/products'}>Artisan Portal</span>
          <span>&bull;</span>
          <span className="text-accent">Artisan Profile</span>
        </nav>

        {isLoading || !profile ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-400 text-sm">Loading artisan profile details...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">

            {/* 1. SECTIONED PROGRESS BAR & CHECKLIST */}
            <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-accent">Profile Completion</h2>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">Complete required fields to publish products on the marketplace</p>
                </div>
                <div className="flex items-center space-x-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl">
                  <span className="text-xl font-black text-primary font-sans">{getTotalCompletion()}%</span>
                  <span className="text-xs text-primary font-extrabold uppercase">Complete</span>
                </div>
              </div>

              {/* Sectioned progress segments */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { name: 'Personal', key: 'personal' },
                  { name: 'Location', key: 'location' },
                  { name: 'Craft', key: 'craft' },
                  { name: 'Story', key: 'story' }
                ].map((grp) => {
                  const pct = getGroupCompletion(grp.key);
                  return (
                    <div key={grp.key} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-500">
                        <span>{grp.name}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Checklist details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-gray-50 text-xs">
                {/* Personal */}
                <div className="space-y-2.5">
                  <h4 className="font-bold text-accent uppercase tracking-wider">Personal Info</h4>
                  <div className="space-y-2 font-semibold">
                    <div className="flex items-center space-x-2">
                      {isFieldComplete('avatar') ? (
                        <FiCheckCircle className="text-green-500 h-4 w-4 flex-shrink-0" />
                      ) : (
                        <FiAlertTriangle className="text-amber-500 h-4 w-4 flex-shrink-0" />
                      )}
                      <span className={isFieldComplete('avatar') ? 'text-gray-600' : 'text-gray-400'}>Profile Photo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isFieldComplete('phone') ? (
                        <FiCheckCircle className="text-green-500 h-4 w-4 flex-shrink-0" />
                      ) : (
                        <FiAlertTriangle className="text-amber-500 h-4 w-4 flex-shrink-0" />
                      )}
                      <span className={isFieldComplete('phone') ? 'text-gray-600' : 'text-gray-400'}>Phone Number</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2.5">
                  <h4 className="font-bold text-accent uppercase tracking-wider">Location Details</h4>
                  <div className="space-y-2 font-semibold">
                    <div className="flex items-center space-x-2">
                      {isFieldComplete('village') ? (
                        <FiCheckCircle className="text-green-500 h-4 w-4 flex-shrink-0" />
                      ) : (
                        <FiAlertTriangle className="text-amber-500 h-4 w-4 flex-shrink-0" />
                      )}
                      <span className={isFieldComplete('village') ? 'text-gray-600' : 'text-gray-400'}>Village Name</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isFieldComplete('district') ? (
                        <FiCheckCircle className="text-green-500 h-4 w-4 flex-shrink-0" />
                      ) : (
                        <FiAlertTriangle className="text-amber-500 h-4 w-4 flex-shrink-0" />
                      )}
                      <span className={isFieldComplete('district') ? 'text-gray-600' : 'text-gray-400'}>District</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isFieldComplete('state') ? (
                        <FiCheckCircle className="text-green-500 h-4 w-4 flex-shrink-0" />
                      ) : (
                        <FiAlertTriangle className="text-amber-500 h-4 w-4 flex-shrink-0" />
                      )}
                      <span className={isFieldComplete('state') ? 'text-gray-600' : 'text-gray-400'}>State</span>
                    </div>
                  </div>
                </div>

                {/* Craft */}
                <div className="space-y-2.5">
                  <h4 className="font-bold text-accent uppercase tracking-wider">Craft Details</h4>
                  <div className="space-y-2 font-semibold">
                    <div className="flex items-center space-x-2">
                      {isFieldComplete('category') ? (
                        <FiCheckCircle className="text-green-500 h-4 w-4 flex-shrink-0" />
                      ) : (
                        <FiAlertTriangle className="text-amber-500 h-4 w-4 flex-shrink-0" />
                      )}
                      <span className={isFieldComplete('category') ? 'text-gray-600' : 'text-gray-400'}>Craft Category</span>
                    </div>
                  </div>
                </div>

                {/* Story */}
                <div className="space-y-2.5">
                  <h4 className="font-bold text-accent uppercase tracking-wider">Story Section</h4>
                  <div className="space-y-2 font-semibold">
                    <div className="flex items-center space-x-2">
                      {isFieldComplete('storyTitle') ? (
                        <FiCheckCircle className="text-green-500 h-4 w-4 flex-shrink-0" />
                      ) : (
                        <FiAlertTriangle className="text-amber-500 h-4 w-4 flex-shrink-0" />
                      )}
                      <span className={isFieldComplete('storyTitle') ? 'text-gray-600' : 'text-gray-400'}>Story Title</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isFieldComplete('storyDescription') ? (
                        <FiCheckCircle className="text-green-500 h-4 w-4 flex-shrink-0" />
                      ) : (
                        <FiAlertTriangle className="text-amber-500 h-4 w-4 flex-shrink-0" />
                      )}
                      <span className={isFieldComplete('storyDescription') ? 'text-gray-600' : 'text-gray-400'}>Narrative Description</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* PROFILE HEADER HERO CARD */}
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-150 shadow-sm relative">
              {/* Cover Photo */}
              <div className="h-44 sm:h-56 w-full bg-accent/10 relative">

                {profile.coverImage ? (

                  <img
                    src={profile.coverImage}
                    alt="Artisan Cover"
                    className="w-full h-full object-cover"
                  />

                ) : (

                  <div className="w-full h-full flex items-center justify-center text-accent/40 text-sm font-bold">
                    No cover image uploaded
                  </div>

                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>

              </div>

              {/* Header profile photo and details block */}
              <div className="px-6 pb-6 pt-0 sm:px-8 flex flex-col sm:flex-row items-center sm:items-end sm:space-x-6 -mt-10 sm:-mt-12 relative z-10 text-center sm:text-left">
                {/* Circular Profile Photo Avatar */}
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-secondary overflow-hidden border-4 border-white shadow-md transition-all duration-300">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full text-accent text-3xl sm:text-4xl font-extrabold flex items-center justify-center select-none bg-secondary">
                      {getInitials(profile.fullName || profile.name || user?.name)}
                    </div>
                  )}
                </div>

                <div className="mt-3 sm:mt-0 flex-grow pb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                    Rural Artisan Partner
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-accent mt-1.5 font-sans leading-tight">
                    {profile.fullName || profile.name || user?.name}
                  </h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="flex items-center">
                      <FiMapPin className="text-primary mr-1" />
                      {profile.village ? `${profile.village}, ${profile.state}` : 'Address incomplete'}
                    </span>
                    {profile.email && (
                      <>
                        <span className="text-gray-300 hidden sm:inline">&bull;</span>
                        <span className="flex items-center">
                          <FiMail className="text-primary mr-1" />
                          {profile.email}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="mt-4 sm:mt-0 pb-1">
                  <button
                    onClick={() => {
                      setDetailsForm({
                        name: profile.fullName || profile.name || user?.name || '',
                        phone: profile.phone || '',
                        village: profile.village || '',
                        district: profile.district || '',
                        state: profile.state || '',
                        pincode: profile.pincode || '',
                        category: profile.category || '',
                        experience: profile.experience !== undefined && profile.experience !== null ? String(profile.experience) : '',
                        avatar: profile.avatar || ''
                      });
                      setDetailsErrors({});
                      setIsEditingDetails(true);
                    }}
                    className="px-5 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-full font-bold text-xs shadow-sm transition-all duration-300 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <FiEdit2 className="h-3 w-3" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TWO COLUMN GRID DETAILS & STORY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* LEFT COLUMN: Profile Details Form Card (7 col) */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-150 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-accent font-sans flex items-center">
                    <FiUser className="mr-2 text-primary" /> Artisan Information
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">Primary contact info, craft category, and location coordinates</p>
                </div>

                {isEditingDetails ? (
                  <form onSubmit={handleSaveDetails} className="space-y-4">

                    {/* AVATAR UPLOADER */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Profile Photo</label>
                      <div className="space-y-3">

                        <div className="flex items-center space-x-4">

                          <div className="w-20 h-20 rounded-full overflow-hidden bg-secondary border border-gray-200 flex-shrink-0">

                            {detailsForm.avatar ? (

                              <img
                                src={detailsForm.avatar}
                                alt="Profile preview"
                                className="w-full h-full object-cover"
                              />

                            ) : (

                              <div className="w-full h-full flex items-center justify-center text-accent font-bold text-xl">
                                {getInitials(detailsForm.name)}
                              </div>

                            )}

                          </div>


                          <label
                            className={`
        px-4
        py-2
        rounded-full
        bg-primary
        hover:bg-primary-hover
        text-white
        text-xs
        font-bold
        cursor-pointer
        flex
        items-center
        space-x-2
        ${isUploadingAvatar
                                ? 'opacity-50 pointer-events-none'
                                : ''}
      `}
                          >

                            <FiCamera className="h-4 w-4" />

                            <span>
                              {isUploadingAvatar
                                ? 'Uploading...'
                                : 'Choose Photo'}
                            </span>

                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              disabled={isUploadingAvatar}
                              onChange={(e) => {
                                handleAvatarUpload(
                                  e.target.files?.[0]
                                );

                                e.target.value = '';
                              }}
                              className="hidden"
                            />

                          </label>

                        </div>


                        {avatarUploadError && (
                          <p className="text-red-500 text-[10px] font-semibold">
                            {avatarUploadError}
                          </p>
                        )}


                        {detailsErrors.avatar && (
                          <p className="text-red-500 text-[10px] font-semibold">
                            {detailsErrors.avatar}
                          </p>
                        )}

                      </div>
                      {detailsErrors.avatar && <p className="text-red-500 text-[10px] mt-1 font-semibold">{detailsErrors.avatar}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* Name */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={detailsForm.name}
                          onChange={(e) => setDetailsForm({ ...detailsForm, name: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${detailsErrors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                            }`}
                        />
                        {detailsErrors.name && <p className="text-red-500 text-[10px] mt-1 font-semibold">{detailsErrors.name}</p>}
                      </div>

                      {/* Craft Category */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Craft Category</label>
                        <input
                          type="text"
                          value={detailsForm.category}
                          onChange={(e) => setDetailsForm({ ...detailsForm, category: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${detailsErrors.category ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                            }`}
                          placeholder="e.g. Pottery, Woodwork"
                        />
                        {detailsErrors.category && <p className="text-red-500 text-[10px] mt-1 font-semibold">{detailsErrors.category}</p>}
                      </div>

                      {/* Email - removed from edit form as it can't be changed */}

                      {/* Phone */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-sm font-semibold select-none">+91</span>
                          <input
                            type="text"
                            maxLength="10"
                            value={detailsForm.phone}
                            onChange={(e) => setDetailsForm({ ...detailsForm, phone: e.target.value.replace(/\D/g, '') })}
                            className={`w-full pl-11 pr-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${detailsErrors.phone ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                              }`}
                          />
                        </div>
                        {detailsErrors.phone && <p className="text-red-500 text-[10px] mt-1 font-semibold">{detailsErrors.phone}</p>}
                      </div>

                      {/* Experience */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Years of Experience</label>
                        <input
                          type="text"
                          value={detailsForm.experience}
                          onChange={(e) => setDetailsForm({ ...detailsForm, experience: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder="e.g. 15 Years, 5 Years"
                        />
                      </div>


                      {/* Village */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Village / Locality</label>
                        <input
                          type="text"
                          value={detailsForm.village}
                          onChange={(e) => setDetailsForm({ ...detailsForm, village: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${detailsErrors.village ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                            }`}
                        />
                        {detailsErrors.village && <p className="text-red-500 text-[10px] mt-1 font-semibold">{detailsErrors.village}</p>}
                      </div>

                      {/* District */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">District</label>
                        <input
                          type="text"
                          value={detailsForm.district}
                          onChange={(e) => setDetailsForm({ ...detailsForm, district: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${detailsErrors.district ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                            }`}
                        />
                        {detailsErrors.district && <p className="text-red-500 text-[10px] mt-1 font-semibold">{detailsErrors.district}</p>}
                      </div>

                      {/* State */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">State</label>
                        <input
                          type="text"
                          value={detailsForm.state}
                          onChange={(e) => setDetailsForm({ ...detailsForm, state: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${detailsErrors.state ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                            }`}
                        />
                        {detailsErrors.state && <p className="text-red-500 text-[10px] mt-1 font-semibold">{detailsErrors.state}</p>}
                      </div>

                      {/* Pincode */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Pincode</label>
                        <input
                          type="text"
                          maxLength="6"
                          value={detailsForm.pincode}
                          onChange={(e) => setDetailsForm({ ...detailsForm, pincode: e.target.value.replace(/\D/g, '') })}
                          className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${detailsErrors.pincode ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                            }`}
                        />
                        {detailsErrors.pincode && <p className="text-red-500 text-[10px] mt-1 font-semibold">{detailsErrors.pincode}</p>}
                      </div>

                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-gray-50">
                      <button
                        type="submit"
                        disabled={isUploadingAvatar}
                        className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-full font-bold text-xs transition-all shadow hover:shadow-md cursor-pointer flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiCheck className="h-4 w-4" />

                        <span>
                          {isUploadingAvatar
                            ? 'Uploading Photo...'
                            : 'Save Changes'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingDetails(false)}
                        className="px-5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-full font-bold text-xs transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Read Only Information cards grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                    <div className="space-y-1 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</span>
                      <p className="font-bold text-gray-800">{profile.fullName || profile.name || user?.name}</p>
                    </div>
                    <div className="space-y-1 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Craft Specialty</span>
                      <p className="font-bold text-primary">{profile.category || 'Not set'}</p>
                    </div>
                    <div className="space-y-1 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Years of Experience</span>
                      <p className="font-bold text-gray-800">{displayExperience(profile.experience)}</p>
                    </div>
                    <div className="space-y-1 p-4 rounded-xl bg-gray-50 border border-gray-100 min-w-0 overflow-hidden">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</span>
                      <p className="font-bold text-gray-800 text-xs sm:text-sm truncate" title={profile.email}>{profile.email}</p>
                    </div>
                    <div className="space-y-1 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</span>
                      <p className="font-bold text-gray-800">{profile.phone ? `+91 ${profile.phone}` : 'Not set'}</p>
                    </div>
                    <div className="space-y-1 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pincode</span>
                      <p className="font-bold text-gray-800">{profile.pincode || 'Not set'}</p>
                    </div>
                    <div className="sm:col-span-2 space-y-1.5 p-4 rounded-xl bg-gray-50 border border-gray-100 leading-relaxed">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Village Coordinates</span>
                      <p className="font-bold text-gray-800">
                        {profile.village ? `${profile.village}, Dist. ${profile.district}, ${profile.state}` : 'Not set'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Artisan Story "My Story" (5 col) */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-150 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-accent font-sans flex items-center">
                    <FiBookOpen className="mr-2 text-primary" /> My Story
                  </h3>
                  {!isEditingStory && (
                    <button
                      onClick={() => {
                        setStoryForm({
                          storyTitle: profile.storyTitle || '',
                          storyDescription: profile.storyDescription || '',
                          coverImage: profile.coverImage || ''
                        });
                        setStoryErrors({});
                        setIsEditingStory(true);
                      }}
                      className="text-xs font-bold text-primary hover:text-primary-hover flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      <FiEdit2 className="h-3 w-3" />
                      <span>Edit Story</span>
                    </button>
                  )}
                </div>

                {isEditingStory ? (
                  <form onSubmit={handleSaveStory} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Story Title</label>
                      <input
                        type="text"
                        value={storyForm.storyTitle}
                        onChange={(e) => setStoryForm({ ...storyForm, storyTitle: e.target.value })}
                        className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${storyErrors.storyTitle ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                          }`}
                        placeholder="e.g. Clay Pottery for Three Generations"
                      />
                      {storyErrors.storyTitle && <p className="text-red-500 text-[10px] mt-1 font-semibold">{storyErrors.storyTitle}</p>}
                    </div>

                    {/* COVER IMAGE UPLOADER */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Story Cover Image</label>
                      <div className="space-y-3">

                        <div className="w-full h-40 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">

                          {storyForm.coverImage ? (

                            <img
                              src={storyForm.coverImage}
                              alt="Cover preview"
                              className="w-full h-full object-cover"
                            />

                          ) : (

                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-semibold">
                              No cover image selected
                            </div>

                          )}

                        </div>


                        <label
                          className={`
      inline-flex
      px-4
      py-2
      rounded-full
      bg-primary
      hover:bg-primary-hover
      text-white
      text-xs
      font-bold
      cursor-pointer
      items-center
      space-x-2
      ${isUploadingCover
                              ? 'opacity-50 pointer-events-none'
                              : ''}
    `}
                        >

                          <FiCamera className="h-4 w-4" />

                          <span>
                            {isUploadingCover
                              ? 'Uploading...'
                              : 'Choose Cover Image'}
                          </span>

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={isUploadingCover}
                            onChange={(e) => {
                              handleCoverUpload(
                                e.target.files?.[0]
                              );

                              e.target.value = '';
                            }}
                            className="hidden"
                          />

                        </label>


                        {coverUploadError && (
                          <p className="text-red-500 text-[10px] font-semibold">
                            {coverUploadError}
                          </p>
                        )}

                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Artisan Narrative</label>
                      <textarea
                        rows="6"
                        value={storyForm.storyDescription}
                        onChange={(e) => setStoryForm({ ...storyForm, storyDescription: e.target.value })}
                        className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${storyErrors.storyDescription ? 'border-red-300 focus:ring-red-200' : 'border-gray-250 focus:ring-primary/20 focus:border-primary'
                          }`}
                        placeholder="Tell buyers about your background, family heritage, and tools..."
                      />
                      {storyErrors.storyDescription && <p className="text-red-500 text-[10px] mt-1 font-semibold">{storyErrors.storyDescription}</p>}
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        type="submit"
                        disabled={isUploadingCover}
                        className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-full font-bold text-xs transition-all shadow hover:shadow-md cursor-pointer flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiCheck className="h-4 w-4" />

                        <span>
                          {isUploadingCover
                            ? 'Uploading Cover...'
                            : 'Save Story'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingStory(false)}
                        className="px-5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-full font-bold text-xs transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Story Display Card layout */
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-accent text-md sm:text-lg leading-tight font-sans">
                      "{profile.storyTitle || 'Our Artisan Narrative'}"
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100 whitespace-pre-line">
                      {profile.storyDescription || 'No narrative story shared yet. Click edit story to write details about your crafting heritage.'}
                    </p>
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

export default ArtisanProfile;

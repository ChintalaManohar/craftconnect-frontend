import axios from 'axios';

// Environment variables for Cloudinary configuration
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

// Allowed extensions
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes

/**
 * Validates a file for type and size constraints.
 * @param {File} file 
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateImage = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Check file extension
  const extension = file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Unsupported file type (.${extension}). Only .jpg, .jpeg, .png, and .webp files are allowed.`
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File is too large (${sizeInMB} MB). Maximum size allowed is 5 MB.`
    };
  }

  return { valid: true };
};

/**
 * Uploads an image to Cloudinary using unsigned upload.
 * If credentials are not present, simulates a progress upload and returns a beautiful Unsplash URL.
 * @param {File} file 
 * @param {function(number)} onProgress - Callback receiving progress percentage (0-100)
 * @param {string} [contextType] - Optional context description (e.g. 'avatar', 'cover', 'product') to customize fallback images
 * @returns {Promise<string>} Resolves to the Cloudinary URL
 */
export const uploadImage = async (file, onProgress = () => {}, contextType = 'product') => {
  // Validate first
  const validation = validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // If credentials are NOT configured, use mock upload simulation
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.warn('VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET is missing. Using simulated upload service.');
    return simulateMockUpload(file, onProgress, contextType);
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      },
    });

    if (response.data && response.data.secure_url) {
      return response.data.secure_url;
    } else {
      throw new Error('Upload succeeded, but Cloudinary did not return a secure URL.');
    }
  } catch (error) {
    console.error('Cloudinary real upload failed:', error);
    throw error;
  }
};

/**
 * Simulates a file upload progress timer and returns a high-quality persistent Unsplash URL.
 */
const simulateMockUpload = async (file, onProgress, contextType) => {
  // Simulate steps of progress: 10%, 40%, 75%, 100% over 1.2 seconds
  const steps = [10, 40, 75, 100];
  for (const step of steps) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    onProgress(step);
  }

  // Generate a premium Unsplash URL based on the context type so it displays appropriately
  let fallbackUrl = '';
  const randNum = Math.floor(Math.random() * 1000);

  if (contextType === 'avatar') {
    // Beautiful human avatars
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80'
    ];
    fallbackUrl = avatars[randNum % avatars.length];
  } else if (contextType === 'cover') {
    // Beautiful cover or scenery photos
    const covers = [
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1561715276-a2d087060f1d?w=1200&auto=format&fit=crop&q=80'
    ];
    fallbackUrl = covers[randNum % covers.length];
  } else {
    // Product craft imagery fallbacks
    const products = [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80', // pottery / craft
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80', // decor
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop&q=80', // painting
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80', // textiles
      'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=800&auto=format&fit=crop&q=80'  // woodwork
    ];
    fallbackUrl = products[randNum % products.length];
  }

  // Append a query param to guarantee uniqueness and bypass caches
  return `${fallbackUrl}&sig=${randNum}`;
};

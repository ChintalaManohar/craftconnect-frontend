import React, { useState, useRef } from 'react';
import { FiUploadCloud, FiTrash2, FiRefreshCw, FiAlertCircle, FiImage, FiPlus, FiX } from 'react-icons/fi';
import { validateImage, uploadImage } from '../services/cloudinary';

/**
 * Reusable premium image uploader component with drag-and-drop capability, progress tracking, and validation warnings.
 * 
 * @param {object} props
 * @param {string|string[]} props.value - Single URL string or array of URL strings
 * @param {function} props.onChange - Callback triggered with updated value(s)
 * @param {number} [props.maxFiles=1] - Maximum allowed files (e.g., up to 4 for products)
 * @param {string} [props.contextType='product'] - Context used for mock placeholders ('avatar'|'cover'|'product')
 * @param {string} [props.label] - Custom upload helper text
 */
function ImageUploader({ value, onChange, maxFiles = 1, contextType = 'product', label }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const isMulti = maxFiles > 1;
  
  // Format current files list
  const currentImages = isMulti 
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : (value ? [value] : []);

  const triggerSelect = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFile = async (file) => {
    setErrorMsg('');
    
    // Check validation rules
    const validation = validateImage(file);
    if (!validation.valid) {
      setErrorMsg(validation.error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedUrl = await uploadImage(
        file, 
        (progress) => setUploadProgress(progress), 
        contextType
      );

      if (isMulti) {
        const updated = [...currentImages, uploadedUrl].slice(0, maxFiles);
        onChange(updated);
      } else {
        onChange(uploadedUrl);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
    // Reset file input so same file can be selected again if replaced
    e.target.value = '';
  };

  // Drag-and-Drop handlers
  const onDragOver = (e) => {
    e.preventDefault();
    if (isUploading) return;
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Action methods
  const handleRemove = (indexToRemove) => {
    if (isUploading) return;
    if (isMulti) {
      const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
      onChange(updated);
    } else {
      onChange('');
    }
  };

  const handleReplace = (indexToReplace) => {
    if (isUploading) return;
    // For simplicity, we trigger file input selection.
    // If it's multi-file replace, we remove that item first, then trigger select
    if (isMulti) {
      const updated = currentImages.filter((_, idx) => idx !== indexToReplace);
      onChange(updated);
    }
    triggerSelect();
  };

  const limitReached = currentImages.length >= maxFiles;

  return (
    <div className="w-full space-y-4">
      {/* Upload Zone */}
      {!limitReached && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={triggerSelect}
          className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
            isDragging 
              ? 'border-primary bg-primary/5 scale-102 shadow-md ring-4 ring-primary/10' 
              : 'border-gray-250 bg-gray-50/50 hover:bg-gray-50 hover:border-primary/50'
          } ${isUploading ? 'pointer-events-none opacity-90' : ''}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileInputChange}
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center space-y-3 w-full py-2">
              <FiRefreshCw className="animate-spin text-primary h-8 w-8" />
              <div className="w-full max-w-[200px] bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-accent">
                Uploading Image... {uploadProgress}%
              </span>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              <div className="p-3 bg-white rounded-full shadow-sm text-primary inline-block transition-transform duration-300 hover:scale-110">
                <FiUploadCloud className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-accent">
                  Drag and drop your image here, or <span className="text-primary hover:underline">browse</span>
                </p>
                <p className="text-xs text-gray-400 font-semibold mt-1">
                  Supports JPG, JPEG, PNG, or WEBP (Max 5 MB)
                </p>
                {label && (
                  <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
                    {label}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation Warning Area */}
      {errorMsg && (
        <div className="flex items-center space-x-2 bg-red-50 border border-red-200/50 p-3.5 rounded-xl text-red-600 text-xs font-bold animate-shake">
          <FiAlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
          <span className="flex-grow">{errorMsg}</span>
          <button 
            type="button" 
            onClick={() => setErrorMsg('')} 
            className="p-0.5 rounded-full hover:bg-red-100 text-red-400 hover:text-red-700 transition-colors"
          >
            <FiX className="h-4.5 w-4.5" />
          </button>
        </div>
      )}

      {/* Preview Section */}
      {currentImages.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-accent uppercase tracking-wider">
            Uploaded Previews {isMulti && `(${currentImages.length} of ${maxFiles})`}
          </p>
          <div className={`grid gap-4 ${isMulti ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1'}`}>
            {currentImages.map((imgUrl, index) => (
              <div 
                key={index}
                className="relative bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm group aspect-square flex flex-col justify-end"
              >
                {/* Real Preview Image */}
                <img 
                  src={imgUrl} 
                  alt={`Preview ${index + 1}`} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                />

                {/* Glassmorphic Overlay Buttons */}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2.5 backdrop-blur-[2px]">
                  <button
                    type="button"
                    onClick={() => handleReplace(index)}
                    className="p-2 bg-white/95 hover:bg-white text-gray-700 hover:text-primary rounded-full shadow transition-all duration-200 cursor-pointer"
                    title="Replace Image"
                  >
                    <FiRefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-2 bg-white/95 hover:bg-white text-red-500 hover:text-red-700 rounded-full shadow transition-all duration-200 cursor-pointer"
                    title="Remove Image"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Badge Number for Multi uploads */}
                {isMulti && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-extrabold text-white">
                    Image {index + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;

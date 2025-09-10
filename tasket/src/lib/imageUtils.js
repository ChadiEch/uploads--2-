/**
 * Utility functions for handling employee images consistently across the application
 */

/**
 * Constructs a full URL for an employee photo
 * @param {string} photoPath - The photo path from the database (e.g., '/uploads/photo.jpg')
 * @returns {string} Full URL to the photo or path to default avatar
 */
export const getEmployeePhotoUrl = (photoPath) => {
  // If no photo path, return default avatar
  if (!photoPath) {
    return '/default-avatar.png';
  }
  
  // If it's already a full URL, return as is
  if (photoPath.startsWith('http')) {
    return photoPath;
  }
  
  // If it's a data URL (base64), return as is
  if (photoPath.startsWith('data:')) {
    return photoPath;
  }
  
  // If it's a local path, construct full URL
  if (photoPath.startsWith('/')) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    // Remove /api from baseUrl if present to get the server root
    const serverBaseUrl = baseUrl.replace('/api', '');
    return `${serverBaseUrl}${photoPath}`;
  }
  
  // For any other case, return the path as is with default fallback
  return photoPath || '/default-avatar.png';
};

/**
 * Handles image loading errors with proper fallback
 * @param {Event} event - The error event
 * @param {Function} setSrc - Function to set the image source
 */
export const handleImageError = (event, setSrc) => {
  // Prevent infinite loop by removing the error handler
  event.target.onerror = null;
  // Set fallback image
  if (setSrc) {
    setSrc('/default-avatar.png');
  } else {
    event.target.src = '/default-avatar.png';
  }
};

/**
 * Creates a preview URL for uploaded files and handles cleanup
 * @param {File} file - The file to create a preview for
 * @returns {string} Object URL for the file
 */
export const createImagePreviewUrl = (file) => {
  if (!file || !file.type.startsWith('image/')) {
    return '/default-avatar.png';
  }
  return URL.createObjectURL(file);
};

/**
 * Cleans up a preview URL created with createImagePreviewUrl
 * @param {string} url - The URL to revoke
 */
export const cleanupImagePreviewUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
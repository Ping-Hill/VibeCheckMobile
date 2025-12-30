// S3 bucket URL for images
const S3_BUCKET_URL = 'https://vibecheck-nyc-images.s3.us-east-1.amazonaws.com';

/**
 * Get the full S3 URL for an image filename
 * @param {string} filename - The image filename
 * @returns {string|null} - The full S3 URL or null if no filename
 */
export const getImageUrl = (filename) => {
  if (!filename) return null;
  return `${S3_BUCKET_URL}/${filename}`;
};

/**
 * Get a placeholder image URI for fallback
 * @returns {string} - Data URI for a placeholder image
 */
export const getPlaceholderImage = () => {
  // You can return a local placeholder or a data URI
  return null; // Will trigger Image component's default behavior
};

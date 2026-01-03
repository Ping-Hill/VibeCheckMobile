import axios from 'axios';

// Update this with your Railway URL once deployed
const API_URL = 'https://web-production-c67df.up.railway.app';

export const searchRestaurants = async (query, searchType = 'text') => {
  try {
    const response = await axios.post(`${API_URL}/api/search`, {
      query,
      search_type: searchType,
      k: 50, // Number of results
    }, {
      timeout: 30000, // 30 second timeout
    });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getRestaurantDetails = async (restaurantId) => {
  try {
    const response = await axios.get(`${API_URL}/api/restaurant/${restaurantId}`, {
      timeout: 30000, // 30 second timeout
    });
    return response.data;
  } catch (error) {
    console.error('Restaurant details error:', error);
    throw error;
  }
};

export const getImageUrl = (filename) => {
  if (!filename) return null;
  // Use S3 bucket directly (images are in /images subdirectory)
  return `https://vibecheck-nyc-images.s3.us-east-1.amazonaws.com/images/${filename}`;
};

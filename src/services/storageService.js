import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  USER_RATINGS: 'beanio_user_ratings',
  SCANNED_BEANS: 'beanio_scanned_beans',
  USER_PROFILE: 'beanio_user_profile',
  APP_SETTINGS: 'beanio_app_settings',
};

/**
 * Save a coffee bean rating
 * @param {string} beanId - Unique identifier for the coffee bean
 * @param {Object} ratingData - Rating data including stars, notes, etc.
 */
export const saveRating = async (beanId, ratingData) => {
  try {
    // Get existing ratings
    const existingRatingsStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_RATINGS);
    const existingRatings = existingRatingsStr ? JSON.parse(existingRatingsStr) : {};
    
    // Add timestamp to the rating
    const ratingWithTimestamp = {
      ...ratingData,
      timestamp: new Date().toISOString(),
    };
    
    // Update ratings
    const updatedRatings = {
      ...existingRatings,
      [beanId]: ratingWithTimestamp,
    };
    
    // Save updated ratings
    await AsyncStorage.setItem(STORAGE_KEYS.USER_RATINGS, JSON.stringify(updatedRatings));
    
    return true;
  } catch (error) {
    console.error('Error saving rating:', error);
    return false;
  }
};

/**
 * Get a user's rating for a specific coffee bean
 * @param {string} beanId - Unique identifier for the coffee bean
 * @returns {Object|null} - Rating data or null if not rated
 */
export const getRating = async (beanId) => {
  try {
    const ratingsStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_RATINGS);
    if (!ratingsStr) return null;
    
    const ratings = JSON.parse(ratingsStr);
    return ratings[beanId] || null;
  } catch (error) {
    console.error('Error getting rating:', error);
    return null;
  }
};

/**
 * Get all user ratings
 * @returns {Object} - All user ratings
 */
export const getAllRatings = async () => {
  try {
    const ratingsStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_RATINGS);
    return ratingsStr ? JSON.parse(ratingsStr) : {};
  } catch (error) {
    console.error('Error getting all ratings:', error);
    return {};
  }
};

/**
 * Save scanned bean information
 * @param {Object} beanInfo - Information about the scanned coffee bean
 * @returns {string} - Generated bean ID
 */
export const saveBeanInfo = async (beanInfo) => {
  try {
    // Generate a unique ID for the bean
    const beanId = generateBeanId(beanInfo);
    
    // Get existing scanned beans
    const existingBeansStr = await AsyncStorage.getItem(STORAGE_KEYS.SCANNED_BEANS);
    const existingBeans = existingBeansStr ? JSON.parse(existingBeansStr) : {};
    
    // Add timestamp and ID to bean info
    const beanInfoWithMetadata = {
      ...beanInfo,
      id: beanId,
      scannedAt: new Date().toISOString(),
    };
    
    // Update scanned beans
    const updatedBeans = {
      ...existingBeans,
      [beanId]: beanInfoWithMetadata,
    };
    
    // Save updated scanned beans
    await AsyncStorage.setItem(STORAGE_KEYS.SCANNED_BEANS, JSON.stringify(updatedBeans));
    
    return beanId;
  } catch (error) {
    console.error('Error saving bean info:', error);
    throw error;
  }
};

/**
 * Get information about a specific coffee bean
 * @param {string} beanId - Unique identifier for the coffee bean
 * @returns {Object|null} - Bean information or null if not found
 */
export const getBeanInfo = async (beanId) => {
  try {
    const beansStr = await AsyncStorage.getItem(STORAGE_KEYS.SCANNED_BEANS);
    if (!beansStr) return null;
    
    const beans = JSON.parse(beansStr);
    return beans[beanId] || null;
  } catch (error) {
    console.error('Error getting bean info:', error);
    return null;
  }
};

/**
 * Get all scanned beans
 * @returns {Object} - All scanned beans
 */
export const getAllBeans = async () => {
  try {
    const beansStr = await AsyncStorage.getItem(STORAGE_KEYS.SCANNED_BEANS);
    return beansStr ? JSON.parse(beansStr) : {};
  } catch (error) {
    console.error('Error getting all beans:', error);
    return {};
  }
};

/**
 * Generate a unique ID for a coffee bean
 * @param {Object} beanInfo - Information about the coffee bean
 * @returns {string} - Unique ID
 */
const generateBeanId = (beanInfo) => {
  const { beanName, roaster } = beanInfo;
  const baseString = `${beanName}-${roaster}-${Date.now()}`;
  return baseString
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export default {
  saveRating,
  getRating,
  getAllRatings,
  saveBeanInfo,
  getBeanInfo,
  getAllBeans,
};

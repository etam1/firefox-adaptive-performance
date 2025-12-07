/**
 * Service for accessing cached data from the background script
 * Provides fast access to tab data, resources, scores, and suggestions
 */

/**
 * Get cached data from background script
 * @returns {Promise<Object>} Cached data object
 */
export async function getCachedData() {
  try {
    const response = await browser.runtime.sendMessage({
      type: 'getCachedData',
    });
    return response;
  } catch (error) {
    console.error('Error getting cached data:', error);
    // Return empty cache structure on error
    return {
      tabs: {},
      resourceUsage: {},
      scores: {},
      suggestions: {},
      lastUpdate: 0,
      isExpired: true,
    };
  }
}

/**
 * Force a cache update in the background script
 * @returns {Promise<Object>} Updated cache data
 */
export async function forceCacheUpdate() {
  try {
    const response = await browser.runtime.sendMessage({
      type: 'forceCacheUpdate',
    });
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Cache update failed');
    }
  } catch (error) {
    console.error('Error forcing cache update:', error);
    throw error;
  }
}

/**
 * Check if cached data is fresh enough
 * @param {number} maxAge - Maximum age in milliseconds (default: 5000ms)
 * @returns {Promise<boolean>} True if cache is fresh
 */
export async function isCacheFresh(maxAge = 5000) {
  try {
    const cached = await getCachedData();
    const age = Date.now() - cached.lastUpdate;
    return age < maxAge && !cached.isExpired;
  } catch (error) {
    return false;
  }
}


/**
 * Service for interacting with Firefox browser tabs API
 */

/**
 * Get all tabs in the current window
 * @returns {Promise<Array>} Array of tab objects
 */
export async function getAllTabs() {
  try {
    // Get current window
    const currentWindow = await browser.windows.getCurrent();
    
    // Get all tabs in the current window
    const tabs = await browser.tabs.query({
      windowId: currentWindow.id
    });
    
    return tabs;
  } catch (error) {
    console.error('Error fetching tabs:', error);
    throw error;
  }
}

/**
 * Get all tabs across all windows
 * @returns {Promise<Array>} Array of tab objects
 */
export async function getAllTabsAllWindows() {
  try {
    const tabs = await browser.tabs.query({});
    return tabs;
  } catch (error) {
    console.error('Error fetching all tabs:', error);
    throw error;
  }
}

/**
 * Get a specific tab by ID
 * @param {number} tabId - The ID of the tab
 * @returns {Promise<Object>} Tab object
 */
export async function getTabById(tabId) {
  try {
    const tab = await browser.tabs.get(tabId);
    return tab;
  } catch (error) {
    console.error('Error fetching tab:', error);
    throw error;
  }
}

/**
 * Activate a tab (bring it to focus)
 * @param {number} tabId - The ID of the tab to activate
 */
export async function activateTab(tabId) {
  try {
    await browser.tabs.update(tabId, { active: true });
  } catch (error) {
    console.error('Error activating tab:', error);
    throw error;
  }
}

/**
 * Close a tab
 * @param {number} tabId - The ID of the tab to close
 */
export async function closeTab(tabId) {
  try {
    await browser.tabs.remove(tabId);
  } catch (error) {
    console.error('Error closing tab:', error);
    throw error;
  }
}


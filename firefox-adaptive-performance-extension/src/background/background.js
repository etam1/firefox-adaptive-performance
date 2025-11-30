/**
 * Background script for Firefox Adaptive Performance Extension
 * Handles polling, caching, and event management
 */

import { getResourceUsage } from '../services/resourceUsageService.js';
import { computeTabScore } from '../services/scoringService.js';
import { getOptimizationSuggestions } from '../services/optimizationService.js';

// Cache for tab data (speeds up frontend loading)
const tabDataCache = {
  tabs: {},
  resourceUsage: {},
  scores: {},
  suggestions: {},
  lastUpdate: 0,
  cacheTTL: 5000, // 5 seconds cache TTL
};

// Polling interval (milliseconds)
const POLLING_INTERVAL = 3000; // Poll every 3 seconds

// Event listeners storage
const eventListeners = {
  tabUpdated: [],
  tabCreated: [],
  tabRemoved: [],
  resourceUpdated: [],
  scoreUpdated: [],
};

/**
 * Simple Event Emitter functionality
 */
const eventEmitter = {
  on(event, callback) {
    if (eventListeners[event]) {
      eventListeners[event].push(callback);
    }
  },

  off(event, callback) {
    if (eventListeners[event]) {
      eventListeners[event] = eventListeners[event].filter(cb => cb !== callback);
    }
  },

  emit(event, data) {
    if (eventListeners[event]) {
      eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  },
};

/**
 * Update cache with fresh tab data
 */
async function updateCache() {
  try {
    // Import services dynamically to avoid issues in background script context
    const tabs = await browser.tabs.query({});
    
    // Update tabs cache
    tabs.forEach(tab => {
      tabDataCache.tabs[tab.id] = {
        id: tab.id,
        title: tab.title,
        url: tab.url,
        active: tab.active,
        pinned: tab.pinned,
        audible: tab.audible,
        discarded: tab.discarded,
        favIconUrl: tab.favIconUrl,
      };
    });

    // Get resource usage and scores for all tabs (in batches to avoid overwhelming)
    const tabIds = tabs.map(tab => tab.id);
    
    // Process tabs in batches of 5 to avoid performance issues
    const batchSize = 5;
    for (let i = 0; i < tabIds.length; i += batchSize) {
      const batch = tabIds.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (tabId) => {
          try {
            const resourceUsage = await getResourceUsage(tabId);
            const score = await computeTabScore(tabId);
            const suggestions = await getOptimizationSuggestions(tabId);

            tabDataCache.resourceUsage[tabId] = resourceUsage;
            tabDataCache.scores[tabId] = score;
            tabDataCache.suggestions[tabId] = suggestions;

            // Emit events for updates
            eventEmitter.emit('resourceUpdated', { tabId, resourceUsage });
            eventEmitter.emit('scoreUpdated', { tabId, score });
          } catch (error) {
            console.error(`Error updating cache for tab ${tabId}:`, error);
          }
        })
      );
    }

    tabDataCache.lastUpdate = Date.now();
    console.log(`Cache updated at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error updating cache:', error);
  }
}

/**
 * Start background polling loop
 */
function startPolling() {
  console.log('Starting background polling...');
  
  // Initial cache update
  updateCache();
  
  // Set up interval polling
  setInterval(() => {
    updateCache();
  }, POLLING_INTERVAL);
}

/**
 * Get cached data
 */
function getCachedData() {
  // Check if cache is still valid
  const isExpired = Date.now() - tabDataCache.lastUpdate > tabDataCache.cacheTTL;
  
  if (isExpired) {
    // Cache expired, trigger update (async, don't wait)
    updateCache().catch(err => console.error('Background cache update failed:', err));
  }
  
  return {
    tabs: tabDataCache.tabs,
    resourceUsage: tabDataCache.resourceUsage,
    scores: tabDataCache.scores,
    suggestions: tabDataCache.suggestions,
    lastUpdate: tabDataCache.lastUpdate,
    isExpired,
  };
}

/**
 * Tab event handlers
 */

// Listen for tab updates
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.audible !== undefined || changeInfo.active !== undefined) {
    eventEmitter.emit('tabUpdated', { tabId, changeInfo, tab });
    
    // Update cache for this specific tab
    try {
      tabDataCache.resourceUsage[tabId] = await getResourceUsage(tabId);
      tabDataCache.scores[tabId] = await computeTabScore(tabId);
      tabDataCache.lastUpdate = Date.now();
    } catch (error) {
      console.error(`Error updating cache for tab ${tabId}:`, error);
    }
  }
});

// Listen for tab creation
browser.tabs.onCreated.addListener((tab) => {
  eventEmitter.emit('tabCreated', { tab });
  // Cache will be updated in next polling cycle
});

// Listen for tab removal
browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  // Clean up cache
  delete tabDataCache.tabs[tabId];
  delete tabDataCache.resourceUsage[tabId];
  delete tabDataCache.scores[tabId];
  delete tabDataCache.suggestions[tabId];
  
  eventEmitter.emit('tabRemoved', { tabId, removeInfo });
});

// Listen for tab activation
browser.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId;
  
  // Update cache for newly active tab
  try {
    tabDataCache.resourceUsage[tabId] = await getResourceUsage(tabId);
    tabDataCache.scores[tabId] = await computeTabScore(tabId);
  } catch (error) {
    console.error(`Error updating cache for active tab ${tabId}:`, error);
  }
});

/**
 * Message handler for communication with popup/frontend
 */
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getCachedData') {
    sendResponse(getCachedData());
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'forceCacheUpdate') {
    updateCache().then(() => {
      sendResponse({ success: true, data: getCachedData() });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'subscribeEvent') {
    eventEmitter.on(message.event, message.callback);
    sendResponse({ success: true });
    return true;
  }
  
  return false;
});

// Start the background polling when script loads
startPolling();

console.log('Background script initialized');


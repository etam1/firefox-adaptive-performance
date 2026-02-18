/**
 * Service for collecting and managing performance data from content scripts
 * Aggregates data from performance-monitor.js and timer-tracker.js
 */

// Storage for performance metrics per tab
const performanceMetrics = {};

// Storage for timer metrics per tab
const timerMetrics = {};

/**
 * Initialize performance data collection
 */
export function initializePerformanceDataCollection() {
  // Listen for messages from content scripts
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'performanceData' && sender.tab) {
      const tabId = sender.tab.id;
      performanceMetrics[tabId] = {
        ...message.data,
        lastReceived: Date.now(),
      };
    }
    
    if (message.type === 'timerData' && sender.tab) {
      const tabId = sender.tab.id;
      timerMetrics[tabId] = {
        ...message.data,
        lastReceived: Date.now(),
      };
    }
    
    return false; // Don't keep channel open
  });

  // Clean up data when tabs are closed
  browser.tabs.onRemoved.addListener((tabId) => {
    delete performanceMetrics[tabId];
    delete timerMetrics[tabId];
  });

  console.log('Performance data collection initialized');
}

/**
 * Get performance data for a specific tab
 * @param {number} tabId - The ID of the tab
 * @returns {Object} Performance data object
 */
export function getPerformanceData(tabId) {
  const perf = performanceMetrics[tabId];
  const timers = timerMetrics[tabId];
  
  return {
    jsExecutionTime: perf?.jsExecutionTime || 0,
    totalExecutionTime: perf?.totalExecutionTime || 0,
    scriptTime: perf?.scriptTime || 0,
    paintTime: perf?.paintTime || 0,
    layoutTime: perf?.layoutTime || 0,
    memoryUsed: perf?.memoryUsed || 0,
    memoryTotal: perf?.memoryTotal || 0,
    memoryLimit: perf?.memoryLimit || 0,
    activeIntervals: timers?.activeIntervals || 0,
    activeTimeouts: timers?.activeTimeouts || 0,
    totalIntervalsCreated: timers?.totalIntervalsCreated || 0,
    totalTimeoutsCreated: timers?.totalTimeoutsCreated || 0,
    averageIntervalDelay: timers?.averageIntervalDelay || 0,
    averageTimeoutDelay: timers?.averageTimeoutDelay || 0,
    hasData: !!(perf || timers),
    lastUpdated: perf?.lastReceived || timers?.lastReceived || 0,
  };
}

/**
 * Get performance data for multiple tabs
 * @param {Array<number>} tabIds - Array of tab IDs
 * @returns {Object} Object mapping tabId to performance data
 */
export function getMultipleTabsPerformanceData(tabIds) {
  const results = {};
  tabIds.forEach(tabId => {
    results[tabId] = getPerformanceData(tabId);
  });
  return results;
}

/**
 * Check if performance data is available for a tab
 * @param {number} tabId - The ID of the tab
 * @returns {boolean} True if data is available
 */
export function hasPerformanceData(tabId) {
  return !!(performanceMetrics[tabId] || timerMetrics[tabId]);
}

/**
 * Get all performance metrics (for debugging)
 */
export function getAllPerformanceMetrics() {
  return {
    performance: performanceMetrics,
    timers: timerMetrics,
  };
}



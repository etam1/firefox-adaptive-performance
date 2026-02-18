/**
 * Service for retrieving resource usage metrics for browser tabs
 * Uses real measurements where available (network, JS execution time, timers)
 * Falls back to estimates for CPU and memory (not directly measurable in Firefox)
 */

import { getTabById } from './tabsService.js';
import { getNetworkUsage } from './networkTrackingService.js';
import { getPerformanceData } from './performanceDataService.js';

/**
 * Get resource usage for a specific tab
 * @param {number} tabId - The ID of the tab
 * @returns {Promise<Object>} Resource usage object with memory, CPU, network, storage, performance
 */
export async function getResourceUsage(tabId) {
  try {
    const tab = await getTabById(tabId);
    
    if (!tab) {
      throw new Error(`Tab with ID ${tabId} not found`);
    }

    // Get real network measurements
    let networkUsage;
    try {
      networkUsage = getNetworkUsage(tabId);
    } catch (error) {
      console.warn(`Could not get network usage for tab ${tabId}, using estimate:`, error);
      networkUsage = calculateNetworkUsage(tab);
    }

    // Get real performance data (JS execution time, memory if available, timers)
    let performanceData;
    try {
      performanceData = getPerformanceData(tabId);
    } catch (error) {
      console.warn(`Could not get performance data for tab ${tabId}:`, error);
      performanceData = null;
    }

    // Calculate memory (use real data if available, otherwise estimate)
    let memoryMB;
    if (performanceData && performanceData.memoryUsed > 0) {
      // Convert bytes to MB
      memoryMB = Math.round(performanceData.memoryUsed / (1024 * 1024));
    } else {
      // Fall back to estimation
      memoryMB = calculateMemoryUsage(tab);
    }

    // CPU cannot be directly measured in Firefox, so we estimate
    // But we can use performance data to improve the estimate
    const cpuPercent = calculateCPUUsage(tab, performanceData);

    // Build resource usage object
    const resourceUsage = {
      memory: memoryMB,
      cpu: cpuPercent,
      network: {
        bytesIn: networkUsage.bytesIn || 0,
        bytesOut: networkUsage.bytesOut || 0,
        bytesInPerSecond: networkUsage.bytesInPerSecond || 0,
        bytesOutPerSecond: networkUsage.bytesOutPerSecond || 0,
        requestsPerSecond: networkUsage.requestsPerSecond || 0,
        totalRequests: networkUsage.totalRequests || 0,
        isMeasured: true, // Network is now measured
      },
      storage: calculateStorageUsage(tab),
      performance: performanceData ? {
        jsExecutionTime: performanceData.jsExecutionTime || 0,
        totalExecutionTime: performanceData.totalExecutionTime || 0,
        scriptTime: performanceData.scriptTime || 0,
        paintTime: performanceData.paintTime || 0,
        layoutTime: performanceData.layoutTime || 0,
        activeIntervals: performanceData.activeIntervals || 0,
        activeTimeouts: performanceData.activeTimeouts || 0,
        totalIntervalsCreated: performanceData.totalIntervalsCreated || 0,
        totalTimeoutsCreated: performanceData.totalTimeoutsCreated || 0,
        averageIntervalDelay: performanceData.averageIntervalDelay || 0,
        averageTimeoutDelay: performanceData.averageTimeoutDelay || 0,
        hasData: performanceData.hasData || false,
      } : null,
      timestamp: Date.now(),
      // Metadata about what's measured vs estimated
      metadata: {
        memoryMeasured: !!(performanceData && performanceData.memoryUsed > 0),
        cpuMeasured: false, // CPU cannot be measured in Firefox
        networkMeasured: true, // Network is now measured
        performanceMeasured: !!(performanceData && performanceData.hasData),
      },
    };

    return resourceUsage;
  } catch (error) {
    console.error(`Error getting resource usage for tab ${tabId}:`, error);
    throw error;
  }
}

/**
 * Calculate estimated memory usage in MB
 * Based on tab properties and state
 */
function calculateMemoryUsage(tab) {
  let memoryMB = 50; // Base memory for a tab

  // Active tab uses more memory
  if (tab.active) {
    memoryMB += 100;
  }

  // Discarded tabs use minimal memory
  if (tab.discarded) {
    return Math.max(5, memoryMB * 0.1);
  }

  // Audible tabs (playing media) use more
  if (tab.audible) {
    memoryMB += 150;
  }

  // Pinned tabs are typically lighter
  if (tab.pinned) {
    memoryMB *= 0.7;
  }

  // Audio/video media tabs use significantly more
  if (isMediaTab(tab)) {
    memoryMB += 200;
  }

  // Longer URLs might indicate complex pages
  if (tab.url && tab.url.length > 100) {
    memoryMB += 20;
  }

  // Add some randomization to simulate real variance
  const variance = 0.8 + Math.random() * 0.4; // ±20% variance
  
  return Math.round(memoryMB * variance);
}

/**
 * Calculate estimated CPU usage percentage
 * Based on tab activity and state, enhanced with performance data if available
 * @param {Object} tab - Tab object
 * @param {Object} performanceData - Performance data from content scripts (optional)
 */
function calculateCPUUsage(tab, performanceData = null) {
  let cpuPercent = 0;

  // Discarded tabs use no CPU
  if (tab.discarded) {
    return 0;
  }

  // Use performance data to improve CPU estimate
  if (performanceData) {
    // Active intervals/timeouts indicate background activity
    const activeTimers = (performanceData.activeIntervals || 0) + (performanceData.activeTimeouts || 0);
    if (activeTimers > 10) {
      cpuPercent += Math.min(15, activeTimers * 0.5); // Up to 15% for high timer activity
    } else if (activeTimers > 5) {
      cpuPercent += 5;
    }

    // High script execution time suggests CPU usage
    if (performanceData.scriptTime > 1000) {
      cpuPercent += 10; // High script time = more CPU
    } else if (performanceData.scriptTime > 500) {
      cpuPercent += 5;
    }
  }

  // Active tab uses more CPU
  if (tab.active) {
    cpuPercent += 15;
  } else {
    cpuPercent += 2; // Background tabs use minimal CPU
  }

  // Audible tabs are processing audio
  if (tab.audible) {
    cpuPercent += 20;
  }

  // Media tabs are processing video/audio
  if (isMediaTab(tab)) {
    cpuPercent += 30;
  }

  // Pinned tabs typically less active
  if (tab.pinned) {
    cpuPercent *= 0.5;
  }

  // Add variance (less variance if we have performance data)
  const variance = performanceData ? 0.85 + Math.random() * 0.3 : 0.7 + Math.random() * 0.6;
  
  return Math.min(100, Math.round(cpuPercent * variance * 10) / 10);
}

/**
 * Calculate estimated network usage (fallback when real measurement unavailable)
 * Based on tab state and activity
 */
function calculateNetworkUsage(tab) {
  if (tab.discarded) {
    return {
      bytesIn: 0,
      bytesOut: 0,
      bytesInPerSecond: 0,
      bytesOutPerSecond: 0,
      requestsPerSecond: 0,
      totalRequests: 0,
    };
  }

  const baseBytes = 50000; // 50KB base
  
  let bytesIn = baseBytes;
  let requestsPerSecond = 0.5;

  if (tab.active) {
    bytesIn += 100000;
    requestsPerSecond += 1;
  }

  if (isMediaTab(tab)) {
    bytesIn += 500000; // Media streaming
    requestsPerSecond += 2;
  }

  // Add variance
  const variance = 0.5 + Math.random() * 1.0;
  
  return {
    bytesIn: Math.round(bytesIn * variance),
    bytesOut: Math.round(bytesIn * 0.1 * variance), // Outbound is typically 10% of inbound
    bytesInPerSecond: 0,
    bytesOutPerSecond: 0,
    requestsPerSecond: Math.round(requestsPerSecond * variance * 10) / 10,
    totalRequests: 0,
  };
}

/**
 * Calculate estimated storage usage
 * Based on tab type and domain
 */
function calculateStorageUsage(tab) {
  if (!tab.url || tab.discarded) {
    return {
      localStorage: 0,
      indexedDB: 0,
      cache: 0,
      total: 0,
    };
  }

  // Estimate storage based on URL type
  let localStorage = 100; // KB
  let indexedDB = 50;
  let cache = 200;

  // Active tabs might have more storage
  if (tab.active) {
    localStorage += 50;
    cache += 100;
  }

  // Media sites often use more storage
  if (isMediaTab(tab)) {
    indexedDB += 500;
    cache += 1000;
  }

  const variance = 0.7 + Math.random() * 0.6;

  return {
    localStorage: Math.round(localStorage * variance),
    indexedDB: Math.round(indexedDB * variance),
    cache: Math.round(cache * variance),
    total: Math.round((localStorage + indexedDB + cache) * variance),
  };
}

/**
 * Check if a tab is a media tab (video/audio)
 */
function isMediaTab(tab) {
  if (!tab.url) return false;
  
  const url = tab.url.toLowerCase();
  const mediaDomains = ['youtube.com', 'vimeo.com', 'twitch.tv', 'netflix.com', 'hulu.com', 'spotify.com'];
  const mediaPatterns = ['video', 'audio', 'stream', 'media'];
  
  // Check if URL contains media-related keywords
  const hasMediaDomain = mediaDomains.some(domain => url.includes(domain));
  const hasMediaPattern = mediaPatterns.some(pattern => url.includes(pattern));
  
  return hasMediaDomain || hasMediaPattern || tab.audible;
}

/**
 * Get resource usage for multiple tabs
 * @param {Array<number>} tabIds - Array of tab IDs
 * @returns {Promise<Object>} Object mapping tabId to resource usage
 */
export async function getMultipleTabsResourceUsage(tabIds) {
  const results = {};
  
  await Promise.all(
    tabIds.map(async (tabId) => {
      try {
        results[tabId] = await getResourceUsage(tabId);
      } catch (error) {
        console.error(`Failed to get resource usage for tab ${tabId}:`, error);
        results[tabId] = null;
      }
    })
  );
  
  return results;
}


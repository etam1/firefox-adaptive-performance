/**
 * Service for tracking actual network activity per tab using webRequest API
 * This provides real measurements of network usage instead of estimates
 */

// Storage for network metrics per tab
const networkMetrics = {};

// Time windows for calculating rates (in milliseconds)
const RATE_WINDOW = 5000; // 5 seconds
const CLEANUP_INTERVAL = 30000; // Clean up old data every 30 seconds

/**
 * Initialize network tracking
 */
export function initializeNetworkTracking() {
  // Listen for request start
  browser.webRequest.onBeforeRequest.addListener(
    (details) => {
      const tabId = details.tabId;
      if (tabId === -1) return; // Skip non-tab requests (extensions, etc.)
      
      if (!networkMetrics[tabId]) {
        networkMetrics[tabId] = {
          requests: [],
          totalBytesIn: 0,
          totalBytesOut: 0,
          requestCount: 0,
          lastUpdated: Date.now(),
        };
      }
      
      // Store request info (we'll update with response size later)
      networkMetrics[tabId].requests.push({
        requestId: details.requestId,
        url: details.url,
        method: details.method,
        timestamp: Date.now(),
        size: 0, // Will be updated in onCompleted
      });
      
      networkMetrics[tabId].requestCount++;
    },
    { urls: ["<all_urls>"] },
    []
  );

  // Listen for request headers (for outbound size estimation)
  browser.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      const tabId = details.tabId;
      if (tabId === -1 || !networkMetrics[tabId]) return;
      
      // Estimate request size from headers
      const requestSize = estimateRequestSize(details.requestHeaders);
      const request = networkMetrics[tabId].requests.find(r => r.requestId === details.requestId);
      if (request) {
        request.outboundSize = requestSize;
        networkMetrics[tabId].totalBytesOut += requestSize;
      }
    },
    { urls: ["<all_urls>"] },
    ["requestHeaders"]
  );

  // Listen for response headers (for inbound size)
  browser.webRequest.onResponseStarted.addListener(
    (details) => {
      const tabId = details.tabId;
      if (tabId === -1 || !networkMetrics[tabId]) return;
      
      const request = networkMetrics[tabId].requests.find(r => r.requestId === details.requestId);
      if (request) {
        // Try to get content length from headers
        const contentLength = getContentLength(details.responseHeaders);
        if (contentLength > 0) {
          request.size = contentLength;
          networkMetrics[tabId].totalBytesIn += contentLength;
        }
      }
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
  );

  // Listen for completed requests (final size update)
  browser.webRequest.onCompleted.addListener(
    (details) => {
      const tabId = details.tabId;
      if (tabId === -1 || !networkMetrics[tabId]) return;
      
      const request = networkMetrics[tabId].requests.find(r => r.requestId === details.requestId);
      if (request && request.size === 0) {
        // If we didn't get size from headers, estimate from status code
        const estimatedSize = estimateResponseSize(details.statusCode, details.url);
        request.size = estimatedSize;
        networkMetrics[tabId].totalBytesIn += estimatedSize;
      }
      
      networkMetrics[tabId].lastUpdated = Date.now();
    },
    { urls: ["<all_urls>"] }
  );

  // Listen for errors
  browser.webRequest.onErrorOccurred.addListener(
    (details) => {
      const tabId = details.tabId;
      if (tabId === -1 || !networkMetrics[tabId]) return;
      
      // Remove failed request from tracking
      networkMetrics[tabId].requests = networkMetrics[tabId].requests.filter(
        r => r.requestId !== details.requestId
      );
      networkMetrics[tabId].requestCount = Math.max(0, networkMetrics[tabId].requestCount - 1);
    },
    { urls: ["<all_urls>"] }
  );

  // Clean up old data periodically
  setInterval(cleanupOldData, CLEANUP_INTERVAL);
  
  console.log('Network tracking initialized');
}

/**
 * Get network usage for a specific tab
 * @param {number} tabId - The ID of the tab
 * @returns {Object} Network usage object with bytesIn, bytesOut, requestsPerSecond
 */
export function getNetworkUsage(tabId) {
  const metrics = networkMetrics[tabId];
  
  if (!metrics || metrics.requests.length === 0) {
    return {
      bytesIn: 0,
      bytesOut: 0,
      requestsPerSecond: 0,
      totalRequests: 0,
    };
  }

  // Calculate requests per second over the last RATE_WINDOW
  const now = Date.now();
  const recentRequests = metrics.requests.filter(
    r => (now - r.timestamp) < RATE_WINDOW
  );
  const requestsPerSecond = recentRequests.length / (RATE_WINDOW / 1000);

  // Calculate bytes per second over the last RATE_WINDOW
  const recentBytesIn = recentRequests.reduce((sum, r) => sum + (r.size || 0), 0);
  const recentBytesOut = recentRequests.reduce((sum, r) => sum + (r.outboundSize || 0), 0);
  const bytesInPerSecond = recentBytesIn / (RATE_WINDOW / 1000);
  const bytesOutPerSecond = recentBytesOut / (RATE_WINDOW / 1000);

  return {
    bytesIn: Math.round(metrics.totalBytesIn),
    bytesOut: Math.round(metrics.totalBytesOut),
    bytesInPerSecond: Math.round(bytesInPerSecond),
    bytesOutPerSecond: Math.round(bytesOutPerSecond),
    requestsPerSecond: Math.round(requestsPerSecond * 10) / 10,
    totalRequests: metrics.requestCount,
    lastUpdated: metrics.lastUpdated,
  };
}

/**
 * Get network usage for multiple tabs
 * @param {Array<number>} tabIds - Array of tab IDs
 * @returns {Object} Object mapping tabId to network usage
 */
export function getMultipleTabsNetworkUsage(tabIds) {
  const results = {};
  tabIds.forEach(tabId => {
    results[tabId] = getNetworkUsage(tabId);
  });
  return results;
}

/**
 * Reset network metrics for a tab (useful when tab is reloaded)
 * @param {number} tabId - The ID of the tab
 */
export function resetTabNetworkMetrics(tabId) {
  if (networkMetrics[tabId]) {
    networkMetrics[tabId] = {
      requests: [],
      totalBytesIn: 0,
      totalBytesOut: 0,
      requestCount: 0,
      lastUpdated: Date.now(),
    };
  }
}

/**
 * Estimate request size from headers
 */
function estimateRequestSize(requestHeaders) {
  if (!requestHeaders) return 0;
  
  // Estimate based on headers size
  let size = 0;
  requestHeaders.forEach(header => {
    size += (header.name?.length || 0) + (header.value?.length || 0) + 4; // +4 for ": \r\n"
  });
  
  // Add estimated body size for POST/PUT requests
  const hasBody = requestHeaders.some(h => 
    h.name && ['content-length', 'content-type'].includes(h.name.toLowerCase())
  );
  if (hasBody) {
    const contentLength = requestHeaders.find(h => 
      h.name && h.name.toLowerCase() === 'content-length'
    );
    if (contentLength) {
      size += parseInt(contentLength.value) || 0;
    } else {
      size += 100; // Default estimate for body
    }
  }
  
  return size;
}

/**
 * Get content length from response headers
 */
function getContentLength(responseHeaders) {
  if (!responseHeaders) return 0;
  
  const contentLengthHeader = responseHeaders.find(
    h => h.name && h.name.toLowerCase() === 'content-length'
  );
  
  if (contentLengthHeader) {
    return parseInt(contentLengthHeader.value) || 0;
  }
  
  return 0;
}

/**
 * Estimate response size based on status code and URL
 */
function estimateResponseSize(statusCode, url) {
  // For errors, return 0
  if (statusCode >= 400) {
    return 0;
  }
  
  // Estimate based on content type (if we can infer from URL)
  const urlLower = url.toLowerCase();
  
  // Images
  if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
    return 50000; // ~50KB average
  }
  
  // Videos
  if (urlLower.match(/\.(mp4|webm|avi|mov)$/)) {
    return 1000000; // ~1MB chunks
  }
  
  // JavaScript/CSS
  if (urlLower.match(/\.(js|css)$/)) {
    return 50000; // ~50KB average
  }
  
  // HTML
  if (urlLower.match(/\.(html|htm)$/) || !urlLower.match(/\./)) {
    return 10000; // ~10KB average
  }
  
  // Default estimate
  return 20000; // ~20KB
}

/**
 * Clean up old request data to prevent memory leaks
 */
function cleanupOldData() {
  const now = Date.now();
  const maxAge = RATE_WINDOW * 2; // Keep data for 2x the rate window
  
  Object.keys(networkMetrics).forEach(tabId => {
    const metrics = networkMetrics[tabId];
    
    // Remove old requests
    metrics.requests = metrics.requests.filter(
      r => (now - r.timestamp) < maxAge
    );
    
    // If tab has no recent activity and no requests, consider cleaning up
    // (But keep the totals for historical tracking)
  });
}

/**
 * Get all network metrics (for debugging)
 */
export function getAllNetworkMetrics() {
  return networkMetrics;
}



/**
 * Content script for monitoring JavaScript execution time and memory usage
 * Injected into all pages to measure actual performance metrics
 */

(function() {
  'use strict';

  // Performance metrics storage
  const performanceData = {
    jsExecutionTime: 0,
    totalExecutionTime: 0,
    memoryUsed: 0,
    memoryTotal: 0,
    memoryLimit: 0,
    paintTime: 0,
    layoutTime: 0,
    scriptTime: 0,
    lastUpdated: Date.now(),
  };

  // Track performance marks
  const performanceMarks = {
    navigationStart: 0,
    domContentLoaded: 0,
    loadComplete: 0,
  };

  /**
   * Initialize performance monitoring
   */
  function initPerformanceMonitoring() {
    // Wait for performance API to be available
    if (typeof performance === 'undefined') {
      setTimeout(initPerformanceMonitoring, 100);
      return;
    }

    // Mark navigation start
    if (performance.timing) {
      performanceMarks.navigationStart = performance.timing.navigationStart;
    } else if (performance.timeOrigin) {
      performanceMarks.navigationStart = performance.timeOrigin;
    }

    // Monitor JavaScript execution time
    monitorJavaScriptExecution();

    // Monitor memory (if available)
    monitorMemoryUsage();

    // Monitor paint and layout times
    monitorPaintAndLayout();

    // Listen for page load events
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
    } else {
      onDOMContentLoaded();
    }

    window.addEventListener('load', onLoadComplete);

    // Send initial data
    sendPerformanceData();
    
    // Send updates periodically
    setInterval(sendPerformanceData, 2000); // Every 2 seconds
  }

  /**
   * Monitor JavaScript execution time using Performance API
   */
  function monitorJavaScriptExecution() {
    if (!performance.getEntriesByType) return;

    try {
      // Get all performance entries
      const entries = performance.getEntriesByType('measure');
      const navigationEntries = performance.getEntriesByType('navigation');
      const resourceEntries = performance.getEntriesByType('resource');

      // Calculate total script execution time
      let scriptTime = 0;
      entries.forEach(entry => {
        if (entry.entryType === 'measure' && entry.name.includes('script')) {
          scriptTime += entry.duration;
        }
      });

      // Calculate from navigation timing if available
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        if (nav.scriptStart && nav.scriptEnd) {
          scriptTime = nav.scriptEnd - nav.scriptStart;
        }
      }

      performanceData.scriptTime = scriptTime;

      // Calculate total execution time
      if (performance.timing) {
        const timing = performance.timing;
        performanceData.totalExecutionTime = timing.loadEventEnd - timing.navigationStart;
      }
    } catch (error) {
      console.warn('Performance monitoring error:', error);
    }
  }

  /**
   * Monitor memory usage (if available)
   */
  function monitorMemoryUsage() {
    try {
      // Chrome/Edge memory API
      if (performance.memory) {
        performanceData.memoryUsed = performance.memory.usedJSHeapSize;
        performanceData.memoryTotal = performance.memory.totalJSHeapSize;
        performanceData.memoryLimit = performance.memory.jsHeapSizeLimit;
      }

      // Try to get memory from performance observer
      if (typeof PerformanceObserver !== 'undefined') {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'measure' && entry.name === 'memory') {
                // Handle memory measurements if any
              }
            }
          });
          observer.observe({ entryTypes: ['measure'] });
        } catch (e) {
          // PerformanceObserver might not support all entry types
        }
      }
    } catch (error) {
      // Memory API might not be available (Firefox doesn't expose it)
      console.warn('Memory monitoring not available:', error);
    }
  }

  /**
   * Monitor paint and layout times
   */
  function monitorPaintAndLayout() {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      // Observe paint events
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            performanceData.paintTime = entry.startTime;
          }
        }
      });

      try {
        paintObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        // Paint observer might not be supported
      }

      // Observe layout shift
      const layoutObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift') {
            performanceData.layoutTime += entry.value;
          }
        }
      });

      try {
        layoutObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Layout shift might not be supported
      }
    } catch (error) {
      console.warn('Paint/layout monitoring error:', error);
    }
  }

  /**
   * Handle DOM content loaded
   */
  function onDOMContentLoaded() {
    if (performance.timing) {
      performanceMarks.domContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    }
    updatePerformanceData();
  }

  /**
   * Handle page load complete
   */
  function onLoadComplete() {
    if (performance.timing) {
      performanceMarks.loadComplete = performance.timing.loadEventEnd - performance.timing.navigationStart;
    }
    updatePerformanceData();
  }

  /**
   * Update performance data
   */
  function updatePerformanceData() {
    monitorJavaScriptExecution();
    monitorMemoryUsage();
    performanceData.lastUpdated = Date.now();
  }

  /**
   * Send performance data to background script
   */
  function sendPerformanceData() {
    updatePerformanceData();

    // Get current tab ID
    browser.runtime.sendMessage({
      type: 'performanceData',
      data: {
        ...performanceData,
        marks: performanceMarks,
        timestamp: Date.now(),
      }
    }).catch(error => {
      // Ignore errors (might be in a context where messaging isn't available)
      console.debug('Could not send performance data:', error);
    });
  }

  // Start monitoring
  initPerformanceMonitoring();

  // Expose data for direct access (for debugging)
  window.__performanceMonitorData = performanceData;
})();



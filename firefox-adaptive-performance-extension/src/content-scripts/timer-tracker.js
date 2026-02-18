/**
 * Content script for tracking background timers (setInterval, setTimeout)
 * Helps identify tabs with high background activity
 */

(function() {
  'use strict';

  // Timer tracking data
  const timerData = {
    activeIntervals: 0,
    activeTimeouts: 0,
    totalIntervalsCreated: 0,
    totalTimeoutsCreated: 0,
    intervalsCleared: 0,
    timeoutsCleared: 0,
    averageIntervalDelay: 0,
    averageTimeoutDelay: 0,
    lastUpdated: Date.now(),
  };

  // Track active timers
  const activeTimers = {
    intervals: new Map(),
    timeouts: new Map(),
  };

  // Store original functions
  const originalSetInterval = window.setInterval;
  const originalClearInterval = window.clearInterval;
  const originalSetTimeout = window.setTimeout;
  const originalClearTimeout = window.clearTimeout;

  // Track delays for averaging
  const intervalDelays = [];
  const timeoutDelays = [];

  /**
   * Wrap setInterval to track it
   */
  window.setInterval = function(callback, delay, ...args) {
    const timerId = originalSetInterval.call(window, callback, delay, ...args);
    
    timerData.totalIntervalsCreated++;
    timerData.activeIntervals++;
    intervalDelays.push(delay);
    
    // Update average
    if (intervalDelays.length > 100) {
      intervalDelays.shift(); // Keep only last 100
    }
    timerData.averageIntervalDelay = Math.round(
      intervalDelays.reduce((a, b) => a + b, 0) / intervalDelays.length
    );

    // Store timer info
    activeTimers.intervals.set(timerId, {
      delay,
      createdAt: Date.now(),
      callback: callback.toString().substring(0, 100), // Store first 100 chars for debugging
    });

    // Send update
    sendTimerData();
    
    return timerId;
  };

  /**
   * Wrap clearInterval to track it
   */
  window.clearInterval = function(timerId) {
    if (activeTimers.intervals.has(timerId)) {
      timerData.intervalsCleared++;
      timerData.activeIntervals = Math.max(0, timerData.activeIntervals - 1);
      activeTimers.intervals.delete(timerId);
      sendTimerData();
    }
    
    return originalClearInterval.call(window, timerId);
  };

  /**
   * Wrap setTimeout to track it
   */
  window.setTimeout = function(callback, delay, ...args) {
    const timerId = originalSetTimeout.call(window, callback, delay, ...args);
    
    timerData.totalTimeoutsCreated++;
    timerData.activeTimeouts++;
    timeoutDelays.push(delay);
    
    // Update average
    if (timeoutDelays.length > 100) {
      timeoutDelays.shift(); // Keep only last 100
    }
    timerData.averageTimeoutDelay = Math.round(
      timeoutDelays.reduce((a, b) => a + b, 0) / timeoutDelays.length
    );

    // Store timer info
    activeTimers.timeouts.set(timerId, {
      delay,
      createdAt: Date.now(),
      callback: callback.toString().substring(0, 100), // Store first 100 chars for debugging
    });

    // Auto-remove when timeout fires
    originalSetTimeout.call(window, () => {
      if (activeTimers.timeouts.has(timerId)) {
        timerData.activeTimeouts = Math.max(0, timerData.activeTimeouts - 1);
        activeTimers.timeouts.delete(timerId);
        sendTimerData();
      }
    }, delay);

    // Send update
    sendTimerData();
    
    return timerId;
  };

  /**
   * Wrap clearTimeout to track it
   */
  window.clearTimeout = function(timerId) {
    if (activeTimers.timeouts.has(timerId)) {
      timerData.timeoutsCleared++;
      timerData.activeTimeouts = Math.max(0, timerData.activeTimeouts - 1);
      activeTimers.timeouts.delete(timerId);
      sendTimerData();
    }
    
    return originalClearTimeout.call(window, timerId);
  };

  /**
   * Send timer data to background script
   */
  function sendTimerData() {
    timerData.lastUpdated = Date.now();
    timerData.activeIntervals = activeTimers.intervals.size;
    timerData.activeTimeouts = activeTimers.timeouts.size;

    browser.runtime.sendMessage({
      type: 'timerData',
      data: {
        ...timerData,
        timestamp: Date.now(),
      }
    }).catch(error => {
      // Ignore errors (might be in a context where messaging isn't available)
      console.debug('Could not send timer data:', error);
    });
  }

  // Send periodic updates
  setInterval(sendTimerData, 3000); // Every 3 seconds

  // Send initial data
  sendTimerData();

  // Expose data for direct access (for debugging)
  window.__timerTrackerData = timerData;
})();



# Real Measurement Implementation

This document describes the real measurement capabilities that have been implemented to replace estimates where possible.

## What's Now Measured (Real Data)

### ✅ Network Activity - **FULLY MEASURED**
- **Location**: `src/services/networkTrackingService.js`
- **Method**: Uses Firefox `webRequest` API to track actual network requests
- **Metrics Collected**:
  - Total bytes in/out per tab
  - Bytes per second (inbound/outbound)
  - Requests per second
  - Total request count
- **Accuracy**: Real measurements from browser network layer

### ✅ JavaScript Execution Time - **MEASURED**
- **Location**: `src/content-scripts/performance-monitor.js`
- **Method**: Content script using Performance API
- **Metrics Collected**:
  - Script execution time
  - Total page execution time
  - Paint time
  - Layout shift time
- **Accuracy**: Real measurements from browser Performance API

### ✅ Memory Usage (Page-Level) - **MEASURED WHEN AVAILABLE**
- **Location**: `src/content-scripts/performance-monitor.js`
- **Method**: Performance API `performance.memory` (if available)
- **Metrics Collected**:
  - Used JS heap size
  - Total JS heap size
  - JS heap size limit
- **Accuracy**: Real measurements when API is available (Chrome/Edge), falls back to estimation in Firefox
- **Note**: This is page-level memory, not per-tab process memory (not available in Firefox)

### ✅ Background Tab Timers - **FULLY MEASURED**
- **Location**: `src/content-scripts/timer-tracker.js`
- **Method**: Content script that wraps `setInterval` and `setTimeout`
- **Metrics Collected**:
  - Active intervals count
  - Active timeouts count
  - Total intervals/timeouts created
  - Average interval/timeout delays
- **Accuracy**: Real tracking of all timers created in the page

## What's Still Estimated (Not Directly Measurable)

### ⚠️ CPU Usage Per Tab - **ESTIMATED**
- **Why**: Firefox WebExtensions API doesn't expose per-tab CPU usage
- **Improvement**: Now uses performance data (timers, script time) to improve estimates
- **Location**: `src/services/resourceUsageService.js` - `calculateCPUUsage()`

### ⚠️ Memory Heap Size Per Tab - **ESTIMATED**
- **Why**: Firefox doesn't expose per-tab process memory
- **Improvement**: Uses page-level memory when available, otherwise estimates
- **Location**: `src/services/resourceUsageService.js` - `calculateMemoryUsage()`

## Implementation Details

### Network Tracking Service
- Listens to `webRequest` API events:
  - `onBeforeRequest` - Track request start
  - `onBeforeSendHeaders` - Estimate outbound size
  - `onResponseStarted` - Get response size from headers
  - `onCompleted` - Finalize request tracking
- Calculates rates over 5-second windows
- Automatically cleans up old data

### Performance Monitoring
- Content script injected at `document_start`
- Uses Performance API:
  - `performance.getEntriesByType()` for script timing
  - `performance.memory` for memory (when available)
  - `PerformanceObserver` for paint/layout events
- Sends data to background script every 2 seconds

### Timer Tracking
- Content script injected at `document_start`
- Wraps native `setInterval`/`setTimeout` functions
- Tracks all timer creation and cleanup
- Sends data to background script every 3 seconds

### Resource Usage Service Updates
- Now imports and uses:
  - `networkTrackingService.js` for real network data
  - `performanceDataService.js` for real performance data
- Falls back to estimates when real data unavailable
- Includes metadata about what's measured vs estimated

## New Files Created

1. `src/services/networkTrackingService.js` - Network measurement service
2. `src/services/performanceDataService.js` - Performance data aggregation
3. `src/content-scripts/performance-monitor.js` - Performance monitoring content script
4. `src/content-scripts/timer-tracker.js` - Timer tracking content script

## Modified Files

1. `manifest.json` - Added `webRequest` permission and content scripts
2. `src/services/resourceUsageService.js` - Now uses real measurements
3. `src/background/background.js` - Initializes measurement systems
4. `copy-manifest.js` - Copies content scripts to dist folder

## Usage

The resource usage service automatically uses real measurements when available. The API remains the same:

```javascript
import { getResourceUsage } from './services/resourceUsageService.js';

const usage = await getResourceUsage(tabId);
console.log(usage.network.bytesIn); // Real measurement
console.log(usage.performance.jsExecutionTime); // Real measurement
console.log(usage.memory); // Real if available, otherwise estimate
console.log(usage.cpu); // Enhanced estimate (not directly measurable)
console.log(usage.metadata); // Shows what's measured vs estimated
```

## Build Process

Content scripts are automatically copied to `dist/content-scripts/` during build. The manifest references them correctly.

## Limitations

1. **CPU per tab**: Cannot be directly measured in Firefox. Enhanced estimates use performance data.
2. **Memory per tab**: Only page-level memory available, not process-level. Firefox doesn't expose per-tab process memory.
3. **Content Script Compatibility**: Some pages may block content scripts (CSP, etc.). In these cases, estimates are used.
4. **Performance API Availability**: Memory API is only available in Chrome/Edge, not Firefox.

## Future Improvements

- Add more sophisticated CPU estimation based on timer frequency and script execution time
- Implement better memory estimation using network data and page complexity
- Add visual indicators in UI showing which metrics are measured vs estimated
- Cache performance data to reduce overhead



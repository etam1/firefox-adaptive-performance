# Backend Architecture - Resource Usage & Scoring System

## Overview

This document describes the backend services and architecture for the Firefox Adaptive Performance Extension's resource monitoring and scoring system.

## Service Layer

### 1. `resourceUsageService.js`

Provides functions to calculate resource usage for browser tabs.

**Main Functions:**

- `getResourceUsage(tabId)` - Returns memory (MB), CPU (%), network usage, and storage estimates
- `getMultipleTabsResourceUsage(tabIds)` - Batch processing for multiple tabs

**Resource Calculation:**

- **Memory**: Estimated based on tab state (active, audible, media, pinned, discarded)
- **CPU**: Calculated from tab activity (active tabs, media playback, background activity)
- **Network**: Estimated bytes in/out and requests per second based on tab type
- **Storage**: Estimates for localStorage, IndexedDB, and cache

### 2. `scoringService.js`

Computes performance scores for tabs to identify resource-intensive tabs.

**Main Functions:**

- `computeTabScore(tabId)` - Returns weighted score (0-100) with breakdown
- `computeMultipleTabScores(tabIds)` - Batch processing
- `getScoreCategory(score)` - Returns category: 'low', 'medium', 'high', 'critical'

**Score Calculation:**

- **Weighted Formula**: Memory (30%) + CPU (30%) + Activity (25%) + Media Cost (15%)
- Higher scores indicate more resource-intensive tabs

### 3. `optimizationService.js`

Generates optimization suggestions for tabs.

**Main Functions:**

- `getOptimizationSuggestions(tabId)` - Returns array of suggestions
- `getMultipleTabsOptimizationSuggestions(tabIds)` - Batch processing
- `applyOptimization(tabId, action)` - Apply actions: 'discard', 'close', 'sleep'

**Safety Checks:**

- Protected tabs (pinned, active, internal pages) cannot be optimized
- Suggestions prioritize high-resource tabs

**Suggestion Types:**

- High memory usage → discard
- High CPU usage → discard
- Media streaming → pause/reduce quality
- Background high-score tabs → discard
- Already optimized → informational

### 4. `tabsAPI.js`

Unified API facade providing REST-like endpoints for frontend consumption.

**Endpoints:**

- `getTabs(options)` - GET /tabs - Get all tabs with optional enrichment
- `getTabById(tabId, options)` - GET /tabs/:id - Get specific tab
- `getTabResources(tabId)` - GET /tabs/:id/resources - Get resource usage
- `getTabScore(tabId)` - GET /tabs/:id/score - Get tab score
- `getTabSuggestions(tabId)` - GET /tabs/:id/suggestions - Get suggestions
- `optimizeTab(tabId, params)` - POST /tabs/:id/optimize - Apply optimization
- `getAllSuggestions(options)` - GET /suggestions - Get all suggestions
- `getAllResources(options)` - GET /resources - Get all resource usage
- `getAllScores(options)` - GET /scores - Get all scores

### 5. `cacheService.js`

Service for accessing cached data from the background script.

**Functions:**

- `getCachedData()` - Get cached data from background script
- `forceCacheUpdate()` - Force background script to refresh cache
- `isCacheFresh(maxAge)` - Check if cache is still valid

## Background Script (`background/background.js`)

The background script runs continuously and handles:

### Polling Loop

- Polls every 3 seconds (configurable via `POLLING_INTERVAL`)
- Updates cache with fresh tab data, resource usage, scores, and suggestions
- Processes tabs in batches of 5 to avoid performance issues

### Cache System

- In-memory cache with 5-second TTL (configurable)
- Stores:
  - Tab information
  - Resource usage per tab
  - Scores per tab
  - Suggestions per tab
- Auto-expires and refreshes

### Event Emitter

Simple event system for tab changes:

- `tabUpdated` - Fired when tabs are updated
- `tabCreated` - Fired when new tabs are created
- `tabRemoved` - Fired when tabs are closed
- `resourceUpdated` - Fired when resource usage changes
- `scoreUpdated` - Fired when scores are updated

### Tab Event Listeners

- `browser.tabs.onUpdated` - Updates cache when tabs change
- `browser.tabs.onCreated` - Tracks new tabs
- `browser.tabs.onRemoved` - Cleans up cache for removed tabs
- `browser.tabs.onActivated` - Updates cache for active tab

### Message Handler

Handles messages from popup/frontend:

- `getCachedData` - Returns cached data
- `forceCacheUpdate` - Forces cache refresh
- `subscribeEvent` - Subscribes to events

## Safety Features

1. **Protected Tabs**: Pinned tabs, active tabs, and internal Firefox pages cannot be optimized
2. **Batch Processing**: Resource usage and scores are computed in batches to avoid overwhelming the browser
3. **Error Handling**: All services include comprehensive error handling
4. **Cache Expiration**: Prevents stale data from being served

## Usage Examples

### Get all tabs with resources and scores:

```javascript
import { tabsAPI } from "./services/tabsAPI.js";

const tabs = await tabsAPI.getTabs({
  includeResources: true,
  includeScores: true,
  includeSuggestions: true,
});
```

### Get optimization suggestions for a tab:

```javascript
const suggestions = await tabsAPI.getTabSuggestions(tabId);
```

### Access cached data (fast):

```javascript
import { getCachedData } from "./services/cacheService.js";

const cached = await getCachedData();
// Use cached.tabs, cached.resourceUsage, cached.scores, cached.suggestions
```

### Compute score for a tab:

```javascript
import { computeTabScore } from "./services/scoringService.js";

const score = await computeTabScore(tabId);
console.log(`Tab ${tabId} score: ${score.totalScore}`);
```

## File Structure

```
src/
├── services/
│   ├── tabsService.js          # Basic tab operations
│   ├── resourceUsageService.js # Resource usage calculations
│   ├── scoringService.js       # Score computations
│   ├── optimizationService.js  # Optimization suggestions
│   ├── tabsAPI.js             # Unified API facade
│   └── cacheService.js        # Cache access helper
└── background/
    └── background.js          # Background polling & caching
```

## Configuration

### Polling Interval

Edit `POLLING_INTERVAL` in `background.js` (default: 3000ms)

### Cache TTL

Edit `cacheTTL` in `background.js` (default: 5000ms)

### Batch Size

Edit `batchSize` in `updateCache()` function (default: 5)

## Notes

- Resource usage is **estimated** since Firefox WebExtensions API has limited performance APIs
- Scores are calculated using a consistent formula for comparison
- The background script runs persistently to maintain fresh cache
- All operations are asynchronous to avoid blocking the UI

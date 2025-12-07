/**
 * Service for computing performance scores for browser tabs
 * Score helps identify tabs that are resource-intensive
 */

import { getResourceUsage } from './resourceUsageService.js';
import { getTabById } from './tabsService.js';

/**
 * Compute a performance score for a tab
 * Higher score = more resource intensive
 * @param {number} tabId - The ID of the tab
 * @returns {Promise<Object>} Score object with total score and breakdown
 */
export async function computeTabScore(tabId) {
  try {
    const tab = await getTabById(tabId);
    const resourceUsage = await getResourceUsage(tabId);

    if (!tab) {
      throw new Error(`Tab with ID ${tabId} not found`);
    }

    // Component scores (normalized to 0-100 range)
    const memoryScore = calculateMemoryScore(resourceUsage.memory);
    const cpuScore = calculateCPUScore(resourceUsage.cpu);
    const activityScore = calculateActivityScore(tab, resourceUsage);
    const mediaCost = calculateMediaCost(tab, resourceUsage);

    // Weighted total score
    // Memory: 30%, CPU: 30%, Activity: 25%, Media: 15%
    const totalScore = Math.round(
      memoryScore * 0.3 +
      cpuScore * 0.3 +
      activityScore * 0.25 +
      mediaCost * 0.15
    );

    return {
      tabId,
      totalScore,
      breakdown: {
        memory: {
          value: resourceUsage.memory,
          score: memoryScore,
          weight: 0.3,
        },
        cpu: {
          value: resourceUsage.cpu,
          score: cpuScore,
          weight: 0.3,
        },
        activity: {
          value: activityScore,
          score: activityScore,
          weight: 0.25,
        },
        media: {
          value: mediaCost,
          score: mediaCost,
          weight: 0.15,
        },
      },
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error computing score for tab ${tabId}:`, error);
    throw error;
  }
}

/**
 * Calculate memory score (0-100)
 * Higher memory = higher score
 */
function calculateMemoryScore(memoryMB) {
  // Normalize to 0-100 scale
  // 0-50MB = 0-20 points
  // 50-150MB = 20-60 points
  // 150-300MB = 60-90 points
  // 300+MB = 90-100 points
  
  if (memoryMB < 50) {
    return Math.min(20, Math.round((memoryMB / 50) * 20));
  } else if (memoryMB < 150) {
    return Math.round(20 + ((memoryMB - 50) / 100) * 40);
  } else if (memoryMB < 300) {
    return Math.round(60 + ((memoryMB - 150) / 150) * 30);
  } else {
    return Math.min(100, Math.round(90 + ((memoryMB - 300) / 200) * 10));
  }
}

/**
 * Calculate CPU score (0-100)
 * Higher CPU usage = higher score
 */
function calculateCPUScore(cpuPercent) {
  // CPU is already a percentage, but we'll scale it
  // 0% = 0 points, 50%+ = 100 points
  if (cpuPercent <= 0) {
    return 0;
  }
  
  // Exponential scaling: low CPU doesn't penalize much, high CPU penalizes heavily
  const normalized = Math.min(100, (cpuPercent / 50) * 100);
  return Math.round(normalized);
}

/**
 * Calculate activity score (0-100)
 * Based on tab state, recency, and behavior
 */
function calculateActivityScore(tab, resourceUsage) {
  let score = 0;

  // Active tab gets high activity score
  if (tab.active) {
    score += 80;
  } else {
    score += 10; // Background tabs have minimal activity
  }

  // Audible tabs are actively playing
  if (tab.audible) {
    score += 20;
  }

  // Tabs with high network activity
  if (resourceUsage.network && resourceUsage.network.requestsPerSecond > 1) {
    score += 15;
  }

  // Discarded tabs have no activity
  if (tab.discarded) {
    return 0;
  }

  return Math.min(100, score);
}

/**
 * Calculate media cost score (0-100)
 * Media tabs consume significant resources
 */
function calculateMediaCost(tab, resourceUsage) {
  let score = 0;

  // Check if tab is playing media
  if (tab.audible) {
    score += 50;
  }

  // High network usage suggests streaming
  if (resourceUsage.network && resourceUsage.network.bytesIn > 500000) {
    score += 40;
  }

  // Check URL patterns for media sites
  if (tab.url) {
    const url = tab.url.toLowerCase();
    const mediaSites = ['youtube.com', 'vimeo.com', 'twitch.tv', 'netflix.com', 'hulu.com'];
    
    if (mediaSites.some(site => url.includes(site))) {
      score += 60;
    }
  }

  return Math.min(100, score);
}

/**
 * Compute scores for multiple tabs
 * @param {Array<number>} tabIds - Array of tab IDs
 * @returns {Promise<Array>} Array of score objects sorted by score (highest first)
 */
export async function computeMultipleTabScores(tabIds) {
  const scores = await Promise.all(
    tabIds.map(async (tabId) => {
      try {
        return await computeTabScore(tabId);
      } catch (error) {
        console.error(`Failed to compute score for tab ${tabId}:`, error);
        return {
          tabId,
          totalScore: 0,
          breakdown: {},
          error: error.message,
        };
      }
    })
  );

  // Sort by total score (highest first)
  return scores.sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Get tab score category
 * @param {number} score - The total score
 * @returns {string} Category: 'low', 'medium', 'high', 'critical'
 */
export function getScoreCategory(score) {
  if (score < 25) return 'low';
  if (score < 50) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
}


/**
 * Service for generating optimization suggestions for browser tabs
 */

import { computeTabScore, getScoreCategory } from './scoringService.js';
import { getResourceUsage } from './resourceUsageService.js';
import { getTabById } from './tabsService.js';

/**
 * Get optimization suggestions for a specific tab
 * @param {number} tabId - The ID of the tab
 * @returns {Promise<Array>} Array of suggestion objects
 */
export async function getOptimizationSuggestions(tabId) {
  try {
    const tab = await getTabById(tabId);
    const score = await computeTabScore(tabId);
    const resourceUsage = await getResourceUsage(tabId);

    if (!tab) {
      throw new Error(`Tab with ID ${tabId} not found`);
    }

    const suggestions = [];

    // Safety checks - don't suggest actions for protected tabs
    const isProtected = isTabProtected(tab);
    if (isProtected) {
      return [
        {
          type: 'info',
          action: 'none',
          title: 'Tab is protected',
          description: 'This tab cannot be optimized due to safety restrictions.',
          priority: 'low',
        },
      ];
    }

    // Generate suggestions based on score and resource usage
    const scoreCategory = getScoreCategory(score.totalScore);

    // High memory usage suggestions
    if (resourceUsage.memory > 200) {
      suggestions.push({
        type: 'memory',
        action: 'discard',
        title: 'High Memory Usage',
        description: `This tab is using ${resourceUsage.memory}MB of memory. Consider discarding it.`,
        priority: scoreCategory === 'critical' ? 'high' : 'medium',
        estimatedSavings: `${Math.round(resourceUsage.memory * 0.9)}MB memory`,
      });
    }

    // High CPU usage suggestions
    if (resourceUsage.cpu > 30) {
      suggestions.push({
        type: 'cpu',
        action: 'discard',
        title: 'High CPU Usage',
        description: `This tab is using ${resourceUsage.cpu}% CPU. Consider discarding it.`,
        priority: scoreCategory === 'critical' ? 'high' : 'medium',
        estimatedSavings: `${resourceUsage.cpu}% CPU`,
      });
    }

    // Media tab suggestions
    if (resourceUsage.network && resourceUsage.network.bytesIn > 500000) {
      suggestions.push({
        type: 'media',
        action: 'pause_media',
        title: 'Reduce Media Streaming',
        description: 'This tab appears to be streaming media. Pausing or reducing quality can save resources.',
        priority: 'medium',
        estimatedSavings: 'Reduced network bandwidth',
      });
    }

    // Background tabs with high scores
    if (!tab.active && score.totalScore > 50) {
      suggestions.push({
        type: 'background',
        action: 'discard',
        title: 'Inactive High-Resource Tab',
        description: 'This inactive tab is consuming significant resources. Discarding it will free up memory.',
        priority: 'medium',
        estimatedSavings: `${Math.round(resourceUsage.memory * 0.9)}MB memory, ${resourceUsage.cpu}% CPU`,
      });
    }

    // Discarded tab suggestion (reload if needed)
    if (tab.discarded && score.totalScore < 10) {
      suggestions.push({
        type: 'info',
        action: 'none',
        title: 'Tab is already optimized',
        description: 'This tab has been discarded and is using minimal resources.',
        priority: 'low',
      });
    }

    // Multiple tabs open suggestion
    if (score.totalScore > 40) {
      suggestions.push({
        type: 'general',
        action: 'close',
        title: 'Consider Closing Tab',
        description: 'This tab has a high resource score. If not needed, consider closing it.',
        priority: 'low',
        estimatedSavings: `${resourceUsage.memory}MB memory, ${resourceUsage.cpu}% CPU`,
      });
    }

    // Sort by priority (high > medium > low)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return suggestions;
  } catch (error) {
    console.error(`Error getting optimization suggestions for tab ${tabId}:`, error);
    throw error;
  }
}

/**
 * Check if a tab is protected from optimization
 * (pinned tabs, active media tabs, etc.)
 */
function isTabProtected(tab) {
  // Pinned tabs should not be automatically optimized
  if (tab.pinned) {
    return true;
  }

  // Active tab should not be automatically discarded
  if (tab.active) {
    return true;
  }

  // Internal Firefox pages should not be touched
  if (tab.url && (
    tab.url.startsWith('about:') ||
    tab.url.startsWith('moz-extension:') ||
    tab.url.startsWith('chrome:')
  )) {
    return true;
  }

  // Extension pages
  if (tab.url && tab.url.includes('extension://')) {
    return true;
  }

  return false;
}

/**
 * Get optimization suggestions for multiple tabs
 * @param {Array<number>} tabIds - Array of tab IDs
 * @returns {Promise<Object>} Object mapping tabId to suggestions array
 */
export async function getMultipleTabsOptimizationSuggestions(tabIds) {
  const results = {};

  await Promise.all(
    tabIds.map(async (tabId) => {
      try {
        results[tabId] = await getOptimizationSuggestions(tabId);
      } catch (error) {
        console.error(`Failed to get suggestions for tab ${tabId}:`, error);
        results[tabId] = [];
      }
    })
  );

  return results;
}

/**
 * Apply optimization action to a tab
 * @param {number} tabId - The ID of the tab
 * @param {string} action - The action to apply ('discard', 'close', 'sleep')
 * @returns {Promise<boolean>} Success status
 */
export async function applyOptimization(tabId, action) {
  try {
    const tab = await getTabById(tabId);

    if (!tab) {
      throw new Error(`Tab with ID ${tabId} not found`);
    }

    // Safety check
    if (isTabProtected(tab)) {
      throw new Error('Cannot optimize protected tab');
    }

    switch (action) {
      case 'discard':
        await browser.tabs.discard(tabId);
        return true;

      case 'close':
        await browser.tabs.remove(tabId);
        return true;

      case 'sleep':
        // Firefox doesn't have a direct "sleep" API, so we discard
        await browser.tabs.discard(tabId);
        return true;

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`Error applying optimization to tab ${tabId}:`, error);
    throw error;
  }
}


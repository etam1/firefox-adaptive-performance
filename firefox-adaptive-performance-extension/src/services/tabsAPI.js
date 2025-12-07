/**
 * Unified Tabs API - provides endpoints for tabs, resources, scores, and suggestions
 * This acts as a facade to simplify access to all tab-related functionality
 */

import { getAllTabs, getAllTabsAllWindows, getTabById } from './tabsService.js';
import { getResourceUsage, getMultipleTabsResourceUsage } from './resourceUsageService.js';
import { computeTabScore, computeMultipleTabScores } from './scoringService.js';
import { getOptimizationSuggestions, getMultipleTabsOptimizationSuggestions, applyOptimization } from './optimizationService.js';

/**
 * Build the tabs API object with all endpoints
 * @returns {Object} API object with methods for /tabs, /tabs/:id, /suggestions
 */
export function buildTabsAPI() {
  return {
    /**
     * GET /tabs - Get all tabs with optional resource data
     * @param {Object} options - Query options
     * @param {boolean} options.includeResources - Include resource usage data
     * @param {boolean} options.includeScores - Include score data
     * @param {boolean} options.includeSuggestions - Include optimization suggestions
     * @param {boolean} options.allWindows - Include tabs from all windows (default: current window)
     * @returns {Promise<Array>} Array of tab objects with requested data
     */
    async getTabs(options = {}) {
      const {
        includeResources = false,
        includeScores = false,
        includeSuggestions = false,
        allWindows = false,
      } = options;

      try {
        // Get tabs
        const tabs = allWindows ? await getAllTabsAllWindows() : await getAllTabs();
        
        // If no additional data requested, return simple tab list
        if (!includeResources && !includeScores && !includeSuggestions) {
          return tabs;
        }

        // Enrich tabs with requested data
        const enrichedTabs = await Promise.all(
          tabs.map(async (tab) => {
            const enriched = {
              ...tab,
            };

            if (includeResources) {
              try {
                enriched.resourceUsage = await getResourceUsage(tab.id);
              } catch (error) {
                enriched.resourceUsage = null;
                enriched.resourceUsageError = error.message;
              }
            }

            if (includeScores) {
              try {
                enriched.score = await computeTabScore(tab.id);
              } catch (error) {
                enriched.score = null;
                enriched.scoreError = error.message;
              }
            }

            if (includeSuggestions) {
              try {
                enriched.suggestions = await getOptimizationSuggestions(tab.id);
              } catch (error) {
                enriched.suggestions = [];
                enriched.suggestionsError = error.message;
              }
            }

            return enriched;
          })
        );

        return enrichedTabs;
      } catch (error) {
        console.error('Error in getTabs API:', error);
        throw error;
      }
    },

    /**
     * GET /tabs/:id - Get a specific tab by ID with optional resource data
     * @param {number} tabId - The ID of the tab
     * @param {Object} options - Query options
     * @param {boolean} options.includeResources - Include resource usage data
     * @param {boolean} options.includeScores - Include score data
     * @param {boolean} options.includeSuggestions - Include optimization suggestions
     * @returns {Promise<Object>} Tab object with requested data
     */
    async getTabById(tabId, options = {}) {
      const {
        includeResources = false,
        includeScores = false,
        includeSuggestions = false,
      } = options;

      try {
        const tab = await getTabById(tabId);
        
        if (!tab) {
          throw new Error(`Tab with ID ${tabId} not found`);
        }

        const enriched = { ...tab };

        if (includeResources) {
          enriched.resourceUsage = await getResourceUsage(tabId);
        }

        if (includeScores) {
          enriched.score = await computeTabScore(tabId);
        }

        if (includeSuggestions) {
          enriched.suggestions = await getOptimizationSuggestions(tabId);
        }

        return enriched;
      } catch (error) {
        console.error(`Error in getTabById API for tab ${tabId}:`, error);
        throw error;
      }
    },

    /**
     * GET /tabs/:id/resources - Get resource usage for a specific tab
     * @param {number} tabId - The ID of the tab
     * @returns {Promise<Object>} Resource usage object
     */
    async getTabResources(tabId) {
      return await getResourceUsage(tabId);
    },

    /**
     * GET /tabs/:id/score - Get score for a specific tab
     * @param {number} tabId - The ID of the tab
     * @returns {Promise<Object>} Score object
     */
    async getTabScore(tabId) {
      return await computeTabScore(tabId);
    },

    /**
     * GET /tabs/:id/suggestions - Get optimization suggestions for a specific tab
     * @param {number} tabId - The ID of the tab
     * @returns {Promise<Array>} Array of suggestion objects
     */
    async getTabSuggestions(tabId) {
      return await getOptimizationSuggestions(tabId);
    },

    /**
     * POST /tabs/:id/optimize - Apply optimization to a tab
     * @param {number} tabId - The ID of the tab
     * @param {Object} params - Optimization parameters
     * @param {string} params.action - Action to apply ('discard', 'close', 'sleep')
     * @returns {Promise<Object>} Result object
     */
    async optimizeTab(tabId, params = {}) {
      const { action = 'discard' } = params;
      
      try {
        const success = await applyOptimization(tabId, action);
        return {
          success,
          tabId,
          action,
          message: `Successfully applied ${action} to tab ${tabId}`,
        };
      } catch (error) {
        return {
          success: false,
          tabId,
          action,
          error: error.message,
        };
      }
    },

    /**
     * GET /suggestions - Get optimization suggestions for all tabs
     * @param {Object} options - Query options
     * @param {boolean} options.allWindows - Include tabs from all windows
     * @param {number} options.minScore - Minimum score to include suggestions
     * @returns {Promise<Object>} Object mapping tabId to suggestions array
     */
    async getAllSuggestions(options = {}) {
      const {
        allWindows = false,
        minScore = 0,
      } = options;

      try {
        const tabs = allWindows ? await getAllTabsAllWindows() : await getAllTabs();
        const tabIds = tabs.map(tab => tab.id);

        // Get suggestions for all tabs
        const allSuggestions = await getMultipleTabsOptimizationSuggestions(tabIds);

        // Filter by minimum score if specified
        if (minScore > 0) {
          const filteredSuggestions = {};
          
          for (const [tabId, suggestions] of Object.entries(allSuggestions)) {
            try {
              const score = await computeTabScore(parseInt(tabId));
              if (score.totalScore >= minScore) {
                filteredSuggestions[tabId] = suggestions;
              }
            } catch (error) {
              // Skip tabs that can't be scored
              continue;
            }
          }
          
          return filteredSuggestions;
        }

        return allSuggestions;
      } catch (error) {
        console.error('Error in getAllSuggestions API:', error);
        throw error;
      }
    },

    /**
     * GET /resources - Get resource usage for all tabs
     * @param {Object} options - Query options
     * @param {boolean} options.allWindows - Include tabs from all windows
     * @returns {Promise<Object>} Object mapping tabId to resource usage
     */
    async getAllResources(options = {}) {
      const { allWindows = false } = options;

      try {
        const tabs = allWindows ? await getAllTabsAllWindows() : await getAllTabs();
        const tabIds = tabs.map(tab => tab.id);

        return await getMultipleTabsResourceUsage(tabIds);
      } catch (error) {
        console.error('Error in getAllResources API:', error);
        throw error;
      }
    },

    /**
     * GET /scores - Get scores for all tabs
     * @param {Object} options - Query options
     * @param {boolean} options.allWindows - Include tabs from all windows
     * @returns {Promise<Array>} Array of score objects sorted by score
     */
    async getAllScores(options = {}) {
      const { allWindows = false } = options;

      try {
        const tabs = allWindows ? await getAllTabsAllWindows() : await getAllTabs();
        const tabIds = tabs.map(tab => tab.id);

        return await computeMultipleTabScores(tabIds);
      } catch (error) {
        console.error('Error in getAllScores API:', error);
        throw error;
      }
    },
  };
}

// Export a singleton instance for convenience
export const tabsAPI = buildTabsAPI();


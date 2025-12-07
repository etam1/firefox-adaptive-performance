import { useState, useEffect, useMemo, useCallback } from 'react'
import styles from './DoNotTouchHome.module.css'
import IconLogo from '@/assets/icons/icon-logo.png';
import { IoSettingsOutline } from "react-icons/io5";
import { tabsAPI } from '../../services/tabsAPI.js';
import { getCachedData } from '../../services/cacheService.js';

function DoNotTouchHome() {
  const [tabsData, setTabsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch tabs with all stats
  const fetchTabsData = useCallback(async () => {
    try {
      setError(null);
      
      // Try to get cached data first for faster loading
      const cached = await getCachedData();
      
      if (cached && cached.tabs && Object.keys(cached.tabs).length > 0) {
        // Use cached data if available
        const cachedTabs = Object.values(cached.tabs);
        const enrichedTabs = await Promise.all(
          cachedTabs.map(async (tab) => {
            const enriched = { ...tab };
            
            if (cached.resourceUsage && cached.resourceUsage[tab.id]) {
              enriched.resourceUsage = cached.resourceUsage[tab.id];
            } else {
              enriched.resourceUsage = await tabsAPI.getTabResources(tab.id);
            }
            
            if (cached.scores && cached.scores[tab.id]) {
              enriched.score = cached.scores[tab.id];
            } else {
              enriched.score = await tabsAPI.getTabScore(tab.id);
            }
            
            if (cached.suggestions && cached.suggestions[tab.id]) {
              enriched.suggestions = cached.suggestions[tab.id];
            } else {
              enriched.suggestions = await tabsAPI.getTabSuggestions(tab.id);
            }
            
            return enriched;
          })
        );
        
        setTabsData(enrichedTabs);
        setLastUpdate(new Date(cached.lastUpdate));
      } else {
        // Fallback to full API call
        const tabs = await tabsAPI.getTabs({
          includeResources: true,
          includeScores: true,
          includeSuggestions: true,
        });
        
        setTabsData(tabs);
        setLastUpdate(new Date());
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch tabs data:', err);
      setError('Failed to load tabs data. Make sure the extension has proper permissions.');
      setLoading(false);
    }
  }, []);

  // Calculate total stats using useMemo instead of useEffect
  const totalStats = useMemo(() => {
    if (tabsData.length === 0) {
      return {
        totalMemory: 0,
        totalCPU: 0,
        totalTabs: 0,
        averageScore: 0,
      };
    }

    const stats = {
      totalMemory: 0,
      totalCPU: 0,
      totalTabs: tabsData.length,
      totalScore: 0,
    };

    tabsData.forEach(tab => {
      if (tab.resourceUsage) {
        stats.totalMemory += tab.resourceUsage.memory || 0;
        stats.totalCPU += tab.resourceUsage.cpu || 0;
      }
      if (tab.score) {
        stats.totalScore += tab.score.totalScore || 0;
      }
    });

    const averageScore = stats.totalTabs > 0 ? Math.round(stats.totalScore / stats.totalTabs) : 0;

    return {
      totalMemory: Math.round(stats.totalMemory),
      totalCPU: Math.round(stats.totalCPU * 10) / 10,
      totalTabs: stats.totalTabs,
      averageScore,
    };
  }, [tabsData]);

  // Initial fetch and polling
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      await fetchTabsData();
    };
    
    if (isMounted) {
      loadData();
    }
    
    // Poll every 3 seconds for real-time updates
    const interval = setInterval(() => {
      if (isMounted) {
        fetchTabsData();
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchTabsData]);

  const getScoreColor = (score) => {
    if (score < 25) return '#4caf50'; // green
    if (score < 50) return '#ff9800'; // orange
    if (score < 75) return '#ff5722'; // deep orange
    return '#f44336'; // red
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={styles.home}>
      
      <div className={styles.topBar}>
        <img src={IconLogo} width={24} height={24} alt='Logo' />
        
        <div className={styles.topBarRight}>
          <IoSettingsOutline size={24} />
        </div>
      </div>

      <h1>Home</h1>

      {/* Total Stats Box */}
      <div className={styles.statsBox}>
        <h2>Overall Statistics</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Total Tabs</div>
            <div className={styles.statValue}>{totalStats.totalTabs}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Total Memory</div>
            <div className={styles.statValue}>{totalStats.totalMemory} MB</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Total CPU</div>
            <div className={styles.statValue}>{totalStats.totalCPU}%</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Avg Score</div>
            <div 
              className={styles.statValue}
              style={{ color: getScoreColor(totalStats.averageScore) }}
            >
              {totalStats.averageScore}
            </div>
          </div>
        </div>
        {lastUpdate && (
          <div className={styles.lastUpdate}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      {loading && <p className={styles.loading}>Loading stats...</p>}
      
      {error && <p className={styles.error}>{error}</p>}
      
      {!loading && !error && (
        <div className={styles.tabsStatsContainer}>
          <h2>Tab Statistics ({tabsData.length})</h2>
          <div className={styles.tabsStatsList}>
            {tabsData.length === 0 ? (
              <p>No tabs found</p>
            ) : (
              tabsData.map((tab) => (
                <div key={tab.id} className={styles.tabStatsItem}>
                  <div className={styles.tabStatsHeader}>
                    {tab.favIconUrl && (
                      <img 
                        src={tab.favIconUrl} 
                        alt="" 
                        className={styles.favicon}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div className={styles.tabStatsTitle}>
                      <div className={styles.tabTitle}>{tab.title || 'Untitled'}</div>
                      <div className={styles.tabUrl}>{tab.url || ''}</div>
                    </div>
                    {tab.active && <span className={styles.activeBadge}>Active</span>}
                    {tab.pinned && <span className={styles.pinnedBadge}>Pinned</span>}
                  </div>

                  {tab.resourceUsage && (
                    <div className={styles.resourceStats}>
                      <div className={styles.resourceItem}>
                        <span className={styles.resourceLabel}>Memory:</span>
                        <span className={styles.resourceValue}>{tab.resourceUsage.memory} MB</span>
                      </div>
                      <div className={styles.resourceItem}>
                        <span className={styles.resourceLabel}>CPU:</span>
                        <span className={styles.resourceValue}>{tab.resourceUsage.cpu}%</span>
                      </div>
                      {tab.resourceUsage.network && (
                        <div className={styles.resourceItem}>
                          <span className={styles.resourceLabel}>Network:</span>
                          <span className={styles.resourceValue}>
                            {formatBytes(tab.resourceUsage.network.bytesIn)}/s
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {tab.score && (
                    <div className={styles.scoreSection}>
                      <div className={styles.scoreBar}>
                        <div 
                          className={styles.scoreBarFill}
                          style={{ 
                            width: `${tab.score.totalScore}%`,
                            backgroundColor: getScoreColor(tab.score.totalScore)
                          }}
                        />
                      </div>
                      <div className={styles.scoreDetails}>
                        <span className={styles.scoreValue}>
                          Score: {tab.score.totalScore}
                        </span>
                        <span className={styles.scoreBreakdown}>
                          M:{tab.score.breakdown.memory.score} | 
                          C:{tab.score.breakdown.cpu.score} | 
                          A:{tab.score.breakdown.activity.score} | 
                          Media:{tab.score.breakdown.media.score}
                        </span>
                      </div>
                    </div>
                  )}

                  {tab.suggestions && tab.suggestions.length > 0 && (
                    <div className={styles.suggestionsSection}>
                      <div className={styles.suggestionsLabel}>Suggestions:</div>
                      {tab.suggestions.slice(0, 2).map((suggestion, idx) => (
                        <div key={idx} className={styles.suggestionItem}>
                          <span className={styles.suggestionTitle}>{suggestion.title}</span>
                          <span className={styles.suggestionPriority} data-priority={suggestion.priority}>
                            {suggestion.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DoNotTouchHome

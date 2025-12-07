import { useState, useEffect, useCallback, useMemo } from "react";
import "./CPUMemoryBars.css";
import ResourceCard from "../MemoryCPUBars/ResourceCard";
import { tabsAPI } from "../../services/tabsAPI.js";
import { getCachedData } from "../../services/cacheService.js";

export default function CPUMemoryBars() {
    const [tabsData, setTabsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch tabs with resource usage
    const fetchTabsData = useCallback(async () => {
        try {
            setError(null);
            
            // Try cached data first for faster loading
            const cached = await getCachedData();
            
            let enrichedTabs;
            if (cached && cached.tabs && Object.keys(cached.tabs).length > 0) {
                // Use cached data
                const cachedTabs = Object.values(cached.tabs);
                enrichedTabs = await Promise.all(
                    cachedTabs.map(async (tab) => {
                        const enriched = { ...tab };
                        
                        if (cached.resourceUsage && cached.resourceUsage[tab.id]) {
                            enriched.resourceUsage = cached.resourceUsage[tab.id];
                        } else {
                            enriched.resourceUsage = await tabsAPI.getTabResources(tab.id);
                        }
                        
                        return enriched;
                    })
                );
            } else {
                // Fetch from API
                enrichedTabs = await tabsAPI.getTabs({
                    includeResources: true,
                    allWindows: false, // Only current window
                });
            }
            
            setTabsData(enrichedTabs);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch tabs data:', err);
            setError('Failed to load resource data.');
            setLoading(false);
        }
    }, []);

    // Initial fetch and polling
    useEffect(() => {
        let isMounted = true;
        
        const loadData = async () => {
            if (isMounted) {
                await fetchTabsData();
            }
        };
        
        loadData();
        
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

    // Calculate resource statistics
    const resourceStats = useMemo(() => {
        if (tabsData.length === 0) {
            return {
                totalMemory: 0,
                totalCPU: 0,
                activeMemory: 0,
                activeCPU: 0,
                sleepingMemory: 0,
                sleepingCPU: 0,
            };
        }

        let totalMemory = 0;
        let totalCPU = 0;
        let activeMemory = 0;
        let activeCPU = 0;
        let sleepingMemory = 0;
        let sleepingCPU = 0;

        tabsData.forEach(tab => {
            const memory = tab.resourceUsage?.memory || 0;
            const cpu = tab.resourceUsage?.cpu || 0;
            const isSleeping = tab.discarded || false;

            totalMemory += memory;
            totalCPU += cpu;

            if (isSleeping) {
                sleepingMemory += memory;
                sleepingCPU += cpu;
            } else {
                activeMemory += memory;
                activeCPU += cpu;
            }
        });

        return {
            totalMemory: Math.round(totalMemory),
            totalCPU: Math.round(totalCPU * 10) / 10,
            activeMemory: Math.round(activeMemory),
            activeCPU: Math.round(activeCPU * 10) / 10,
            sleepingMemory: Math.round(sleepingMemory),
            sleepingCPU: Math.round(sleepingCPU * 10) / 10,
        };
    }, [tabsData]);

    // Calculate percentages and savings
    const memoryStats = useMemo(() => {
        // Estimate total available memory (we'll use a reasonable default)
        // In a real scenario, you might get this from system APIs
        const estimatedTotalMB = 8000; // 8GB default, adjust as needed
        
        const usedMB = resourceStats.totalMemory;
        const usedPercent = Math.min(100, Math.round((usedMB / estimatedTotalMB) * 100));
        
        // Calculate potential savings from sleeping tabs
        // Savings = what we could save if we put more tabs to sleep
        const potentialSavings = resourceStats.activeMemory > 0 
            ? Math.round((resourceStats.sleepingMemory / resourceStats.totalMemory) * 100)
            : 0;

        return {
            usedPercent,
            totalMb: estimatedTotalMB,
            savingPercent: potentialSavings,
        };
    }, [resourceStats]);

    const cpuStats = useMemo(() => {
        // CPU is already a percentage, but we'll normalize it
        const usedPercent = Math.min(100, Math.round(resourceStats.totalCPU));
        
        // For CPU, we use 100% as the "total" (since CPU is already a percentage)
        const totalMb = 100; // This is just for display, CPU doesn't have MB
        
        // Calculate potential savings
        const potentialSavings = resourceStats.totalCPU > 0
            ? Math.round((resourceStats.sleepingCPU / resourceStats.totalCPU) * 100)
            : 0;

        return {
            usedPercent,
            totalMb,
            savingPercent: potentialSavings,
        };
    }, [resourceStats]);

    // Show loading or error states
    if (loading) {
        return (
            <div className="TextandBars">
                <p className="Title">Browser Usage</p>
                <div className="ResourceCards">
                    <div style={{ padding: '10px', color: '#666', fontSize: '14px' }}>
                        Loading resource data...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="TextandBars">
                <p className="Title">Browser Usage</p>
                <div className="ResourceCards">
                    <div style={{ padding: '10px', color: '#d32f2f', fontSize: '14px' }}>
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="TextandBars">
            <p className="Title">Browser Usage</p>

            <div className="ResourceCards">
                <ResourceCard 
                    label="Memory" 
                    usedPercent={memoryStats.usedPercent} 
                    totalMb={memoryStats.totalMb} 
                    savingPercent={memoryStats.savingPercent} 
                    barColor="#E02950" 
                />
                <ResourceCard 
                    label="CPU" 
                    usedPercent={cpuStats.usedPercent} 
                    totalMb={cpuStats.totalMb} 
                    savingPercent={cpuStats.savingPercent} 
                    barColor="#005E5D" 
                />
            </div>
        </div>
    );
}
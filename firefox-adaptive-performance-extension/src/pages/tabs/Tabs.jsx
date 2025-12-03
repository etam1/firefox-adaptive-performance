import styles from './Tabs.module.css'
import React, { useState, useEffect, useRef } from 'react';

// --- ICONS ---

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 12" fill="none">
    <path d="M12.6 13.5L8.55002 9.45002C8.22859 9.70716 7.85895 9.91073 7.44109 10.0607C7.02323 10.2107 6.57859 10.2857 6.10716 10.2857C4.9393 10.2857 3.95091 9.88127 3.14198 9.07234C2.33305 8.26341 1.92859 7.27502 1.92859 6.10716C1.92859 4.9393 2.33305 3.95091 3.14198 3.14198C3.95091 2.33305 4.9393 1.92859 6.10716 1.92859C7.27502 1.92859 8.26341 2.33305 9.07234 3.14198C9.88127 3.95091 10.2857 4.9393 10.2857 6.10716C10.2857 6.57859 10.2107 7.02323 10.0607 7.44109C9.91073 7.85895 9.70716 8.22859 9.45002 8.55002L13.5 12.6L12.6 13.5ZM6.10716 9.00002C6.91073 9.00002 7.59377 8.71877 8.15627 8.15627C8.71877 7.59377 9.00002 6.91073 9.00002 6.10716C9.00002 5.30359 8.71877 4.62055 8.15627 4.05805C7.59377 3.49555 6.91073 3.2143 6.10716 3.2143C5.30359 3.2143 4.62055 3.49555 4.05805 4.05805C3.49555 4.62055 3.2143 5.30359 3.2143 6.10716C3.2143 6.91073 3.49555 7.59377 4.05805 8.15627C4.62055 8.71877 5.30359 9.00002 6.10716 9.00002Z" fill="#49454F"/>
  </svg>
);

const MoonIcon = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 20 24" fill={filled ? "#808080" : "#808080"} stroke="#808080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#808080" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ChevronIcon = () => (
  <svg width="7" height="7" viewBox="0 0 7 2" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.5 0.5L3.5 3.5L0.5 0.5" stroke="#808080" strokeWidth="1" strokeOpacity="0.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EyeIcon = () => (
  <svg strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" width="21" height="14" viewBox="0 0 21 14" fill="none">
    <path d="M10.5 4.2C9.74052 4.2 9.01214 4.495 8.4751 5.0201C7.93807 5.5452 7.63636 6.25739 7.63636 7C7.63636 7.74261 7.93807 8.4548 8.4751 8.9799C9.01214 9.505 9.74052 9.8 10.5 9.8C11.2595 9.8 11.9879 9.505 12.5249 8.9799C13.0619 8.4548 13.3636 7.74261 13.3636 7C13.3636 6.25739 13.0619 5.5452 12.5249 5.0201C11.9879 4.495 11.2595 4.2 10.5 4.2ZM10.5 11.6667C9.23419 11.6667 8.02023 11.175 7.12517 10.2998C6.23011 9.42466 5.72727 8.23768 5.72727 7C5.72727 5.76232 6.23011 4.57534 7.12517 3.70017C8.02023 2.825 9.23419 2.33333 10.5 2.33333C11.7658 2.33333 12.9798 2.825 13.8748 3.70017C14.7699 4.57534 15.2727 5.76232 15.2727 7C15.2727 8.23768 14.7699 9.42466 13.8748 10.2998C12.9798 11.175 11.7658 11.6667 10.5 11.6667ZM10.5 0C5.72727 0 1.65136 2.90267 0 7C1.65136 11.0973 5.72727 14 10.5 14C15.2727 14 19.3486 11.0973 21 7C19.3486 2.90267 15.2727 0 10.5 0Z" fill="#808080"/>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

// --- MOCK DATA ---
const MOCK_TABS = [
  { id: 1, title: "Google Search for Daniel Lee", icon: "https://www.google.com/favicon.ico", memory: "23 MB", cpu: "1%", lastUsed: "3 Days Ago", isSleeping: false },
  { id: 2, title: "Google Search for Connor Mc...", icon: "https://www.google.com/favicon.ico", memory: "45 MB", cpu: "12%", lastUsed: "1 Day Ago", isSleeping: false },
  { id: 3, title: "Netflix", icon: "https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico", memory: "180 MB", cpu: "25%", lastUsed: "5 Mins Ago", isSleeping: true },
  { id: 4, title: "Spotify", icon: "https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico", memory: "120 MB", cpu: "5%", lastUsed: "2 Hours Ago", isSleeping: false },
];

const Tabs = () => {
  const [tabs, setTabs] = useState(MOCK_TABS);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sorting State
  const [sortBy, setSortBy] = useState("Memory Usage");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortMenuRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sorting Logic
  const getSortedTabs = () => {
    let filtered = tabs.filter(tab => 
      tab.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === "Memory Usage") {
        return parseInt(b.memory) - parseInt(a.memory);
      } else if (sortBy === "CPU Usage") {
        return parseInt(b.cpu || "0") - parseInt(a.cpu || "0");
      } else if (sortBy === "Last Used") {
        const getValue = (str) => {
          if (!str) return 0;
          if (str.includes("Mins")) return 1;
          if (str.includes("Hours")) return 2;
          if (str.includes("Day")) return 3;
          return 4;
        };
        return getValue(a.lastUsed) - getValue(b.lastUsed);
      }
      return 0;
    });
  };

  const handleSleep = (id) => {
    setTabs(prev => prev.map(tab => 
      tab.id === id ? { ...tab, isSleeping: !tab.isSleeping } : tab
    ));
  };

  const handleClose = (id) => {
    setTabs(prev => prev.filter(tab => tab.id !== id));
  };

  const handleSortSelect = (option) => {
    setSortBy(option);
    setIsSortOpen(false);
  };

  const sortedTabs = getSortedTabs();

  return (
    <div className={styles.container}>

      {/* Header with Sort Dropdown */}
      <div className={styles.controlsHeader}>
        <span className={styles.headerLabel}>ALL TABS</span>
        
        {/* Sorting Dropdown Container */}
        <div className={styles.sortContainer} ref={sortMenuRef}>
          <div 
            className={styles.sortDropdown} 
            onClick={() => setIsSortOpen(!isSortOpen)}
          >
            <span>{sortBy}</span>
            <div style={{ marginTop: '2px', display: 'flex' }}>
              <ChevronIcon />
            </div>
          </div>

          {/* Sorting Options Menu */}
          {isSortOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownItem} onClick={() => handleSortSelect("Memory Usage")}>
                Memory Usage
              </div>
              <div className={styles.dropdownItem} onClick={() => handleSortSelect("CPU Usage")}>
                CPU Usage
              </div>
              <div className={styles.dropdownItem} onClick={() => handleSortSelect("Last Used")}>
                Last Used
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.searchWrapper}>
        <input 
          type="text" 
          placeholder="Search..." 
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className={styles.searchIconWrapper}>
          <SearchIcon />
        </div>
      </div>
      {/* Tab List */}
      <div className={styles.tabList}>
        {sortedTabs.map((tab) => (
          <div key={tab.id} className={`${styles.tabCard} ${tab.isSleeping ? styles.sleeping : ''}`}>
            
            <div className={styles.tabLeft}>
              <img src={tab.icon} alt="icon" className={styles.tabIcon} />
              <div className={styles.tabInfo}>
                <div className={styles.tabTitle}>{tab.title}</div>
                <div className={styles.tabMeta}>
                  {sortBy === "CPU Usage" ? (
                     <span className={styles.memory}>{tab.cpu || "0%"} CPU</span>
                  ) : (
                     <span className={styles.memory}>{tab.memory}</span>
                  )}
                  <span className={styles.divider}>|</span>
                  <span>Last Used: {tab.lastUsed}</span>
                </div>
              </div>
            </div>

            <div className={styles.tabActions}>
              <button onClick={() => handleSleep(tab.id)} className={styles.actionBtn} title={tab.isSleeping ? "Wake Up" : "Sleep"}>
                {tab.isSleeping ? <EyeIcon filled={true} /> : <MoonIcon />}
              </button>
              <button onClick={() => handleClose(tab.id)} className={styles.actionBtn}>
                <CloseIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
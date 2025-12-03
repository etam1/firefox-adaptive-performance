import styles from './Tabs.module.css'
import React, { useState } from 'react';

const MOCK_TABS = [
  { id: 1, title: "Google Search for Daniel Lee", icon: "https://www.google.com/favicon.ico", memory: "23 MB", lastUsed: "3 Days Ago", isSleeping: false },
  { id: 2, title: "Google Search for Connor Mc...", icon: "https://www.google.com/favicon.ico", memory: "23 MB", lastUsed: "3 Days Ago", isSleeping: false },
  { id: 3, title: "Netflix", icon: "https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico", memory: "23 MB", lastUsed: "3 Days Ago", isSleeping: true },
  { id: 4, title: "Spotify", icon: "https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico", memory: "23 MB", lastUsed: "3 Days Ago", isSleeping: false },
];

const Tabs = () => {
  const [tabs, setTabs] = useState(MOCK_TABS);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTabs = tabs.filter(tab => 
    tab.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSleep = (id) => {
    setTabs(prev => prev.map(tab => 
      tab.id === id ? { ...tab, isSleeping: !tab.isSleeping } : tab
    ));
  };

  const handleClose = (id) => {
    setTabs(prev => prev.filter(tab => tab.id !== id));
  };

  return (
    <div className={styles.container}>
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

      {/* Header */}
      <div className={styles.controlsHeader}>
        <span className={styles.headerLabel}>ALL TABS</span>
        <div className={styles.sortDropdown}>
          <span>Memory Usage</span>
          <ChevronIcon />
        </div>
      </div>

      {/* Tab List */}
      <div className={styles.tabList}>
        {filteredTabs.map((tab) => (
          <div key={tab.id} className={`${styles.tabCard} ${tab.isSleeping ? styles.sleeping : ''}`}>
            
            <div className={styles.tabLeft}>
              <img src={tab.icon} alt="icon" className={styles.tabIcon} />
              <div className={styles.tabInfo}>
                <div className={styles.tabTitle}>{tab.title}</div>
                <div className={styles.tabMeta}>
                  <span className={styles.memory}>{tab.memory}</span>
                  <span className={styles.divider}>|</span>
                  <span>Last Used: {tab.lastUsed}</span>
                </div>
              </div>
            </div>

            <div className={styles.tabActions}>
              <button onClick={() => handleSleep(tab.id)} className={styles.actionBtn}>
                <MoonIcon filled={tab.isSleeping} />
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

const SearchIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 16 12" 
    fill="none">
    <path d="M12.6 13.5L8.55002 9.45002C8.22859 9.70716 7.85895 9.91073 7.44109 10.0607C7.02323 10.2107 6.57859 10.2857 6.10716 10.2857C4.9393 10.2857 3.95091 9.88127 3.14198 9.07234C2.33305 8.26341 1.92859 7.27502 1.92859 6.10716C1.92859 4.9393 2.33305 3.95091 3.14198 3.14198C3.95091 2.33305 4.9393 1.92859 6.10716 1.92859C7.27502 1.92859 8.26341 2.33305 9.07234 3.14198C9.88127 3.95091 10.2857 4.9393 10.2857 6.10716C10.2857 6.57859 10.2107 7.02323 10.0607 7.44109C9.91073 7.85895 9.70716 8.22859 9.45002 8.55002L13.5 12.6L12.6 13.5ZM6.10716 9.00002C6.91073 9.00002 7.59377 8.71877 8.15627 8.15627C8.71877 7.59377 9.00002 6.91073 9.00002 6.10716C9.00002 5.30359 8.71877 4.62055 8.15627 4.05805C7.59377 3.49555 6.91073 3.2143 6.10716 3.2143C5.30359 3.2143 4.62055 3.49555 4.05805 4.05805C3.49555 4.62055 3.2143 5.30359 3.2143 6.10716C3.2143 6.91073 3.49555 7.59377 4.05805 8.15627C4.62055 8.71877 5.30359 9.00002 6.10716 9.00002Z" fill="#49454F"/>
  </svg>
);

const MoonIcon = ({ filled }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 20 24" 
    fill={filled ? "#808080" : "none"} 
    stroke="#808080" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const CloseIcon = () => (
  <svg 
    width="22" 
    height="22"
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#808080" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ChevronIcon = () => (
  <svg 
    width="7" 
    height="7" 
    viewBox="0 0 7 2" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M6.5 0.5L3.5 3.5L0.5 0.5" 
      stroke="#808080"
      strokeWidth="1"
      stroke-opacity="0.75"
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

export default Tabs;
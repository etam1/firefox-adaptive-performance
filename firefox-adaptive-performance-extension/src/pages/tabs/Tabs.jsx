import styles from './Tabs.module.css'
import React, { useState, useEffect, useRef } from 'react';

// --- ICONS ---

const SearchIcon = () => (
  <svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="20" 
  height="20" 
  viewBox="0 0 16 16" 
  fill="none">
    <path d="M12.6 13.5L8.55002 9.45002C8.22859 9.70716 7.85895 9.91073 7.44109 10.0607C7.02323 10.2107 6.57859 10.2857 6.10716 10.2857C4.9393 10.2857 3.95091 9.88127 3.14198 9.07234C2.33305 8.26341 1.92859 7.27502 1.92859 6.10716C1.92859 4.9393 2.33305 3.95091 3.14198 3.14198C3.95091 2.33305 4.9393 1.92859 6.10716 1.92859C7.27502 1.92859 8.26341 2.33305 9.07234 3.14198C9.88127 3.95091 10.2857 4.9393 10.2857 6.10716C10.2857 6.57859 10.2107 7.02323 10.0607 7.44109C9.91073 7.85895 9.70716 8.22859 9.45002 8.55002L13.5 12.6L12.6 13.5ZM6.10716 9.00002C6.91073 9.00002 7.59377 8.71877 8.15627 8.15627C8.71877 7.59377 9.00002 6.91073 9.00002 6.10716C9.00002 5.30359 8.71877 4.62055 8.15627 4.05805C7.59377 3.49555 6.91073 3.2143 6.10716 3.2143C5.30359 3.2143 4.62055 3.49555 4.05805 4.05805C3.49555 4.62055 3.2143 5.30359 3.2143 6.10716C3.2143 6.91073 3.49555 7.59377 4.05805 8.15627C4.62055 8.71877 5.30359 9.00002 6.10716 9.00002Z" fill="#49454F"/>
  </svg>
);

const MoonIcon = () => (
  <svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="14" 
  height="14" 
  viewBox="0 0 14 14" 
  fill="none">
    <path d="M6.88477 13.7695C10.6872 13.7695 13.7695 10.6872 13.7695 6.88477C13.7695 6.566 13.2917 6.51299 13.1272 6.78631C12.7762 7.36762 12.2976 7.86144 11.7275 8.23037C11.1574 8.5993 10.5109 8.83366 9.83684 8.91571C9.16278 8.99775 8.47889 8.92532 7.83696 8.70391C7.19504 8.4825 6.61192 8.11791 6.13177 7.63776C5.65162 7.15761 5.28703 6.57449 5.06562 5.93257C4.84421 5.29065 4.77178 4.60675 4.85383 3.93269C4.93587 3.25863 5.17023 2.61208 5.53916 2.04201C5.90809 1.47194 6.40191 0.993303 6.98322 0.642349C7.25654 0.477114 7.20353 0 6.88477 0C3.08231 0 0 3.08231 0 6.88477C0 10.6872 3.08231 13.7695 6.88477 13.7695Z" fill="#808080"/>
  </svg>
);

const CloseIcon = () => (
  <svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="13" 
  height="13" 
  viewBox="0 0 13 13" 
  fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M0.209457 0.209457C0.343745 0.0753347 0.52578 0 0.715575 0C0.905371 0 1.08741 0.0753347 1.22169 0.209457L12.681 11.6687C12.7514 11.7343 12.8078 11.8134 12.8469 11.9012C12.8861 11.9891 12.9071 12.0839 12.9088 12.1801C12.9105 12.2763 12.8928 12.3718 12.8568 12.461C12.8208 12.5501 12.7672 12.6312 12.6992 12.6992C12.6312 12.7672 12.5501 12.8208 12.461 12.8568C12.3718 12.8928 12.2763 12.9105 12.1801 12.9088C12.0839 12.9071 11.9891 12.8861 11.9012 12.8469C11.8134 12.8078 11.7343 12.7514 11.6687 12.681L0.209457 1.22169C0.0753347 1.08741 0 0.905371 0 0.715575C0 0.52578 0.0753347 0.343745 0.209457 0.209457Z" fill="#808080"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M12.681 0.209457C12.8151 0.343745 12.8904 0.52578 12.8904 0.715575C12.8904 0.905371 12.8151 1.08741 12.681 1.22169L1.22167 12.681C1.0859 12.8075 0.906329 12.8764 0.720783 12.8731C0.535237 12.8698 0.358205 12.7947 0.226984 12.6634C0.0957623 12.5322 0.0205972 12.3552 0.0173235 12.1696C0.0140498 11.9841 0.0829229 11.8045 0.209433 11.6687L11.6687 0.209457C11.803 0.0753347 11.985 0 12.1748 0C12.3646 0 12.5467 0.0753347 12.681 0.209457Z" fill="#808080"/>
  </svg>
);

const ChevronIcon = () => (
  <svg 
  width="7" 
  height="7" 
  viewBox="0 0 7 2" 
  fill="none" 
  xmlns="http://www.w3.org/2000/svg">
    <path d="M6.5 0.5L3.5 3.5L0.5 0.5" 
    stroke="#808080" 
    strokeWidth="1" 
    strokeOpacity="0.75" 
    strokeLinecap="round" 
    strokeLinejoin="round" />
  </svg>
);

const EyeIcon = () => (
  <svg 
  strokeLinecap="round" 
  strokeLinejoin="round" 
  xmlns="http://www.w3.org/2000/svg" 
  width="21" 
  height="14" 
  viewBox="0 0 21 14" 
  fill="none">
    <path d="M10.5 4.2C9.74052 4.2 9.01214 4.495 8.4751 5.0201C7.93807 5.5452 7.63636 6.25739 7.63636 7C7.63636 7.74261 7.93807 8.4548 8.4751 8.9799C9.01214 9.505 9.74052 9.8 10.5 9.8C11.2595 9.8 11.9879 9.505 12.5249 8.9799C13.0619 8.4548 13.3636 7.74261 13.3636 7C13.3636 6.25739 13.0619 5.5452 12.5249 5.0201C11.9879 4.495 11.2595 4.2 10.5 4.2ZM10.5 11.6667C9.23419 11.6667 8.02023 11.175 7.12517 10.2998C6.23011 9.42466 5.72727 8.23768 5.72727 7C5.72727 5.76232 6.23011 4.57534 7.12517 3.70017C8.02023 2.825 9.23419 2.33333 10.5 2.33333C11.7658 2.33333 12.9798 2.825 13.8748 3.70017C14.7699 4.57534 15.2727 5.76232 15.2727 7C15.2727 8.23768 14.7699 9.42466 13.8748 10.2998C12.9798 11.175 11.7658 11.6667 10.5 11.6667ZM10.5 0C5.72727 0 1.65136 2.90267 0 7C1.65136 11.0973 5.72727 14 10.5 14C15.2727 14 19.3486 11.0973 21 7C19.3486 2.90267 15.2727 0 10.5 0Z" fill="#808080"/>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

// --- MOCK DATA ---
const MOCK_TABS = [
  { id: 1, title: "Google Search for Daniel Lee", icon: "https://www.google.com/favicon.ico", memory: "23 MB", cpu: "1%", lastUsed: "3 Days Ago", isSleeping: false },
  { id: 2, title: "Google Search for Connor Mc...", icon: "https://www.google.com/favicon.ico", memory: "45 MB", cpu: "12%", lastUsed: "1 Day Ago", isSleeping: false },
  { id: 3, title: "Netflix", icon: "https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico", memory: "180 MB", cpu: "25%", lastUsed: "5 Mins Ago", isSleeping: false },
  { id: 4, title: "Spotify", icon: "https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico", memory: "120 MB", cpu: "5%", lastUsed: "2 Hours Ago", isSleeping: false },
  { id: 5, title: "CalCentral", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Seal_of_University_of_California%2C_Berkeley.svg", memory: "120 MB", cpu: "5%", lastUsed: "2 Hours Ago", isSleeping: false },
];

const Tabs = () => {
  const [tabs, setTabs] = useState(MOCK_TABS);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [sortBy, setSortBy] = useState("Memory Usage");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortMenuRef = useRef(null);

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
      {/* Header */}
      <div className={styles.controlsHeader}>
        <span className={styles.headerLabel}>ALL TABS</span>
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

      {/* Search Bar */}
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

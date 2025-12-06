// import { useState } from 'react'
// import styles from './NavBar.module.css'
import Home from './pages/home/Home.jsx'
import DoNotTouchHome from './pages/home/DoNotTouchHome.jsx'
import Tabs from './pages/tabs/Tabs.jsx'
import Settings from './pages/settings/Settings.jsx'
// import homeIcon from './assets/home.svg'
// import tabsIcon from './assets/tabs.svg'
// import settingsIcon from './assets/settings.svg'
// import logoIcon from './assets/logo.svg'

function NavBar() {
  // const [currentPage, setCurrentPage] = useState('home')

  // const renderPage = () => {
  //   switch (currentPage) {
  //     case 'home':
  //       return <Home />
  //     case 'tabs':
  //       return <Tabs />
  //     case 'settings':
  //       return <Settings />
  //     default:
  //       return <Home />
  //   }
  // }

  return (
    <>
      {/* <nav className={styles.navbar}>
        <img src={logoIcon} alt="Logo" className={styles.logo} />
        <div className={styles.navButtons}>
          <button 
            className={`${styles.navButton} ${currentPage === 'home' ? styles.active : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            <img src={homeIcon} alt="Home" />
          </button>
          <button 
            className={`${styles.navButton} ${currentPage === 'tabs' ? styles.active : ''}`}
            onClick={() => setCurrentPage('tabs')}
          >
            <img src={tabsIcon} alt="Tabs" />
          </button>
          <button 
            className={`${styles.navButton} ${currentPage === 'settings' ? styles.active : ''}`}
            onClick={() => setCurrentPage('settings')}
          >
            <img src={settingsIcon} alt="Settings" />
          </button>
        </div>
      </nav>

      {/* This shows the current page - Home, Tabs, or Settings */}
      {/* <div className={styles.content}>
        {renderPage()}
      </div> */}
      <Home />
    </>
  )
}

export default NavBar


import { useState } from 'react'
import styles from './NavBar.module.css'
import Home from './pages/home/Home.jsx'
import Tabs from './pages/tabs/Tabs.jsx'
import Settings from './pages/settings/Settings.jsx'

function NavBar() {
  const [currentPage, setCurrentPage] = useState('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />
      case 'tabs':
        return <Tabs />
      case 'settings':
        return <Settings />
      default:
        return <Home />
    }
  }

  return (
    <>
      <nav className={styles.navbar}>
        <button 
          className={`${styles.navButton} ${currentPage === 'home' ? styles.active : ''}`}
          onClick={() => setCurrentPage('home')}
        >
          Home
        </button>
        <button 
          className={`${styles.navButton} ${currentPage === 'tabs' ? styles.active : ''}`}
          onClick={() => setCurrentPage('tabs')}
        >
          Tabs
        </button>
        <button 
          className={`${styles.navButton} ${currentPage === 'settings' ? styles.active : ''}`}
          onClick={() => setCurrentPage('settings')}
        >
          Settings
        </button>
      </nav>
      <div className={styles.content}>
        {renderPage()}
      </div>
    </>
  )
}

export default NavBar


import styles from './Home.module.css'
import IconLogo from '@/assets/icons/icon-logo.png';
import { IoSettingsOutline } from "react-icons/io5";


function Home() {
  return (
    <div className={styles.home}>
      
      <div className={styles.topBar}>
        <img src={IconLogo} width={24} height={24} alt='Logo' />
        
        <div className={styles.topBarRight}>
          <IoSettingsOutline size={24} />
        </div>
      </div>

      <h1>Home</h1>
      <p>ethan was here</p>
      <p>everyone zelle ethan 10000 dollars @312-493-0018</p>
      <p>Testing 123</p>
    </div>


  )
}

export default Home


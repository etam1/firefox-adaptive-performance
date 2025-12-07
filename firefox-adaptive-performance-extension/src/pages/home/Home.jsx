import './Home.css'
import IconLogo from '@/assets/icons/icon-logo.png';
import { IoSettingsOutline } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import APHeader from '@/components/AdaptivePerformanceHeader/APHeader.jsx';
import SuggestedActions from '@/components/SuggestedActions/SuggestedActions.jsx';
import CPUMemoryBars from '../../components/CPUMemoryBars/CPUMemoryBars';
import Tabs from '../tabs/Tabs';
import LogoVector from '../../assets/VectorIcons/LogoVector';
import SettingsIcon from '../../assets/VectorIcons/SettingsIcon/SettingsIcon';
import CloseIcon from '../../assets/VectorIcons/CloseIcon/CloseIcon';
import TabCard from '../../components/TabCard/TabCard';


function Home() {



  return (
        
    <div className="home">

{/* This is the top bar */}
      <div className="topBar">
        {/* <img src={IconLogo} width={24} height={24} alt='Logo' /> */}
        <LogoVector size={24}/>
        
        <div className="topBarRight">
          <SettingsIcon />
          <CloseIcon />
        </div>
      </div>


  <div className="HeaderandSuggested">
    {/* This is the title of the section */}
      <div className="APHeader">
        <APHeader />
      </div>

    {/* This is the suggested actions       */}
      <div className="SuggestedActions">
        <SuggestedActions />
      </div>

      <div>
      </div>

  </div>


{/* This is browser usage */}
    <div className="MemoryandTabs">
      <CPUMemoryBars />

      <Tabs />
    </div>

    

    </div>

  )
}

export default Home
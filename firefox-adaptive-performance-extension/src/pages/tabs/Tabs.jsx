import styles from "./Tabs.module.css";
import MemoryPopUp from "../../components/PopUps/MemoryPopUp/MemoryPopUp.jsx";

function Tabs() {
  return (
    <div className={styles.tabs}>
      <h1>Tabs</h1>
      <p>Manage your browser tabs here</p>

      {/* Show your popup here */}
      <MemoryPopUp variant="high" />

      {/* You can add more if you want */}
      {/* <MemoryPopUp variant="medium" /> */}
      {/* <MemoryPopUp variant="low" /> */}
    </div>
  );
}

export default Tabs;

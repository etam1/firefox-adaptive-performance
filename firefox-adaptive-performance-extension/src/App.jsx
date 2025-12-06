import styles from "./App.module.css";
import NavBar from "./NavBar.jsx";
import React from "react";
import MemoryPopUp from "./components/PopUps/MemoryPopUp/MemoryPopUp";

function App() {
  return (
    <div className={styles.app}>
      <NavBar />
    </div>
  );
}

export default App;

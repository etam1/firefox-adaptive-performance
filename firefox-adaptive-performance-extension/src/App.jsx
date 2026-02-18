import styles from "./App.module.css";
import NavBar from "./NavBar.jsx";
import React from "react";

function App() {
  return (
    <div className={styles.app}>
      <NavBar />
    </div>
  );
}

export default App;

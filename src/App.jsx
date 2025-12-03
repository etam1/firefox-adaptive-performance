import React from "react";
import ResourceCard from "./components/ResourceCard.jsx";

export default function App() {
  const resources = [
    {
      label: "Memory",
      usedPercent: 75,
      totalMb: 500,
      savingPercent: 23,
      barColor: "#d64052", // red-ish
    },
    {
      label: "CPU",
      usedPercent: 15,
      totalMb: 500,
      savingPercent: 67,
      barColor: "#185b5a", // teal-ish
    },
  ];

  return (
    <div className="page">
      <div className="popup">
        {resources.map((res) => (
          <ResourceCard key={res.label} {...res} />
        ))}

        <div className="search-wrapper">
          <input
            className="search-input"
            placeholder="Search..."
            type="text"
          />
          <span className="search-icon" aria-hidden="true">
            🔍
          </span>
        </div>
      </div>
    </div>
  );
}

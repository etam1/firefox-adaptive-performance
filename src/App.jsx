import React from "react";
import ResourceCard from "./components/ResourceCard.jsx";

export default function App() {
  const resources = [
    {
      label: "Memory",
      usedPercent: 75,
      totalMb: 500,
      savingPercent: 23,
      barColor: "#D64052", // match figma-ish
    },
    {
      label: "CPU",
      usedPercent: 15,
      totalMb: 500,
      savingPercent: 67,
      barColor: "#185B5A",
    },
  ];

  return (
    <div className="page">
      <div className="popup">
        {resources.map((res) => (
          <ResourceCard key={res.label} {...res} />
        ))}
      </div>
    </div>
  );
}


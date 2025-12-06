UsageBar.jsx

import React from "react";

export default function UsageBar({ percent, color }) {
  return (
    <div className="usage-bar">
      <div
        className="usage-bar-fill"
        style={{
          width: `${percent}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}


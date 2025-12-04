import React from "react";
import UsageBar from "./UsageBar.jsx";

export default function ResourceCard({
  label,
  usedPercent,
  totalMb,
  savingPercent,
  barColor,
}) {
  return (
    <section className="resource-card">
      <div className="resource-header">
        <div className="resource-title">
          <span className="resource-label">{label}</span>
        </div>

        <div className="resource-usage">
          <span className="resource-percent">{usedPercent}%</span>
          <span className="resource-total">of {totalMb} MB</span>
        </div>
      </div>

      <UsageBar percent={usedPercent} color={barColor} />

      <div className="resource-footer">
        <span className="check-circle">✓</span>
        <span className="saving-text">
          Saving {savingPercent}% of {label}
        </span>
      </div>
    </section>
  );
}


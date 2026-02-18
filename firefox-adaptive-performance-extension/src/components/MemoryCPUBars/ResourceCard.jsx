import UsageBar from "./UsageBar.jsx";
import "./ResourceCard.css";
import CPUPopUp from "../PopUps/CPUPopUp/CPUPopUp";
import MemoryPopUp from "../PopUps/MemoryPopUp/MemoryPopUp";

// Helper function to determine variant based on usage percentage
function getVariant(percent) {
  if (percent >= 75) return "high";
  if (percent >= 50) return "medium";
  return "low";
}

export default function ResourceCard({
  label,
  usedPercent,
  totalMb,
  savingPercent,
  barColor,
  showSuggestedActions = false,
}) {
  const variant = getVariant(usedPercent);

  return (
    <section className="resource-card">
      <div className="resource-header">
        <div className="resource-title">
          <span className="resource-label">{label}</span>
          {label === "CPU" && <CPUPopUp variant={variant} />}
          {label === "Memory" && <MemoryPopUp variant={variant} />}
        </div>

        <div className="resource-usage">
          <span className="resource-percent">{usedPercent}%</span>
          <span className="resource-total">of {totalMb} MB</span>
        </div>
      </div>

      <UsageBar percent={usedPercent} color={barColor} />

      {showSuggestedActions && (
        <div className="resource-footer">
          <span className="check-circle">✓</span>
          <span className="saving-text">
            Saving {savingPercent}% of {label}
          </span>
        </div>
      )}
    </section>
  );
}


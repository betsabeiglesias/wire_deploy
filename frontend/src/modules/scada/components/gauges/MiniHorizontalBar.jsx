import { clampPercent } from "../../utils";

export const MiniHorizontalBar = ({ percent, label }) => {
  const normalized = clampPercent(percent);
  return (
    <div className="mini-gauge horizontal-gauge">
      <div className="mini-bar-track">
        <div className="mini-bar-fill" style={{ width: `${normalized}%` }}></div>
      </div>
      <div className="mini-bar-label">{label}</div>
    </div>
  );
};

export const PressTrendGauge = ({ value, unit, label = "press", trend = 0 }) => (
  <div className="mini-gauge press-card">
    <div className="press-header">
      <span className="press-title">{label}</span>
      <span className={`press-trend ${trend >= 0 ? "up" : "down"}`}>
        {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%
      </span>
    </div>
    <div className="press-value">
      {value}
      {unit && <span>{unit}</span>}
    </div>
  </div>
);

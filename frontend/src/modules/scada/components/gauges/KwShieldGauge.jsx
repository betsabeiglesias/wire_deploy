export const KwShieldGauge = ({ value, unit, label }) => (
  <div className="mini-gauge kw-card">
    <div className="kw-icon">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <path
          d="M10 10l1.8-3.2a.6.6 0 011.05 0L14 10h1.6a.4.4 0 01.32.64L14 13l1.92 2.36a.4.4 0 01-.32.64H14l-1.15 2.68a.6.6 0 01-1.1 0L10.6 16H9a.4.4 0 01-.32-.64L10.6 13 8.68 10.64A.4.4 0 019 10h1z"
          fill="#ffffff"
          opacity="0.85"
        />
      </svg>
    </div>
    <div className="kw-meta">
      <div className="kw-value-row">
        <div className="kw-value">{value}</div>
        <div className="kw-unit">{unit || "kW"}</div>
      </div>
      <div className="kw-label">{label || "power"}</div>
    </div>
  </div>
);

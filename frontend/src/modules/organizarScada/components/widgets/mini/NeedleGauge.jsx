import React from "react";

export default function NeedleGauge({
  percent,
  value,
  unit,
  primaryColor = "#00b894",
  secondaryColor = "#636e72",
}) {
  const center = 70;
  const radius = 58;
  const startAngle = -135;
  const endAngle = 135;
  const range = endAngle - startAngle;
  const arcEndAngle = startAngle + (range * percent) / 100;

  const toCartesian = (angle) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    };
  };

  const polarArc = (start, end) => {
    const startPt = toCartesian(end);
    const endPt = toCartesian(start);
    const flag = end - start <= 180 ? "0" : "1";
    return `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 ${flag} 0 ${endPt.x} ${endPt.y}`;
  };

  const track = polarArc(startAngle, endAngle);
  const progress = percent <= 0 ? null : polarArc(startAngle, arcEndAngle);
  const pointer = toCartesian(arcEndAngle);

  return (
    <div className="mini-gauge needle-gauge">
      <svg viewBox="0 0 160 160">
        <path d={track} stroke={secondaryColor} fill="none" strokeWidth="6" />
        {progress && (
          <path d={progress} stroke={primaryColor} fill="none" strokeWidth="6" />
        )}
        <line
          x1={center}
          y1={center}
          x2={pointer.x}
          y2={pointer.y}
          stroke={primaryColor}
          strokeWidth="3"
        />
        <circle cx={center} cy={center} r="6" fill={primaryColor} />
      </svg>

      <div className="needle-value" style={{ color: primaryColor }}>
        {value}
        {unit && <span>{unit}</span>}
      </div>
    </div>
  );
}
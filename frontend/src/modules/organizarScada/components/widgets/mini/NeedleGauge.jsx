import React from "react";

export default function NeedleGauge({ percent, value, unit }) {
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
      <svg viewBox="0 0 160 160" className="needle-svg">
        <path className="needle-track" d={track}></path>
        {progress && <path className="needle-progress" d={progress}></path>}
        <line
          x1={center}
          y1={center}
          x2={pointer.x}
          y2={pointer.y}
          className="needle-pointer"
        ></line>
        <circle cx={center} cy={center} r="6" className="needle-center"></circle>
      </svg>
      <div className="needle-value">
        {value}
        {unit && <span>{unit}</span>}
      </div>
    </div>
  );
}

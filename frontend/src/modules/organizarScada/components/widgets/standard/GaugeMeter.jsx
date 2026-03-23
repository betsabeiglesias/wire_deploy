// src/components/GaugeMeter.jsx
import React, { useState, useEffect } from "react";
import gaugeBaseNew from "@/assets/images/r1.png";
import gaugeNeedleNew from "@/assets/images/a.png";

const GaugeMeter = ({
  initialValue = 0,
  minValue = 0,
  maxValue = 100,
  label = "Velocidad",
  unit = "%",
  showInput = true,
  showScroll = true,
  width = 150,
  height = 100,
  isThermometer = false, // compatibilidad
  arcStartColor = "#22c55e",
  arcMidColor = "#fbbf24",
  arcEndColor = "#ef4444",
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(Math.max(minValue, Math.min(maxValue, initialValue)));
  }, [initialValue, minValue, maxValue]);

  const startAngle = -120;
  const endAngle = 120;

  const calculateRotation = (val) => {
    if (maxValue - minValue === 0) return startAngle;
    const normalizedValue = (val - minValue) / (maxValue - minValue);
    const rotation = startAngle + normalizedValue * (endAngle - startAngle);
    return Math.max(startAngle, Math.min(endAngle, rotation));
  };

  const currentAngle = calculateRotation(value);

  const handleInputChange = (e) => {
    let newValue = parseFloat(e.target.value);
    if (isNaN(newValue)) newValue = minValue;
    newValue = Math.max(minValue, Math.min(maxValue, newValue));
    setValue(newValue);
  };

  const renderNewGauge = () => {
    const rotationStyle = {
      transform: `rotate(${currentAngle}deg)`,
      transition: "transform 0.5s ease-out",
    };

    const size = Math.min(width, height);
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.42;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const arcPath = () => {
      const startRad = toRad(startAngle);
      const endRad = toRad(endAngle);
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      const startX = cx + radius * Math.cos(startRad);
      const startY = cy + radius * Math.sin(startRad);
      const endX = cx + radius * Math.cos(endRad);
      const endY = cy + radius * Math.sin(endRad);
      return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
    };

    return (
      <div
        className="relative flex items-center justify-center max-w-full max-h-full flex-shrink min-h-[50px]"
        style={{ width: size, height: size }}
      >
        <svg
          className="absolute inset-0"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient id="gaugeArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={arcStartColor} />
              <stop offset="50%" stopColor={arcMidColor} />
              <stop offset="100%" stopColor={arcEndColor} />
            </linearGradient>
          </defs>
          <path
            d={arcPath()}
            fill="none"
            stroke="url(#gaugeArcGrad)"
            strokeWidth={size * 0.08}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <img
          src={gaugeBaseNew}
          alt="Base del medidor"
          className="w-full h-full object-contain"
        />
        <img
          src={gaugeNeedleNew}
          alt="Aguja del medidor"
          className="absolute w-3/5 h-2/8 object-contain origin-bottom orgin-[50%_95%] -top-[-25%] left-[19.7%]"
          style={rotationStyle}
        />

        <div className="absolute bottom-1/4 text-[clamp(0.7rem,4vw,1.2rem)] font-bold text-white bg-black/70 px-2 py-[2px] rounded">
          {value.toFixed(0)}
          {unit}
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col items-center justify-between p-[5px] box-border w-full h-full"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {renderNewGauge()}

      {showScroll && (
        <input
          type="range"
          min={minValue}
          max={maxValue}
          step="1"
          value={value}
          onChange={handleInputChange}
          className="w-4/5 mt-[5px] flex-shrink-0"
        />
      )}
    </div>
  );
};

export default GaugeMeter;

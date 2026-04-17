import React from "react";

const shapeStyles = {
  rect: { fill: "#e2e8f0", stroke: "#1e293b" },
  circle: { fill: "#e2e8f0", stroke: "#1e293b" },
  diamond: { fill: "#e2e8f0", stroke: "#1e293b" },
  cylinder: { fill: "#e2e8f0", stroke: "#1e293b" },
};

const SvgShape = ({
  shape = "rect",
  width = 160,
  height = 90,
  stroke = "#1e293b",
  strokeWidth = 2,
  fill,
  rx = 6,
  onSelect,
  isSelected = false,
}) => {
  const base = shapeStyles[shape] || shapeStyles.rect;
  const fillColor = fill || base.fill;
  const strokeColor = stroke || base.stroke;

  const body =
    shape === "circle" ? (
      <circle cx={width / 2} cy={height / 2} r={Math.min(width, height) / 2} />
    ) : shape === "diamond" ? (
      <polygon points={`${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`} />
    ) : shape === "cylinder" ? (
      <g>
        <rect x={0} y={10} width={width} height={height - 20} />
        <ellipse cx={width / 2} cy={10} rx={width / 2} ry={10} />
        <ellipse cx={width / 2} cy={height - 10} rx={width / 2} ry={10} />
      </g>
    ) : (
      <rect width={width} height={height} rx={rx} ry={rx} />
    );

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <g
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill={fillColor}
        onClick={onSelect}
        style={{ cursor: "pointer" }}
        className={isSelected ? "drop-shadow-[0_0_0_2px_rgba(56,189,248,0.35)]" : ""}
      >
        <rect width={width} height={height} fill="transparent" stroke="none" />
        {body}
      </g>
    </svg>
  );
};

export default SvgShape;
// import React, { useMemo } from "react";

// const toDeg = (rad) => (rad * 180) / Math.PI;
// const toRad = (deg) => (deg * Math.PI) / 180;

// const arcPath = (cx, cy, r, startDeg, endDeg) => {
//   const start = {
//     x: cx + r * Math.cos(toRad(startDeg)),
//     y: cy + r * Math.sin(toRad(startDeg)),
//   };
//   const end = {
//     x: cx + r * Math.cos(toRad(endDeg)),
//     y: cy + r * Math.sin(toRad(endDeg)),
//   };
//   const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
//   return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
// };

// const TempGauge = ({ width = 180, height = 140, settings = {} }) => {
//   const cx = width / 2;
//   const cy = height / 2 + 10;
//   const radius = Math.min(width, height) / 2 - 16;
//   const start = 210;
//   const end = -30;
//   const min = settings.min ?? 0;
//   const max = settings.max ?? 140;
//   const value = settings.initialValue ?? 89;
//   const norm = Math.max(0, Math.min(1, (value - min) / (max - min)));
//   const valueAngle = start + (end - start) * norm;

//   return (
//     <g strokeLinecap="round">
//       <path
//         d={arcPath(cx, cy, radius, start, end)}
//         stroke={settings.arcStartColor || "#f97316"}
//         strokeWidth={10}
//         fill="none"
//         vectorEffect="non-scaling-stroke"
//       />
//       <line
//         x1={cx}
//         y1={cy}
//         x2={cx + (radius - 6) * Math.cos(toRad(valueAngle))}
//         y2={cy + (radius - 6) * Math.sin(toRad(valueAngle))}
//         stroke={settings.needleColor || "#ffffff"}
//         strokeWidth={4}
//         vectorEffect="non-scaling-stroke"
//       />
//       <circle cx={cx} cy={cy} r={5} fill={settings.needleColor || "#ffffff"} />
//       <text
//         x={cx}
//         y={cy + 22}
//         textAnchor="middle"
//         fontFamily="Inter, Arial, sans-serif"
//         fontSize={14}
//         fontWeight="700"
//         fill="#0f172a"
//       >
//         {Math.round(value)} {settings.unit || ""}
//       </text>
//     </g>
//   );
// };

// const PowerCard = ({ width = 180, height = 120, settings = {} }) => {
//   return (
//     <g>
//       <rect
//         x={0}
//         y={0}
//         width={width}
//         height={height}
//         rx={10}
//         fill="#0f172a"
//         stroke="#1f2937"
//         strokeWidth={2}
//         vectorEffect="non-scaling-stroke"
//       />
//       <text
//         x={width / 2}
//         y={height / 2 - 6}
//         textAnchor="middle"
//         fontFamily="Inter, Arial, sans-serif"
//         fontSize={28}
//         fontWeight="700"
//         fill="#e5e7eb"
//       >
//         {settings.initialValue ?? 415}
//       </text>
//       <text
//         x={width / 2}
//         y={height / 2 + 18}
//         textAnchor="middle"
//         fontFamily="Inter, Arial, sans-serif"
//         fontSize={16}
//         fontWeight="600"
//         fill="#38bdf8"
//       >
//         {settings.unit || "kW"}
//       </text>
//     </g>
//   );
// };

// const EnergyBarChart = ({ width = 400, height = 250, settings = {} }) => {
//   const bars = settings.series || [80, 120, 140, 160, 200];
//   const maxVal = Math.max(...bars, 200);
//   const barWidth = width / (bars.length * 1.8);
//   return (
//     <g>
//       <rect
//         x={0}
//         y={0}
//         width={width}
//         height={height}
//         fill="#0b1623"
//         rx={8}
//         stroke="#1f2937"
//         strokeWidth={1.5}
//         vectorEffect="non-scaling-stroke"
//       />
//       {bars.map((v, idx) => {
//         const h = (v / maxVal) * (height - 40);
//         const x = 20 + idx * barWidth * 1.6;
//         const y = height - 20 - h;
//         return (
//           <rect
//             key={idx}
//             x={x}
//             y={y}
//             width={barWidth}
//             height={h}
//             fill={settings.barGradientFrom || "#00d2d3"}
//             vectorEffect="non-scaling-stroke"
//           />
//         );
//       })}
//     </g>
//   );
// };

// const normalizeElement = (el) => {
//   if (!el) return null;
//   const flatData = el.data?.data ? el.data.data : el.data;
//   return {
//     id: el.id,
//     x: el.x ?? 0,
//     y: el.y ?? 0,
//     data: {
//       type: flatData?.type,
//       width: flatData?.width,
//       height: flatData?.height,
//       settings: flatData?.settings || {},
//       label: flatData?.label,
//     },
//   };
// };

// const ScadaCanvas = ({ elements = [], onMouseDown, selectedId, onSelect }) => {
//   const normalized = useMemo(
//     () => elements.map(normalizeElement).filter(Boolean),
//     [elements],
//   );

//   const renderElement = (el) => {
//     const { id, x, y, data } = el;
//     const { type, width = 200, height = 120, settings = {} } = data || {};

//     const hitArea = (
//       <rect
//         width={width}
//         height={height}
//         fill="transparent"
//         pointerEvents="all"
//       />
//     );

//     const commonProps = {
//       key: id,
//       id,
//       transform: `translate(${x}, ${y})`,
//       className: `scada-widget-group ${selectedId === id ? "selected" : ""}`,
//       onMouseDown: (e) => onMouseDown?.(e, id),
//       onClick: () => onSelect?.(id),
//       style: { cursor: "move", pointerEvents: "all" },
//     };

//     if (type === "temp-gauge") {
//       return (
//         <g {...commonProps}>
//           {hitArea}
//           <TempGauge width={width} height={height} settings={settings} />
//         </g>
//       );
//     }

//     if (type === "power-card") {
//       return (
//         <g {...commonProps}>
//           {hitArea}
//           <PowerCard width={width} height={height} settings={settings} />
//         </g>
//       );
//     }

//     if (type === "energy-bar-chart") {
//       return (
//         <g {...commonProps}>
//           {hitArea}
//           <EnergyBarChart width={width} height={height} settings={settings} />
//         </g>
//       );
//     }

//     return (
//       <g {...commonProps}>
//         {hitArea}
//         <rect
//           x={0}
//           y={0}
//           width={width}
//           height={height}
//           fill="rgba(56,189,248,0.08)"
//           stroke="#38bdf8"
//           strokeWidth={1.5}
//           vectorEffect="non-scaling-stroke"
//         />
//       </g>
//     );
//   };

//   return <g>{normalized.map(renderElement)}</g>;
// };

// export default ScadaCanvas;

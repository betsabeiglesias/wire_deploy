// // frontend/src/components/Gauge.jsx
// import React, { useEffect, useState } from "react";
// import GaugeChart from "react-gauge-chart";

// const Gauge = ({ 
//     value = 0, 
//     title = "Variable", 
//     unit = "", 
//     max = 100, 
//     colors = ["#00FF00", "#FFBF00", "#FF0000"] }) => {
//   const [normalizedValue, setNormalizedValue] = useState(0);

//   useEffect(() => {
//     const norm = Math.max(0, Math.min(value / max, 1));
//     setNormalizedValue(norm);
//   }, [value, max]);

//   return (
//     <div style={{ width: "100%", maxWidth: 400 }}>
//       <h3 className="text-lg font-semibold mb-2">{title}</h3>
//       <GaugeChart
//         id={`gauge-${title}`}
//         nrOfLevels={20}
//         percent={normalizedValue}
//         formatTextValue={() => `${value?.toFixed(1)} ${unit}`}
//         colors={colors}
//         arcWidth={0.3}
//         animate
//       />
//     </div>
//   );
// };

// export default Gauge;

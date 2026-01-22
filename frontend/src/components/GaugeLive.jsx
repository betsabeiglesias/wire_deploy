// src/components/GaugeLive.jsx
// import React, { useEffect, useState } from "react";
// import mqtt from "mqtt";
// import Gauge from "./Gauge"; // Componente base reutilizable

// const MQTT_URL = `ws://${window.location.hostname}:9001`;

// const GaugeLive = ({ topic, title, unit = "", max = 100, colors }) => {
//   const [value, setValue] = useState(0);

//   useEffect(() => {
//     const client = mqtt.connect(MQTT_URL);

//     client.on("connect", () => {
//       console.log(`📡 Subscribed to ${topic}`);
//       client.subscribe(topic);
//     });

//     client.on("message", (receivedTopic, message) => {
//       if (receivedTopic === topic) {
//         try {
//           const payload = JSON.parse(message.toString());
//           const rawValue = parseFloat(payload.value);
//           if (!isNaN(rawValue)) setValue(rawValue);
//         } catch (err) {
//           console.warn("⚠️ Error parsing MQTT payload", err);
//         }
//       }
//     });

//     return () => client.end();
//   }, [topic]);

//   return (
//     <Gauge value={value} title={title} unit={unit} max={max} colors={colors} />
//   );
// };

// export default GaugeLive;

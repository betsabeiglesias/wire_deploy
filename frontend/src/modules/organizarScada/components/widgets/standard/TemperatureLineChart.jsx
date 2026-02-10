import React from "react";

export default function TemperatureLineChart({
  label = "Temp °C",
  pointLabel = "55ºC",
}) {
  return (
    <svg
      // width="auto"
      height="250"
      viewBox="0 0 400 250"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="400" height="250" fill="#2d3436" rx="8" />

      <line x1="50" y1="20" x2="50" y2="200" stroke="#636e72" strokeWidth="1" />
      <text
        x="40"
        y="20"
        fontFamily="Arial"
        fontSize="10"
        fill="#b2bec3"
        textAnchor="end"
      >
        100
      </text>
      <text
        x="40"
        y="65"
        fontFamily="Arial"
        fontSize="10"
        fill="#b2bec3"
        textAnchor="end"
      >
        75
      </text>
      <text
        x="40"
        y="110"
        fontFamily="Arial"
        fontSize="10"
        fill="#b2bec3"
        textAnchor="end"
      >
        50
      </text>
      <text
        x="40"
        y="155"
        fontFamily="Arial"
        fontSize="10"
        fill="#b2bec3"
        textAnchor="end"
      >
        25
      </text>
      <text
        x="40"
        y="200"
        fontFamily="Arial"
        fontSize="10"
        fill="#b2bec3"
        textAnchor="end"
      >
        0
      </text>
      <text
        x="25"
        y="110"
        fontFamily="Arial"
        fontSize="10"
        fill="#b2bec3"
        transform="rotate(-90 25 110)"
      >
        VALOR
      </text>

      <line x1="50" y1="200" x2="380" y2="200" stroke="#636e72" strokeWidth="1" />
      <text
        x="50"
        y="215"
        fontFamily="Arial"
        fontSize="10"
        fill="#b2bec3"
        textAnchor="middle"
      >
        00:00
      </text>
      <text
        x="130"
        y="215"
        fontFamily="Arial"
        fontSize="10"
        fill="#b2bec3"
        textAnchor="middle"
      >
        06:00
      </text>
      <text
        x="210"
        y="215"
        fontFamily="Arial"
        fontSize="10"
        fill="#b2bec3"
        textAnchor="middle"
      >
        12:00
      </text>
      <text
        x="290"
        y="215"
        fontFamily="Arial"
        fontSize="10"
        fill="#b2bec3"
        textAnchor="middle"
      >
        18:00
      </text>
      <text
        x="370"
        y="215"
        fontFamily="Arial"
        fontSize="10"
        fill="#b2bec3"
        textAnchor="middle"
      >
        24:00
      </text>
      <text
        x="210"
        y="235"
        fontFamily="Arial"
        fontSize="10"
        fill="#b2bec3"
        textAnchor="middle"
      >
        TIEMPO
      </text>

      <line
        x1="50"
        y1="20"
        x2="380"
        y2="20"
        stroke="#485460"
        strokeWidth="0.5"
        strokeDasharray="2,2"
      />
      <line
        x1="50"
        y1="65"
        x2="380"
        y2="65"
        stroke="#485460"
        strokeWidth="0.5"
        strokeDasharray="2,2"
      />
      <line
        x1="50"
        y1="110"
        x2="380"
        y2="110"
        stroke="#485460"
        strokeWidth="0.5"
        strokeDasharray="2,2"
      />
      <line
        x1="50"
        y1="155"
        x2="380"
        y2="155"
        stroke="#485460"
        strokeWidth="0.5"
        strokeDasharray="2,2"
      />

      <line
        x1="130"
        y1="20"
        x2="130"
        y2="200"
        stroke="#485460"
        strokeWidth="0.5"
        strokeDasharray="2,2"
      />
      <line
        x1="210"
        y1="20"
        x2="210"
        y2="200"
        stroke="#485460"
        strokeWidth="0.5"
        strokeDasharray="2,2"
      />
      <line
        x1="290"
        y1="20"
        x2="290"
        y2="200"
        stroke="#485460"
        strokeWidth="0.5"
        strokeDasharray="2,2"
      />
      <line
        x1="370"
        y1="20"
        x2="370"
        y2="200"
        stroke="#485460"
        strokeWidth="0.5"
        strokeDasharray="2,2"
      />

      <polyline
        points="50,180 130,120 210,140 290,90 370,70"
        fill="none"
        stroke="#00b894"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="210" cy="140" r="6" fill="#00d2d3" stroke="#ffffff" strokeWidth="2" />
      <text x="215" y="130" fontFamily="Arial" fontSize="10" fill="#ffffff">
        {pointLabel}
      </text>

      <rect x="300" y="10" width="70" height="15" fill="#485460" rx="3" />
      <circle cx="310" cy="17" r="3" fill="#00b894" />
      <text x="320" y="20" fontFamily="Arial" fontSize="10" fill="#b2bec3">
        {label}
      </text>
    </svg>
  );
}

// historian/components/DateRangePicker.jsx
import React from "react";

const PRESETS = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "7d", hours: 168 },
];

function toLocalInput(date) {
  // datetime-local necesita "YYYY-MM-DDTHH:MM" en hora local
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/**
 * Props:
 *   start    : string "YYYY-MM-DDTHH:MM"
 *   stop     : string "YYYY-MM-DDTHH:MM"
 *   onStart  : (v) => void
 *   onStop   : (v) => void
 */
export default function DateRangePicker({ start, stop, onStart, onStop }) {
  const applyPreset = (hours) => {
    const now = new Date();
    const from = new Date(now.getTime() - hours * 3_600_000);
    onStart(toLocalInput(from));
    onStop(toLocalInput(now));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Presets */}
      <div className="flex gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p.hours)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded hover:border-sky-400 hover:bg-sky-50 transition-colors"
          >
            -{p.label}
          </button>
        ))}
      </div>

      <span className="text-slate-300 text-sm hidden sm:inline">|</span>

      {/* Desde */}
      <div className="flex items-center gap-1">
        <label className="text-xs text-slate-500 whitespace-nowrap">Desde</label>
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => onStart(e.target.value)}
          className="text-xs border border-slate-300 rounded px-2 py-1 focus:border-sky-400 focus:outline-none"
        />
      </div>

      {/* Hasta */}
      <div className="flex items-center gap-1">
        <label className="text-xs text-slate-500 whitespace-nowrap">Hasta</label>
        <input
          type="datetime-local"
          value={stop}
          onChange={(e) => onStop(e.target.value)}
          className="text-xs border border-slate-300 rounded px-2 py-1 focus:border-sky-400 focus:outline-none"
        />
      </div>
    </div>
  );
}

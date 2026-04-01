// src/modules/organizarScada/components/widgets/WidgetThumbnail.jsx

import { ICON_MAP } from "./iconMap";
import { resolveIcon } from "./iconResolver";

const STATUS_COLOR = {
  ok: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-red-500",
  neutral: "text-slate-500",
};

export default function WidgetThumbnail({
  icon,
  type,            // 👈 AÑADIR
  variableType,    // 👈 opcional pero recomendable
  unit,
  label,
  status = "neutral",
}) {
  const resolvedIconKey = resolveIcon({
    icon,
    type,
    variableType,
    unit,
  });

  const Icon = ICON_MAP[resolvedIconKey] || ICON_MAP.gauge;

  const color = STATUS_COLOR[status] || STATUS_COLOR.neutral;

  return (
    <div className="flex items-center justify-center w-full h-full bg-slate-50">
      <Icon className={`w-6 h-6 ${color}`} strokeWidth={1.8} />
    </div>
  );
}
import {
  GripVertical,
  LayoutGrid,
  ChartColumnBig,
  SquarePen,
  Trash2,
  Layout,
} from "lucide-react";
import FavoriteHeart from "@/components/FavoriteHeart";
import Button from "../Button";
const TYPE_CONFIG = {
  mypowerbi: {
    label: "Dashboard",
    subLabel: "Analitica",
    icon: ChartColumnBig,
    themeColor: "text-[#255f82]",
    badgeBg: "bg-[#eef5f8]",
    badgeBorder: "border-[#d6e2ea]",
    iconBg: "bg-[#eef5f8]",
  },
  mylayout: {
    label: "Modulo HMI",
    subLabel: "Control SCADA",
    icon: Layout,
    themeColor: "text-[#8f6a18]",
    badgeBg: "bg-[#fff8e8]",
    badgeBorder: "border-[#ece3c6]",
    iconBg: "bg-[#fff8e8]",
  },
};

export default function ViewCard({
  item,
  type,
  isDragging,
  onView,
  onEdit,
  onDelete,
  dragProps = {},
  style = {},
}) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.mypowerbi;
  const Icon = config.icon;

  return (
    <article
      style={style}
      className={`group overflow-hidden rounded-[30px] border border-[#dce3e8] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafb_100%)] shadow-[0_18px_36px_-24px_rgba(31,41,55,0.14)] transition-all duration-300 ${
        isDragging
          ? "scale-[1.03] rotate-[1deg] opacity-90 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.15)] ring-4 ring-[#255f82]/5 z-50"
          : "hover:shadow-[0_20px_45px_-15px_rgba(0,0,0,0.1)]"
      }`}
    >
      {/* HEADER / DRAG HANDLE */}
      <div
        {...dragProps}
        className="flex items-center justify-between px-5 py-4 cursor-grab active:cursor-grabbing border-b border-[#eef1f5] bg-[#fbfcfd]"
      >
        <div className="flex items-center gap-3">
          <GripVertical className="h-4 w-4 text-[#cbd5e1] transition-colors group-hover:text-[#94a3b8]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#94a3b8]">
            Reordenar
          </span>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm transition-transform group-hover:scale-105 ${config.badgeBorder} ${config.badgeBg}`}
        >
          <LayoutGrid className={`h-3.5 w-3.5 ${config.themeColor}`} />
          <span
            className={`text-[10px] font-bold uppercase tracking-[0.1em] ${config.themeColor}`}
          >
            {config.label}
          </span>
        </div>
      </div>

      {/* PREVIEW AREA */}
      <div className="relative h-60 overflow-hidden bg-[#f4f7f9]">
        {item.embed_url || type === "mylayout" ? (
          <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.02]">
            <iframe
              src={type === "mypowerbi" ? item.embed_url : `/layout/${item.id}`}
              title={item.name}
              frameBorder="0"
              className="h-full w-full"
              style={
                type === "mylayout"
                  ? {
                      width: "166.66%",
                      height: "166.66%",
                      transform: "scale(0.6)",
                      transformOrigin: "top left",
                    }
                  : {}
              }
            />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-[#94a3b8]">
            <Icon className="h-8 w-8 opacity-20" />
            <span className="text-xs font-medium">
              Sin vista previa disponible
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
      </div>

      {/* INFO BODY */}
      <div className="px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${config.themeColor}`}
            >
              {config.subLabel}
            </p>
            <h2
              className={`mt-2 truncate text-2xl font-bold tracking-tight transition-colors text-[#1e293b] group-hover:text-[#255f82]`}
            >
              {item.name}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#64748b]">
              {item.description || ""}
            </p>
          </div>

          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-inner ${config.iconBg} ${config.themeColor}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ACTIONS FOOTER */}
      <div className="flex items-center justify-between px-5 py-5 border-t border-[#eef1f5] bg-[#f9fbfc]">
        <div className="scale-110">
          <FavoriteHeart type={type} objectId={item.id} />
        </div>

        <div className="flex items-center gap-3">
         {/* 1. Botón Principal (Ver) - Usa la variante por defecto */}
          <Button onClick={() => onView(item)}>
            Ver detalle
          </Button>

         
          </div>
      </div>
    </article>
  );
}

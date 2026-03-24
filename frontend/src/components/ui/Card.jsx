import { ArrowRight } from "lucide-react";

export default function CommandCard({
  title,
  description,
  badge,
  icon: Icon,
  variant = "operation",
  onClick,
  className = "",
}) {
  const variants = {
    operation: {
      card: "border-[#17305f] bg-[linear-gradient(180deg,#0b1731_0%,#102247_48%,#15305f_100%)]",
      icon: "bg-[#7ec8ff]/18 text-[#bde6ff] border border-[#7ec8ff]/20",
      accent: "text-[#8fd0ff]",
      title: "text-white",
      body: "text-[#c7d1db]",
      badge: "border-white/10 bg-white/6 text-[#dfe9f4]",
      action: "text-white",
    },
    analytics: {
      card: "border-[#6b571b] bg-[linear-gradient(180deg,#231d0d_0%,#352a12_48%,#473817_100%)]",
      icon: "bg-[#e9c46a]/16 text-[#f3d996] border border-[#e9c46a]/20",
      accent: "text-[#f1cf80]",
      title: "text-white",
      body: "text-[#e0d7bf]",
      badge: "border-white/10 bg-white/6 text-[#f4ead3]",
      action: "text-white",
    },
    support: {
      card: "border-[#304765] bg-[linear-gradient(180deg,#182232_0%,#223247_48%,#304765_100%)]",
      icon: "bg-[#c0c8da]/16 text-[#e1e7f1] border border-[#c0c8da]/20",
      accent: "text-[#d5dbea]",
      title: "text-white",
      body: "text-[#d2dae5]",
      badge: "border-white/10 bg-white/6 text-[#dfe9f4]",
      action: "text-white",
    },
  };

  const active = variants[variant] || variants.operation;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex h-full w-full flex-col overflow-hidden rounded-[24px] border p-4 text-left transition",
        "hover:-translate-y-1 hover:shadow-[0_20px_44px_-28px_rgba(9,21,47,0.55)]",
        "md:rounded-[28px] md:p-5",
        active.card,
        className,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${active.badge}`}
          >
            {badge}
          </span>

          <h2
            className={`mt-3 text-xl font-semibold tracking-[-0.04em] md:text-2xl ${active.title}`}
          >
            {title}
          </h2>
        </div>

        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${active.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className={`mt-3 text-sm leading-6 ${active.body}`}>{description}</p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className={`text-sm font-semibold ${active.accent}`}>
          Acceso directo
        </span>
        <span
          className={`inline-flex flex-shrink-0 items-center gap-2 text-sm font-semibold ${active.action}`}
        >
          Abrir
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
}

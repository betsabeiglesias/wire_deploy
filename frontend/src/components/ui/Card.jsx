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
  // 1. Configuración de variantes (reemplaza al archivo .js externo)
  const variants = {
    operation: {
      card: "border-[#0d1d45] bg-[linear-gradient(145deg,#f7fbfd_0%,#edf5f8_55%,#fdfefe_100%)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#09152f_0%,#0d1d40_42%,#132857_100%)]",
      icon: "bg-[#0d1d45] text-white dark:bg-[#7ec8ff] dark:text-[#09152f]",
      accent: "text-[#255f82] dark:text-[#8fd0ff]",
    },
    analytics: {
      card: "border-[#8f6a18] bg-[linear-gradient(145deg,#fffdf5_0%,#f8f2dd_55%,#fdfcf8_100%)] dark:border-[#4a4c3d] dark:bg-[linear-gradient(145deg,#25281d_0%,#343824_55%,#44492d_100%)]",
      icon: "bg-[#8f6a18] text-white dark:bg-[#e9c46a] dark:text-[#33270b]",
      accent: "text-[#8f6a18] dark:text-[#f1cf80]",
    },
    support: {
      card: "border-[#051145] bg-[linear-gradient(145deg,#f8f9fc_0%,#eef1f8_55%,#fcfcfe_100%)] dark:border-[#4b465f] dark:bg-[linear-gradient(145deg,#1c1f2b_0%,#2b3042_55%,#3a425a_100%)]",
      icon: "bg-[#49566f] text-white dark:bg-[#c0c8da] dark:text-[#252c3b]",
      accent: "text-[#49566f] dark:text-[#d5dbea]",
    },
  };

  // 2. Clases base (las que no cambian nunca)
  const baseCard =
  "group cursor-pointer overflow-hidden rounded-[28px] border p-6 text-left transition duration-200 hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_24px_54px_-32px_rgba(0,0,0,0.24)]";
  const baseIcon = "flex h-14 w-14 items-center justify-center rounded-2xl";
  const baseAccent = "text-sm font-semibold";

  // 3. Selección de la variante activa
  const active = variants[variant] || variants.operation;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseCard} ${active.card} ${className} rounded-[30px]`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full border border-white bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#63707e] dark:border-white/10 dark:bg-white/6 dark:text-[#dfe9f4]">
            {badge}
          </span>

          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-[#007bf6] dark:text-white">
            {title}
          </h2>
        </div>

        <div className={`${baseIcon} ${active.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 text-[#697682] dark:text-[#c7d1db]">
        {description}
      </p>

      <div className="mt-8 flex items-center justify-between">
        <span className={`${baseAccent} ${active.accent}`}>Acceso directo</span>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2f3942] dark:text-white">
          Abrir
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
}

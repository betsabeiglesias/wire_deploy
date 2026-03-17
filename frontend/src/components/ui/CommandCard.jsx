import { ArrowRight } from "lucide-react";
import { cn } from "../../utils/cn";
import { cardStyles, iconStyles, accentStyles } from "./commandCard.styles";

export default function CommandCard({
  title,
  description,
  badge,
  icon: Icon,
  variant = "operation",
  onClick,
  className,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(cardStyles({ variant }), className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {/* Fíjate en la limpieza: usamos dark:nativo en lugar de isDark ? '' : '' */}
          <span className="inline-flex rounded-full border border-white bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#63707e] dark:border-white/10 dark:bg-white/6 dark:text-[#dfe9f4]">
            {badge}
          </span>

          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-[#2f3942] dark:text-white">
            {title}
          </h2>
        </div>

        {/* Aplicamos los estilos del icono basados en la variante */}
        <div className={iconStyles({ variant })}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 text-[#697682] dark:text-[#c7d1db]">
        {description}
      </p>

      <div className="mt-8 flex items-center justify-between">
        <span className={accentStyles({ variant })}>
          Acceso directo
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2f3942] dark:text-white">
          Abrir
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
}
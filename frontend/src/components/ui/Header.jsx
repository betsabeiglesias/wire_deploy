import React from "react";
import { Activity } from "lucide-react";

const Header = ({
  badgeText = "System Control",
  title = "Título de Página",
  highlightText = "",
  icon: Icon = Activity,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-[#dde4e8] px-6 py-7 md:px-8 md:py-8">
      {/* Patrón de puntos decorativo */}
      <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(#d9cdf7_1px,transparent_1px)] [background-size:8px_8px]" />

      {/* Brillo decorativo superior */}
      <div className="absolute right-[-30px] top-[-20px] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.16),transparent_72%)]" />

      {/* Capas decorativas de fondo (Manteniendo tu estética clara) */}
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(52,85,112,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(52,85,112,0.16)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(37,95,130,0.22),transparent)]" />
      <div className="absolute left-0 top-0 h-full w-[38%] bg-[linear-gradient(90deg,rgba(121,200,241,0.08),transparent)]" />
      <div className="relative z-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-2xl">
          {/* Badge dinámico */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d6e2ea] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5f7487]">
            <Icon className="h-3.5 w-3.5" />
            {badgeText}
          </div>

          {/* Título dinámico */}
          <h1 className="mt-6 max-w-5xl text-4xl font-semibold leading-[0.92] tracking-[-0.06em] text-[#2f3942] md:text-6xl">
            {title}
            {highlightText && (
              <>
                <br />
                <span className="text-[#255f82]">{highlightText}</span>
              </>
            )}
          </h1>
        </div>
      </div>
    </section>
  );
};

export default Header;

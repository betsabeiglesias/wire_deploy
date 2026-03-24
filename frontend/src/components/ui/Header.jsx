import React from "react";
import { Activity } from "lucide-react";

const Header = ({
  badgeText = "System Control",
  title = "Titulo de Pagina",
  highlightText = "",
  icon: Icon = Activity,
}) => {
  return (
    <header className="relative overflow-hidden border-b border-[#dde4e8] px-5 py-4 md:px-6 md:py-5">
      <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(#d9cdf7_1px,transparent_1px)] [background-size:8px_8px]" />
      <div className="absolute right-[-18px] top-[-14px] h-[120px] w-[120px] rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.16),transparent_72%)] md:h-[150px] md:w-[150px]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(52,85,112,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(52,85,112,0.16)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(37,95,130,0.22),transparent)]" />
      <div className="absolute left-0 top-0 h-full w-[34%] bg-[linear-gradient(90deg,rgba(121,200,241,0.08),transparent)]" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#d6e2ea] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5f7487] md:px-4 md:text-[11px]">
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{badgeText}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[#2f3942] md:text-3xl">
              {title}
            </h1>
            {highlightText && (
              <span className="text-lg font-semibold tracking-[-0.04em] text-[#255f82] md:text-2xl">
                {highlightText}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

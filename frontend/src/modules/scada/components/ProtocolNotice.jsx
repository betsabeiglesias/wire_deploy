const ProtocolNotice = ({
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => (
  <div className="flex flex-1 items-center justify-center p-4">
    <div className="w-full max-w-xl rounded-[6px] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500">
          Configuracion requerida
        </span>
        <h2 className="text-[16px] font-semibold text-slate-800">{title}</h2>
        <p className="text-[12px] leading-5 text-slate-500">{description}</p>
      </div>

      <div className="mt-5 flex gap-2">
        {primaryActionLabel ? (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="inline-flex items-center justify-center rounded-[4px] bg-[#29468B] px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#1F3A73]"
          >
            {primaryActionLabel}
          </button>
        ) : null}
        {secondaryActionLabel ? (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex items-center justify-center rounded-[4px] border border-slate-300 bg-white px-4 py-2 text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            {secondaryActionLabel}
          </button>
        ) : null}
      </div>
    </div>
  </div>
);

export default ProtocolNotice;

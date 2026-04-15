import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const baseTabCls = "group flex min-w-0 flex-1 items-center gap-3 rounded-[6px] border px-3 py-2 text-left transition-colors";
const activeTabCls = "border-[#29468B] bg-[#EEF3FF] text-[#29468B]";
const enabledTabCls = "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50";
const disabledTabCls = "border-slate-200 bg-slate-50 text-slate-400";

const DeviceWizardTabs = ({ steps }) => {
  const navigate = useNavigate();

  return (
    <div className="border-b border-slate-200 bg-[#F8F9FB] px-3 py-2">
      <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto">
        {steps.map((step, index) => {
          const isClickable = Boolean(step.enabled && step.to && !step.current);
          const tabCls = step.current
            ? activeTabCls
            : step.enabled
              ? enabledTabCls
              : disabledTabCls;

          return (
            <div key={step.key} className="flex min-w-[180px] flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => isClickable && navigate(step.to)}
                disabled={!isClickable}
                className={`${baseTabCls} ${tabCls} ${isClickable ? "cursor-pointer" : "cursor-default"}`}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                  step.current ? "bg-[#29468B] text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-semibold">{step.label}</span>
                  {step.description ? (
                    <span className="block truncate text-[10px] uppercase tracking-[0.05em] text-current/70">
                      {step.description}
                    </span>
                  ) : null}
                </span>
              </button>
              {index < steps.length - 1 ? (
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeviceWizardTabs;

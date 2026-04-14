import { useNavigate } from "react-router-dom";

const WizardNavigation = ({
  onBack,
  onNext,
  backTo,
  nextTo,
  nextDisabled = false,
  nextLabel = "Next",
  nextClassName = "",
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) return navigate(backTo);
    if (onBack) return onBack();
  };

  const handleNext = () => {
    if (nextTo) return navigate(nextTo);
    if (onNext) return onNext();
  };

  return (
    <div className="flex justify-between">
      <button
        onClick={handleBack}
        className="inline-flex items-center justify-center h-8 px-3 text-[12px] font-medium rounded-[4px] border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
      >
        Atrás
      </button>

      <button
        onClick={handleNext}
        disabled={nextDisabled}
        className={`inline-flex items-center justify-center h-8 px-4 text-[12px] font-medium rounded-[4px] transition-colors ${
          nextDisabled
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : nextClassName || "bg-[#29468B] hover:bg-[#1F3A73] text-white"
        }`}
      >
        {nextLabel}
      </button>
    </div>
  );
};

export default WizardNavigation;

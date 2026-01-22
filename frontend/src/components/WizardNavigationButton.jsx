import { useNavigate } from "react-router-dom";

const WizardNavigation = ({
  onBack,
  onNext,
  backTo,     // ⭐ navigation explícita
  nextTo,     // ⭐ navigation explícita
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
    <div className="mt-6 flex justify-between">
      <button
        onClick={handleBack}
        className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
      >
        Back
      </button>

      <button
        onClick={handleNext}
        disabled={nextDisabled}
        className={`px-6 py-2 rounded text-white ${
          nextDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : nextClassName || "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {nextLabel}
      </button>
    </div>
  );
};

export default WizardNavigation;

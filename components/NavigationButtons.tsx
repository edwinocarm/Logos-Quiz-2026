interface NavigationButtonsProps {
  onPrevious: () => void;
  onNext: () => void;
  disablePrevious: boolean;
  disableNext: boolean;
}

export default function NavigationButtons({
  onPrevious,
  onNext,
  disablePrevious,
  disableNext,
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between mt-8">
      <button
        onClick={onPrevious}
        disabled={disablePrevious}
        className="bg-gray-300 px-6 py-3 rounded-lg disabled:opacity-50"
      >
        Previous
      </button>

      <button
        onClick={onNext}
        disabled={disableNext}
        className="bg-amber-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
type NavigationProps = {
  onPrevious: () => void;
  onNext: () => void;
  onCheck: () => void;
  isFirst: boolean;
  isLast: boolean;
  showFeedback: boolean;
  hasInput: boolean;
};

export default function NavigationButtons({ 
  onPrevious, onNext, onCheck, isFirst, isLast, showFeedback, hasInput 
}: NavigationProps) {
  return (
    <div className="flex justify-between items-center mt-6">
      <button
        onClick={onPrevious}
        disabled={isFirst}
        className={`px-6 py-2 rounded font-medium transition ${
          isFirst 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        മുമ്പത്തെ (Previous)
      </button>

      {!showFeedback ? (
        <button
          onClick={onCheck}
          disabled={!hasInput}
          className={`px-6 py-2 rounded font-bold transition ${
            hasInput ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          ഉത്തരം പരിശോധിക്കുക (Check Answer)
        </button>
      ) : (
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
        >
          {isLast ? "ഫലം കാണുക (View Results)" : "അടുത്ത ചോദ്യം (Next)"}
        </button>
      )}
    </div>
  );
}
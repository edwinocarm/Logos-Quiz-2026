import { useState } from "react";
import { ReactTransliterate } from "react-transliterate";
import "react-transliterate/dist/index.css";

type AnswerInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function AnswerInput({ value, onChange }: AnswerInputProps) {
  const [useManglish, setUseManglish] = useState(true);

  return (
    <div className="w-full">
      {/* Keyboard Toggle Switch */}
      <div className="flex justify-end mb-2">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-blue-600 transition">
          <input 
            type="checkbox" 
            checked={useManglish}
            onChange={(e) => setUseManglish(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 accent-blue-600"
          />
          <span className="font-medium">Manglish Autotype</span>
        </label>
      </div>

      {useManglish ? (
        <div>
          <ReactTransliterate
            value={value}
            onChangeText={(text) => onChange({ target: { value: text } } as React.ChangeEvent<HTMLInputElement>)}
            lang="ml"
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg font-bold text-blue-900"
            placeholder="Manglish ടൈപ്പ് ചെയ്യുക (Space അമർത്തുക)..."
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 <strong>Tip:</strong> Press Space to convert. (Turn off the toggle above to use your phone's handwriting/native keyboard).
          </p>
        </div>
      ) : (
        <div>
          {/* Standard Input for Mobile Keyboards / Handwriting */}
          <input
            type="text"
            value={value}
            onChange={onChange}
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg font-bold text-blue-900"
            placeholder="മലയാളത്തിൽ ടൈപ്പ് ചെയ്യുക (Use handwriting board)..."
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2">
            📱 <strong>Tip:</strong> Using native keyboard. You can now use your phone's handwriting or voice typing.
          </p>
        </div>
      )}
    </div>
  );
}
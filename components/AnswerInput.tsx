interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function AnswerInput({
  value,
  onChange,
}: AnswerInputProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="നിങ്ങളുടെ ഉത്തരം ഇവിടെ എഴുതുക..."
      className="w-full border rounded-lg p-4 text-lg"
      rows={4}
    />
  );
}
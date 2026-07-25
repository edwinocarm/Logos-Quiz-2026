interface QuestionCardProps {
  questionNumber: number;
  totalQuestions?: number; // <--- The magic question mark!
  question: string;
  reference?: string;
}

export default function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  reference,
}: QuestionCardProps) {
  return (
    <div className="mb-6">
      <p className="text-lg text-gray-600 font-medium">
        ചോദ്യം (Question) {questionNumber} {totalQuestions ? `of ${totalQuestions}` : ''}
      </p>

      <div className="mt-4 text-2xl font-semibold leading-relaxed text-gray-800">
        {question}
      </div>

      {reference && (
        <p className="mt-3 text-sm text-gray-500">
          Reference: {reference}
        </p>
      )}
    </div>
  );
}
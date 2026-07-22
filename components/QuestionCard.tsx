interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
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
      <p className="text-lg text-gray-600">
        Question {questionNumber} of {totalQuestions}
      </p>

      <div className="mt-4 text-2xl font-semibold">
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
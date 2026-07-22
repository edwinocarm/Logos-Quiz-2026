export function normalizeAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function isCorrectAnswer(
  userAnswer: string,
  acceptedAnswers: string[]
): boolean {
  const normalizedUser = normalizeAnswer(userAnswer);

  return acceptedAnswers.some(
    (answer) => normalizeAnswer(answer) === normalizedUser
  );
}
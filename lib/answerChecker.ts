export function checkAnswer(userInput: string, correctAnswers: string | string[]): boolean {
  if (!userInput || !correctAnswers) return false;

  // Normalize: remove extra spaces, punctuation, and INVISIBLE Malayalam formatting characters (Zero-Width Joiners)
  const normalize = (text: string) => text
    .trim()
    .replace(/[.,!?]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, ''); // This line fixes the hidden Malayalam spelling errors

  const normalizedInput = normalize(userInput);

  const isMatch = (correctStr: string) => {
    const normalizedCorrect = normalize(correctStr);
    return normalizedInput === normalizedCorrect || normalizedCorrect.includes(normalizedInput);
  };

  if (Array.isArray(correctAnswers)) {
    return correctAnswers.some(ans => isMatch(ans));
  }

  return isMatch(correctAnswers);
}
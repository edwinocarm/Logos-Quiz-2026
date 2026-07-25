export type QuizQuestion = {
  id: number;
  question: string;
  answer: string | string[]; // Now accepts a single string OR an array of acceptable answers
  reference?: string; // Optional field for "റൂത്ത് 1:1"
};

export type UserAnswerRecord = {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
};
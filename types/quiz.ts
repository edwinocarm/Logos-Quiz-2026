export interface QuizQuestion {
  id: number;
  question: string;
  answer: any;
  options?: string[];
}

export interface UserAnswerRecord {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
}
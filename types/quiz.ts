export interface QuizQuestion {
  id: number;
  book: string;
  chapter: number;
  question: string;
  acceptedAnswers: string[];
  reference?: string;
  marks: number;
}
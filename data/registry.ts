import { QuizQuestion } from "../types/quiz";
import { quizData as ruth1 } from "./ruthChapter1";

// As you use the Admin Panel to generate new chapters, you will import them here
// import { quizData as ruth2 } from "./ruthChapter2";

export type QuizMetadata = {
  book: string;
  chapter: string;
  data: QuizQuestion[];
};

export const quizRegistry: Record<string, QuizMetadata> = {
  "ruth-1": { 
    book: "റൂത്ത് (Ruth)", 
    chapter: "1", 
    data: ruth1 
  },
  // "ruth-2": { book: "റൂത്ത് (Ruth)", chapter: "2", data: ruth2 }, // Uncomment when ready!
};
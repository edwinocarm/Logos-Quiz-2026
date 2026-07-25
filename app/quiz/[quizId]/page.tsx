"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { checkAnswer } from "@/lib/answerChecker";
import { QuizQuestion, UserAnswerRecord } from "@/types/quiz";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

import Header from "@/components/Header";
import QuestionCard from "@/components/QuestionCard";
import AnswerInput from "@/components/AnswerInput";
import ProgressBar from "@/components/ProgressBar";

// --- THE FIX: We extend your existing blueprint so it accepts 'options' ---
interface ExtendedQuizQuestion extends QuizQuestion {
  options?: string[];
}

export default function QuizPage() {
  const params = useParams();
  const quizId = (params.id || params.quizId) as string; 
  
  // Database & Mode State
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizMode, setQuizMode] = useState<"select" | "typing" | "mcq">("select");

  // Quiz State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [answers, setAnswers] = useState<UserAnswerRecord[]>([]);
  const [lockedQuestions, setLockedQuestions] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      if (!quizId) return;
      const { data } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', quizId)
        .single();
        
      if (data) setCurrentQuiz(data);
      setIsLoading(false);
    }
    loadQuiz();
  }, [quizId]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xl text-blue-600">Loading Quiz...</div>;
  }

  if (!currentQuiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Not Found</h1>
        <p className="text-gray-600 mb-6">This chapter has not been uploaded yet.</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Return Home</Link>
      </div>
    );
  }

  const quizData = currentQuiz.questions || [];
  // Using our new Extended blueprint here!
  const currentQuestion: ExtendedQuizQuestion = quizData[currentIndex] || {};
  const totalQuestions = quizData.length;
  const attemptedCount = answers.length;
  const currentMarks = answers.filter(a => a.isCorrect).length;

  // Mode Selection Screen
  if (quizMode === "select") {
    return (
      <div className="max-w-xl mx-auto p-8 mt-16 bg-white rounded-2xl shadow-xl border text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LOGOS QUIZ</h1>
        <p className="text-gray-600 mb-8">{currentQuiz.book} അധ്യായം {currentQuiz.chapter}</p>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">പരീക്ഷ എഴുതേണ്ട രീതി തിരഞ്ഞെടുക്കുക (Select Mode):</h2>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => setQuizMode("typing")}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-md"
          >
            ⌨️ ടൈപ്പിംഗ് രീതി (Typing Answer)
          </button>
          <button 
            onClick={() => setQuizMode("mcq")}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-md"
          >
            🔘 മൾട്ടിപ്പിൾ ചോയ്സ് (Multiple Choice - MCQ)
          </button>
        </div>
      </div>
    );
  }

  const isLocked = lockedQuestions[currentQuestion.id] || false;
  const aiOptions = currentQuestion.options || [];

  const handleCheck = () => {
    if (!currentInput || !currentInput.trim() || isLocked) return;

    const correct = checkAnswer(currentInput, currentQuestion.answer);
    setIsCurrentCorrect(correct);
    setShowFeedback(true);

    // Lock this question permanently
    setLockedQuestions(prev => ({ ...prev, [currentQuestion.id]: true }));

    const newAnswers = [...answers];
    const record = { questionId: currentQuestion.id, userAnswer: currentInput, isCorrect: correct };
    
    const existingIndex = answers.findIndex(a => a.questionId === currentQuestion.id);
    if (existingIndex >= 0) newAnswers[existingIndex] = record;
    else newAnswers.push(record);
    
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowFeedback(false);
      const nextQId = quizData[currentIndex + 1].id;
      const existingAns = answers.find(a => a.questionId === nextQId);
      setCurrentInput(existingAns ? existingAns.userAnswer : "");
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      const prevQId = quizData[currentIndex - 1].id;
      const prevAns = answers.find(a => a.questionId === prevQId);
      setCurrentInput(prevAns?.userAnswer || "");
      setShowFeedback(lockedQuestions[prevQId] || false);
      if (prevAns) {
        setIsCurrentCorrect(prevAns.isCorrect);
      }
    }
  };

  // Results Screen
  if (isFinished) {
    const percentage = attemptedCount > 0 ? ((currentMarks / attemptedCount) * 100).toFixed(1) : "0.0";

    return (
      <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md border-t-8 border-blue-600">
        <h2 className="text-3xl font-bold text-center mb-2">LOGOS QUIZ RESULTS</h2>
        <p className="text-center text-gray-500 mb-8">{currentQuiz.book} അധ്യായം {currentQuiz.chapter}</p>
        
        <div className="bg-gray-50 p-6 rounded-lg text-center mb-8 border">
          <p className="text-xl font-semibold mb-2">നിങ്ങളുടെ സ്കോർ (Total Marks)</p>
          <div className="text-5xl font-bold text-blue-700 mb-2">{currentMarks} / {attemptedCount}</div>
          <p className="text-sm text-gray-500 mb-6">(Attended out of {totalQuestions} total questions)</p>
          <div className="text-xl font-bold text-gray-700">Percentage : {percentage}%</div>
        </div>

        <div className="flex gap-4">
          <Link href="/" className="flex-1 bg-gray-200 text-gray-800 flex items-center justify-center py-3 rounded-lg font-bold hover:bg-gray-300 transition shadow-lg">
            ഹോം പേജ് (Home)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10">
      <div className="flex justify-between items-center mb-2">
        <Header book={currentQuiz.book} chapter={currentQuiz.chapter} />
        <button 
          onClick={() => setIsFinished(true)}
          className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition text-sm"
        >
          പരീക്ഷ അവസാനിപ്പിക്കുക (Quit & Score)
        </button>
      </div>
      
      <div className="flex justify-between items-center mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
        <span className="font-bold text-blue-900">Live Score:</span>
        <span className="font-bold text-xl text-blue-700">{currentMarks} / {attemptedCount} Marks</span>
      </div>

      <ProgressBar current={currentIndex + 1} total={totalQuestions} />
      
      <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <QuestionCard questionNumber={currentIndex + 1} question={currentQuestion.question} />
        
        <div className="mt-6">
          {quizMode === "typing" ? (
            <AnswerInput 
              value={currentInput} 
              disabled={isLocked}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (!isLocked) setCurrentInput(e.target.value);
              }} 
            />
          ) : (
            <div>
              {aiOptions.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {aiOptions.map((option: string, idx: number) => {
                    const isSelected = currentInput === option;
                    return (
                      <button
                        key={idx}
                        disabled={isLocked}
                        onClick={() => {
                          if (!isLocked) setCurrentInput(option);
                        }}
                        className={`p-4 rounded-xl border text-left font-medium transition ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-center">
                  ⚠️ AI options have not been generated for this chapter yet. Please re-upload this chapter using your parser/admin uploader to generate strict POC Bible choices.
                </div>
              )}
            </div>
          )}
        </div>

        {showFeedback && (
          <div className={`mt-6 p-4 rounded-lg border-l-4 ${isCurrentCorrect ? 'bg-green-50 border-green-500 text-green-900' : 'bg-red-50 border-red-500 text-red-900'}`}>
            <p className="font-bold text-lg">{isCurrentCorrect ? '✔ ശരി (+1 Mark)' : '❌ തെറ്റ് (0 Marks)'}</p>
            {!isCurrentCorrect && (
              <p className="mt-2 text-md">ശരിയായ ഉത്തരം (Correct Answer): <span className="font-bold">{Array.isArray(currentQuestion.answer) ? currentQuestion.answer[0] : currentQuestion.answer}</span></p>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <button 
            onClick={handlePrevious} 
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-lg border font-bold text-gray-700 disabled:opacity-50 hover:bg-gray-100"
          >
            Previous
          </button>

          {!isLocked ? (
            <button 
              onClick={handleCheck} 
              disabled={!currentInput || !currentInput.trim()}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              ഉത്തരം പരിശോധിക്കുക (Check Answer)
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md"
            >
              {currentIndex === totalQuestions - 1 ? "പരീക്ഷ അവസാനിപ്പിക്കുക (Finish)" : "അടുത്തത് (Next) ➔"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
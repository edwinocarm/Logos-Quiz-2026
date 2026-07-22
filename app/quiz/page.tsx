"use client";

import { useState } from "react";
import quizData from "../../data/ruthChapter1.json";

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");

  const question = quizData.questions[currentQuestion];

  function nextQuestion() {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswer("");
    }
  }

  function previousQuestion() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswer("");
    }
  }

  return (
    <main className="min-h-screen bg-amber-50 flex justify-center items-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">

        <h1 className="text-4xl font-bold text-center text-amber-700 mb-6">
          {quizData.title}
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Question {currentQuestion + 1} of {quizData.questions.length}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
          <div
            className="bg-amber-600 h-3 rounded-full"
            style={{
              width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <div className="text-2xl font-semibold mb-8">
          {question.question}
        </div>

        {/* Answer */}
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={4}
          placeholder="നിങ്ങളുടെ ഉത്തരം ഇവിടെ എഴുതുക..."
          className="w-full border rounded-lg p-4 text-lg"
        />

        {/* Navigation */}
        <div className="flex justify-between mt-8">

          <button
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className="bg-gray-300 px-6 py-3 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>

          <button
            onClick={nextQuestion}
            disabled={currentQuestion === quizData.questions.length - 1}
            className="bg-amber-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            Next
          </button>

        </div>

      </div>
    </main>
  );
}
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-100 flex items-center justify-center px-6">
      <div className="max-w-3xl w-full text-center bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-12 border border-amber-200">

        <div className="text-6xl mb-4">✝️</div>

        <h1 className="text-5xl font-extrabold text-amber-900 mb-4">
          LOGOS QUIZ
        </h1>

        <h2 className="text-2xl text-amber-700 mb-8">
          Bible Quiz Builder
        </h2>

        <p className="text-xl italic text-gray-700 mb-2">
          "Your word is a lamp to my feet
        </p>

        <p className="text-xl italic text-gray-700 mb-10">
          and a light to my path."
        </p>

        <p className="text-lg font-semibold text-amber-800 mb-10">
          Psalm 119:105
        </p>

        <button className="bg-amber-700 hover:bg-amber-800 text-white text-xl px-10 py-4 rounded-full transition duration-300 shadow-lg">
          Start Quiz
        </button>

        <div className="mt-12 text-gray-500">
          © 2026 Logos Quiz
        </div>

      </div>
    </main>
  );
}
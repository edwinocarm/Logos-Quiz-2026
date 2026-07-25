import Link from "next/link";
import { supabase } from "@/lib/supabase";

// This tells Next.js to always fetch the newest data from the database instantly
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Pull all live chapters from Supabase
  const { data: chapters, error } = await supabase
    .from('chapters')
    .select('id, book, chapter, is_available')
    .order('chapter', { ascending: true });

  // Group the flat database rows into Books and Chapters dynamically
  const syllabusMap = new Map();
  
  if (chapters) {
    chapters.forEach(ch => {
      if (!syllabusMap.has(ch.book)) {
        syllabusMap.set(ch.book, { id: ch.book, title: ch.book, chapters: [] });
      }
      syllabusMap.get(ch.book).chapters.push({
        num: ch.chapter,
        isAvailable: ch.is_available,
        href: `/quiz/${ch.id}`
      });
    });
  }

  const syllabus = Array.from(syllabusMap.values());

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white py-16 px-6 text-center shadow-md">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">LOGOS BIBLE QUIZ</h1>
        <p className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto">
          Interactive Scripture learning platform. Select a book and chapter to test your knowledge.
        </p>
      </header>

      <main className="max-w-4xl mx-auto p-6 mt-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Available Books</h2>
          <Link href="/admin" className="text-sm font-bold text-blue-600 hover:underline">
            Admin Panel ⚙️
          </Link>
        </div>

        {syllabus.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-sm border text-gray-500">
            No quizzes uploaded yet. Go to the Admin Panel to upload your first PDF/Word document!
          </div>
        ) : (
          <div className="space-y-8">
            {syllabus.map((book) => (
              <div key={book.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">{book.title}</h3>
                <div className="flex flex-wrap gap-3">
                  {book.chapters.map((chapter: any) => (
                    <Link 
                      key={`${book.id}-${chapter.num}`}
                      href={chapter.href}
                      className="w-14 h-14 flex items-center justify-center bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                      {chapter.num}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
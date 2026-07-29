"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [isMounted, setIsMounted] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const [bookTitle, setBookTitle] = useState("സാമുവേൽ (Samuel)");
  const [chapterNum, setChapterNum] = useState("1");
  const [quizId, setQuizId] = useState("1-samuel-1"); 
  
  const [appendMode, setAppendMode] = useState(false);
  
  const [previewData, setPreviewData] = useState<any[] | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (localStorage.getItem("adminKey") === "logos2026") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "logos2026") {
      localStorage.setItem("adminKey", "logos2026");
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password!");
      setPasswordInput("");
    }
  };

  const handleUpload = async () => {
    if (!file || !bookTitle || !chapterNum || !quizId) {
      alert("Please fill in all fields and select a file.");
      return;
    }
    
    setIsProcessing(true);
    setSuccessMessage("");
    setPreviewData(null); 

    const formData = new FormData();
    formData.append("document", file);
    formData.append("quizId", quizId.toLowerCase().trim().replace(/\s+/g, '-')); 
    formData.append("book", bookTitle);
    formData.append("chapter", chapterNum);
    formData.append("append", appendMode.toString()); 
    formData.append("adminKey", localStorage.getItem("adminKey") || "");

    try {
      const response = await fetch("/api/parse-document", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage(`✅ ${data.message}`);
        setFile(null);
        if (data.questions) {
          setPreviewData(data.questions);
        }
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to connect to the server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFetchExisting = async () => {
    if (!bookTitle || !chapterNum) {
      alert("Please enter a Book Name and Chapter to search.");
      return;
    }

    setIsProcessing(true);
    setSuccessMessage("");
    setPreviewData(null);

    try {
      const response = await fetch("/api/get-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: bookTitle,
          chapter: chapterNum,
          adminKey: localStorage.getItem("adminKey") || "",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPreviewData(data.questions);
        setSuccessMessage(`✅ Successfully loaded ${data.questions.length} questions from the database!`);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Fetch failed", error);
      alert("Failed to fetch the quiz.");
    } finally {
      setIsProcessing(false);
    }
  };

  const chapterNumbers = Array.from({ length: 50 }, (_, i) => i + 1);

  if (!isMounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-32 p-8 bg-white rounded-lg shadow-lg border border-gray-200 text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="password" 
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter Master Password" 
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center"
          />
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition">
            Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quiz Builder Admin</h1>
        <div className="space-x-4">
          <button 
            onClick={() => {
              localStorage.removeItem("adminKey");
              setIsAuthenticated(false);
            }} 
            className="text-red-500 font-bold hover:underline"
          >
            Logout
          </button>
          <a href="/" className="text-blue-600 font-bold hover:underline">← Dashboard</a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Manage Database</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Book Display Name</label>
              <input 
                type="text" 
                value={bookTitle} 
                onChange={e => setBookTitle(e.target.value)} 
                className="w-full p-2 border rounded" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Section / Chapter</label>
              <select 
                value={chapterNum} 
                onChange={e => setChapterNum(e.target.value)} 
                className="w-full p-2 border rounded bg-white text-black"
              >
                <option value="intro" className="font-bold text-blue-600">Introduction</option>
                {chapterNumbers.map(num => (
                  <option key={num} value={num.toString()}>Chapter {num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Database Quiz ID</label>
              <input 
                type="text" 
                value={quizId} 
                onChange={e => setQuizId(e.target.value)} 
                className="w-full p-2 border rounded bg-blue-50 text-blue-900 font-mono" 
              />
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <button
              onClick={handleFetchExisting}
              disabled={isProcessing}
              className="w-1/2 py-3 rounded font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition disabled:opacity-50"
            >
              Fetch Existing Quiz
            </button>
            <div className="w-1/2 relative">
              <input 
                type="file" 
                accept=".docx,.pdf"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className={`w-full py-3 rounded font-bold text-center border transition ${
                file ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}>
                {file ? "File Selected ✅" : "Select File"}
              </div>
            </div>
          </div>
          
          {/* MERGE VS OVERWRITE TOGGLE */}
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={appendMode}
                onChange={(e) => setAppendMode(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="font-bold text-gray-800">
                {appendMode ? "➕ Append to Existing Quiz (Merge Mode)" : "⚠️ Overwrite Existing Quiz (Wipe Mode)"}
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-2 ml-8">
              {appendMode 
                ? "Checking this will add the new file's questions to the end of the existing database quiz." 
                : "Leaving this unchecked will permanently delete the old quiz and replace it with the new file."}
            </p>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || isProcessing}
            className={`w-full py-3 rounded font-bold text-white transition ${
              file && !isProcessing ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isProcessing ? "Processing..." : (appendMode ? "Parse File & Merge Data" : "Parse File & Overwrite Data")}
          </button>

          {successMessage && (
            <div className="mt-4 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg font-bold">
              {successMessage}
            </div>
          )}
        </div>
      </div>

      {previewData && (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-2">Quiz Preview</h2>
          <p className="text-gray-500 mb-6">Review the quiz questions. The correct answer is highlighted in green.</p>
          
          <div className="space-y-6 max-h-[600px] overflow-y-auto p-4 border rounded-lg bg-gray-50 shadow-inner">
            {previewData.map((q, idx) => (
              <div key={idx} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  <span className="text-blue-600 mr-2">{q.id}.</span> {q.question}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {q.options.map((opt: string, i: number) => {
                    const isCorrect = opt === q.answer;
                    return (
                      <div 
                        key={i} 
                        className={`p-3 rounded border ${
                          isCorrect 
                            ? 'bg-green-50 border-green-300 text-green-900 font-bold ring-1 ring-green-300' 
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        {isCorrect && "✅ "} {opt}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
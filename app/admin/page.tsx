"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const [bookTitle, setBookTitle] = useState("ruth");
  const [chapterNum, setChapterNum] = useState("intro");
  const [quizId, setQuizId] = useState("ruth-intro");

  // Check if you are already logged in
  useEffect(() => {
    setIsMounted(true);
    if (localStorage.getItem("adminKey") === "logos2026") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const cleanBook = bookTitle.toLowerCase().trim().replace(/\s+/g, '-');
    if (cleanBook && chapterNum) {
      setQuizId(`${cleanBook}-${chapterNum}`);
    }
  }, [bookTitle, chapterNum]);

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
    if (!file || !quizId || !bookTitle || !chapterNum) {
      alert("Please fill in all fields and select a file.");
      return;
    }
    
    setIsProcessing(true);
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("document", file);
    formData.append("quizId", quizId);
    formData.append("book", bookTitle);
    formData.append("chapter", chapterNum);
    // Send the secret key to the backend to prove you are authorized
    formData.append("adminKey", localStorage.getItem("adminKey") || "");

    try {
      const response = await fetch("/api/parse-document", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage(`✅ Successfully parsed ${data.questionCount} questions and saved to database as ${quizId}!`);
        setFile(null);
      } else {
        alert("Error parsing document: " + data.error);
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to connect to the server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const chapterNumbers = Array.from({ length: 50 }, (_, i) => i + 1);

  if (!isMounted) return null;

  // --- LOGIN SCREEN UI ---
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

  // --- MAIN ADMIN DASHBOARD UI ---
  return (
    <div className="max-w-4xl mx-auto p-8 mt-10">
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
          <h2 className="text-xl font-bold mb-4">Upload to Database</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Book Name (English)</label>
              <input 
                type="text" 
                value={bookTitle} 
                onChange={e => setBookTitle(e.target.value)} 
                className="w-full p-2 border rounded" 
                placeholder="e.g. ruth, genesis" 
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
                <option value="similar-verses" className="font-bold text-blue-600">Similar Verses</option>
                <option value="misc" className="font-bold text-blue-600">Miscellaneous</option>
                <option value="mock-test" className="font-bold text-purple-600">Mock Test</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Unique Quiz ID</label>
              <input 
                type="text" 
                value={quizId} 
                onChange={e => setQuizId(e.target.value)} 
                className="w-full p-2 border rounded bg-gray-50 text-gray-600" 
                placeholder="e.g. ruth-2" 
              />
            </div>
          </div>

          <input 
            type="file" 
            accept=".docx,.pdf"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          <button
            onClick={handleUpload}
            disabled={!file || isProcessing}
            className={`w-full py-3 rounded font-bold text-white transition ${
              file && !isProcessing ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isProcessing ? "Processing via AI..." : "Parse & Save to Database"}
          </button>

          {successMessage && (
            <div className="mt-4 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg font-bold">
              {successMessage}
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-blue-900">
          <h2 className="text-lg font-bold mb-2">📝 Document Guide</h2>
          <div className="bg-white p-3 rounded border border-blue-200 font-mono text-sm mb-4 shadow-sm">
            1. റൂത്ത് അധ്യായം ഒന്നിൽ എത്ര വാക്യങ്ങൾ ഉണ്ട്?<br/>
            ഉത്തരം: 22 വാക്യങ്ങൾ, 22, ഇരുപത്തിരണ്ട്
          </div>
          <ul className="text-sm list-disc pl-4 space-y-1">
            <li>Supports both <strong>.docx (Word)</strong> and <strong>.pdf</strong></li>
            <li>Questions <strong>must</strong> start with a number (1. , 2. )</li>
            <li>Answers <strong>must</strong> start with "ഉത്തരം:"</li>
            <li>Separate multiple answers with a <strong>comma</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
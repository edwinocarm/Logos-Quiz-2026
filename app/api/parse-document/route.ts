import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { supabase } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai"; 

function shuffleArray(array: any[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("document") as File;
    const quizId = formData.get("quizId") as string;
    const book = formData.get("book") as string;
    const chapter = formData.get("chapter") as string;
    const adminKey = formData.get("adminKey") as string;

    // --- SECURITY LOCK ---
    if (adminKey !== "logos2026") {
      return NextResponse.json({ error: "Unauthorized. Incorrect admin password." }, { status: 401 });
    }

    if (!file || !quizId || !book || !chapter) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || !process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Missing API Keys in .env.local" }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";
    const fileName = file.name.toLowerCase();

    // 1. EXTRACT TEXT
    if (fileName.endsWith('.pdf')) {
      const CONVERT_API_SECRET = "Z7d9bvt6F2tpQwvilebWAs3NXuLRFazu"; 
      const apiFormData = new FormData();
      apiFormData.append('File', file); 

      const apiRes = await fetch(`https://v2.convertapi.com/convert/pdf/to/txt?Secret=${CONVERT_API_SECRET}`, {
        method: 'POST',
        body: apiFormData
      });

      if (!apiRes.ok) throw new Error("ConvertAPI failed to process the PDF");
      const data = await apiRes.json();
      extractedText = Buffer.from(data.Files[0].FileData, 'base64').toString('utf-8');
    } else if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: "Could not extract text from document." }, { status: 400 });
    }

    // 2. THE CHUNKING ENGINE (MALAYALAM OPTIMIZED)
    const lines = extractedText.split('\n');
    const chunks = [];
    let currentChunk = "";

    for (const line of lines) {
      if (currentChunk.length + line.length > 2000) {
        chunks.push(currentChunk);
        currentChunk = line + '\n';
      } else {
        currentChunk += line + '\n';
      }
    }
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk);
    }

    console.log(`Document split into ${chunks.length} safe, lightweight chunks.`);

    // 3. INITIALIZE BOTH AI ENGINES
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-3.6-flash", 
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 8192 }
    });
    
    const groq = new OpenAI({ 
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1" 
    });

    let allQuestions: any[] = [];

    // 4. PROCESS EACH CHUNK SEQUENTIALLY
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i + 1} of ${chunks.length}...`);
      
      const prompt = `
      You are an elite, strict examiner for the Kerala Catholic Bible Society "Logos Quiz". 
      I am providing you with PART ${i + 1} of an extracted Malayalam text from a Bible quiz document for the book of ${book}, Chapter ${chapter}.
      
      Your task:
      1. Extract all the questions and correct answers from THIS CHUNK of text.
      2. Fix any Malayalam OCR spelling errors.
      3. Remove any verse references attached to the answers.
      4. For EVERY question, generate exactly 3 WRONG answers (distractors) in Malayalam using characters/places from other chapters to make it tricky.
      
      Output strictly as a JSON object containing an array called "questions".
      CRITICAL INSTRUCTION: You must use the ACTUAL extracted text for the questions and answers. Do NOT output placeholder text.
      
      Format like this:
      {
        "questions": [
          {
            "id": 1,
            "question": "<Insert Actual Malayalam Question Here>",
            "answer": "<Insert Actual Correct Malayalam Answer Here>",
            "options": ["<Correct Answer>", "<Tricky Wrong Answer 1>", "<Tricky Wrong Answer 2>", "<Tricky Wrong Answer 3>"] 
          }
        ]
      }

      Document Text (Part ${i + 1}):
      """
      ${chunks[i]}
      """
      `;

      let chunkSuccess = false;

      // ATTEMPT 1: GEMINI 3.6
      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsedData = JSON.parse(responseText);
        
        if (parsedData.questions && Array.isArray(parsedData.questions)) {
          allQuestions = allQuestions.concat(parsedData.questions);
          console.log(`Chunk ${i + 1} parsed by GEMINI. Added ${parsedData.questions.length} questions.`);
          chunkSuccess = true;
        }
      } catch (geminiError: any) {
        console.warn(`Gemini failed on chunk ${i + 1}: ${geminiError.message}. Switching to GROQ...`);
      }

      // ATTEMPT 2: GROQ
      if (!chunkSuccess) {
        try {
          const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant", 
            response_format: { type: "json_object" }, 
            messages: [
              { role: "system", content: prompt }
            ],
          });

          const responseText = response.choices[0].message.content || "{}";
          const parsedData = JSON.parse(responseText);

          if (parsedData.questions && Array.isArray(parsedData.questions)) {
            allQuestions = allQuestions.concat(parsedData.questions);
            console.log(`Chunk ${i + 1} parsed by GROQ. Added ${parsedData.questions.length} questions.`);
          }
        } catch (groqError: any) {
          console.error(`BOTH engines failed on chunk ${i + 1}. Error: ${groqError.message}`);
        }
      }

      // Pause for 3.5 seconds to cool down API limits before the next chunk
      await new Promise(resolve => setTimeout(resolve, 3500));
    }

    // 5. FINAL VALIDATION
    if (allQuestions.length === 0) {
      return NextResponse.json({ error: "Both AIs failed to extract valid questions from the document." }, { status: 500 });
    }

    // 6. SHUFFLE & RE-ID
    const enhancedQuestions = allQuestions.map((q: any, index: number) => ({
      ...q,
      id: index + 1, // Ensure clean, sequential IDs from 1 to 100+
      options: shuffleArray(q.options) 
    }));

    // 7. PUSH TO SUPABASE
    const { error: dbError } = await supabase
      .from('chapters')
      .upsert({
        id: quizId,
        book: book,
        chapter: chapter,
        questions: enhancedQuestions,
        is_available: true
      });

    if (dbError) return NextResponse.json({ error: "Database error: " + dbError.message }, { status: 500 });

    console.log(`SUCCESS: Total of ${enhancedQuestions.length} questions saved to database!`);
    return NextResponse.json({ success: true, questionCount: enhancedQuestions.length });
    
  } catch (error: any) {
    console.error("Master Parser Error:", error.message || error);
    return NextResponse.json({ error: "Failed to parse document via AI" }, { status: 500 });
  }
}
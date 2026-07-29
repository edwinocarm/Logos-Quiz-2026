import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { supabase } from "@/lib/supabase";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Keeps the Vercel server alive for up to 5 minutes to prevent timeouts
export const maxDuration = 300; 

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

    if (adminKey !== "logos2026") {
      return NextResponse.json({ error: "Unauthorized. Incorrect admin password." }, { status: 401 });
    }

    if (!file || !quizId || !book || !chapter) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY in .env.local" }, { status: 500 });
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

    // 2. THE CHUNKING ENGINE (5000 characters)
    const lines = extractedText.split('\n');
    const chunks = [];
    let currentChunk = "";

    for (const line of lines) {
      if (currentChunk.length + line.length > 5000) {
        chunks.push(currentChunk);
        currentChunk = line + '\n';
      } else {
        currentChunk += line + '\n';
      }
    }
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk);
    }

    console.log(`Document split into ${chunks.length} safe chunks.`);

    // 3. INITIALIZE GEMINI AI (With Safety Filters DISABLED)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-3.6-flash", 
        // Note: Temperature, top_p, and top_k are deprecated for 3.6 Flash and omitted here
        generationConfig: { 
            responseMimeType: "application/json", 
            maxOutputTokens: 8192 
        },
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
    });

    let allQuestions: any[] = [];

    // 4. PROCESS EACH CHUNK SEQUENTIALLY
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i + 1} of ${chunks.length}...`);
      
      const prompt = `
      You are an elite, strict examiner for the Kerala Catholic Bible Society "Logos Quiz". 
      I am providing you with PART ${i + 1} of an extracted Malayalam text from a Bible quiz document for the book of ${book}, Chapter ${chapter}.
      
      Your task:
      1. Extract all the valid questions and correct answers from THIS CHUNK of text.
      2. Remove any verse references attached to the answers.
      3. For EVERY question, generate exactly 3 WRONG answers (distractors) in Malayalam.
      4. CRITICAL: If a sentence or question is cut off at the beginning or end of this text, DO NOT try to guess it. SKIP IT entirely. NEVER output random or gibberish Malayalam letters. Only output fully readable, real Malayalam questions.
      
      Output strictly as a JSON object containing an array called "questions". Use the ACTUAL extracted text for questions and answers.
      
      Format like this:
      {
        "questions": [
          {
            "id": 1,
            "question": "<Actual Malayalam Question>",
            "answer": "<Actual Correct Malayalam Answer>",
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
      let retries = 0;

      while (!chunkSuccess && retries < 3) {
        try {
          const result = await model.generateContent(prompt);
          let responseText = result.response.text();
          
          responseText = responseText.replace(/```json/g, '').replace(/```/g, '');
          const parsedData = JSON.parse(responseText);
          
          if (parsedData.questions && Array.isArray(parsedData.questions)) {
            allQuestions = allQuestions.concat(parsedData.questions);
            console.log(`Chunk ${i + 1} parsed successfully on attempt ${retries + 1}. Added ${parsedData.questions.length} questions.`);
            chunkSuccess = true;
          }
        } catch (error: any) {
          retries++;
          console.warn(`Gemini failed on chunk ${i + 1} (Attempt ${retries}): ${error.message}. Retrying in 4 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 4000));
        }
      }

      if (!chunkSuccess) {
        console.error(`FAILED to parse chunk ${i + 1} after 3 attempts. Skipping this chunk.`);
      }
    }

    // 5. FINAL VALIDATION
    if (allQuestions.length === 0) {
      return NextResponse.json({ error: "AI failed to extract any valid questions from the document." }, { status: 500 });
    }

    // 6. SHUFFLE & RE-ID
    const enhancedQuestions = allQuestions.map((q: any, index: number) => ({
      ...q,
      id: index + 1, 
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
    
    return NextResponse.json({ success: true, questionCount: enhancedQuestions.length, questions: enhancedQuestions });
    
  } catch (error: any) {
    console.error("Master Parser Error:", error.message || error);
    return NextResponse.json({ error: "Failed to parse document via AI" }, { status: 500 });
  }
}
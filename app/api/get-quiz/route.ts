import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { book, chapter, adminKey } = body;

    // Security Check
    if (adminKey !== "logos2026") {
      return NextResponse.json({ error: "Unauthorized. Incorrect admin password." }, { status: 401 });
    }

    if (!book || !chapter) {
      return NextResponse.json({ error: "Missing book or chapter parameters." }, { status: 400 });
    }

    // Search Supabase for the matching book and chapter
    const { data, error } = await supabase
      .from('chapters')
      .select('questions')
      .eq('book', book)
      .eq('chapter', chapter)
      .limit(1)
      .single();

    // THE FIX: If no quiz is found, return a 200 status with an empty array.
    // This stops Next.js from injecting an HTML 404 page!
    if (error || !data) {
      return NextResponse.json({ 
        success: false, 
        questions: [], // Send an empty array so the frontend doesn't crash
        message: "Quiz not found in database. Ready for fresh upload." 
      }, { status: 200 }); // <-- Changed to 200 OK
    }

    return NextResponse.json({ success: true, questions: data.questions }, { status: 200 });
    
  } catch (error: any) {
    console.error("Fetch Error:", error.message || error);
    return NextResponse.json({ error: "Failed to fetch quiz from database." }, { status: 500 });
  }
}
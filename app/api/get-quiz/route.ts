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
      // .limit(1).single() ensures we only grab the first match
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Quiz not found in database. Make sure the Book name matches exactly." }, { status: 404 });
    }

    return NextResponse.json({ success: true, questions: data.questions });
    
  } catch (error: any) {
    console.error("Fetch Error:", error.message || error);
    return NextResponse.json({ error: "Failed to fetch quiz from database." }, { status: 500 });
  }
}
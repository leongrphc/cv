import { NextRequest, NextResponse } from "next/server";
import { compareJobs } from "@/lib/llm-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cvText, jobs } = body;

    if (!cvText || !jobs || !Array.isArray(jobs) || jobs.length < 2) {
      return NextResponse.json(
        { success: false, error: "CV metni ve en az 2 iş ilanı gerekli" },
        { status: 400 }
      );
    }

    const result = await compareJobs(cvText, jobs);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Job comparison error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "İlanlar karşılaştırılırken hata oluştu",
      },
      { status: 500 }
    );
  }
}

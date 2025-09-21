import { type NextRequest, NextResponse } from "next/server"
import { HuggingFaceService } from "@/lib/huggingface"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 })
    }

    const hfService = new HuggingFaceService()
    const summary = await hfService.summarizeDocument(text)

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Summarization error:", error)
    return NextResponse.json({ error: "Failed to generate summary. Please try again." }, { status: 500 })
  }
}

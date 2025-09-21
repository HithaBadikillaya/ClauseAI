import { type NextRequest, NextResponse } from "next/server"
import { DocumentAnalyzer } from "@/lib/document-analyzer"

export async function POST(request: NextRequest) {
  try {
    const { text, metadata, enhanced = false } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 })
    }

    if (text.length > 100000) {
      return NextResponse.json({ error: "Document too large. Maximum 100,000 characters allowed." }, { status: 400 })
    }

    const analyzer = new DocumentAnalyzer()

    // Use enhanced analysis if requested
    const analysis = enhanced ? await analyzer.analyzeDocumentEnhanced(text) : await analyzer.analyzeDocument(text)

    // Add metadata to analysis result
    if (metadata) {
      analysis.metadata = metadata
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze document. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

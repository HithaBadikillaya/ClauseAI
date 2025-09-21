import { AIAnalysisEngine, type AnalysisProgress, type EnhancedAnalysis } from "./ai-analysis-engine"
import type { DocumentAnalysis } from "./types"

export class DocumentAnalyzer {
  private aiEngine: AIAnalysisEngine

  constructor() {
    this.aiEngine = new AIAnalysisEngine()
  }

  async analyzeDocument(text: string, onProgress?: (progress: AnalysisProgress) => void): Promise<DocumentAnalysis> {
    try {
      // Use the enhanced AI analysis engine
      const enhancedAnalysis = await this.aiEngine.analyzeDocument(text, onProgress)

      // Return the base DocumentAnalysis interface for backward compatibility
      return {
        id: enhancedAnalysis.id,
        originalText: enhancedAnalysis.originalText,
        summary: enhancedAnalysis.summary,
        riskyClausesList: enhancedAnalysis.riskyClausesList,
        uploadedAt: enhancedAnalysis.uploadedAt,
        status: enhancedAnalysis.status,
        metadata: enhancedAnalysis.metadata,
      }
    } catch (error) {
      console.error("Document analysis error:", error)
      const id = crypto.randomUUID()
      return {
        id,
        originalText: text,
        summary: "Error generating summary",
        riskyClausesList: [],
        uploadedAt: new Date(),
        status: "error",
      }
    }
  }

  // Method to get enhanced analysis with all features
  async analyzeDocumentEnhanced(
    text: string,
    onProgress?: (progress: AnalysisProgress) => void,
  ): Promise<EnhancedAnalysis> {
    return await this.aiEngine.analyzeDocument(text, onProgress)
  }
}

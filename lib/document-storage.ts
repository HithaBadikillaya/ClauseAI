import type { DocumentAnalysis } from "./types"

export interface DocumentHistory {
  analyses: DocumentAnalysis[]
  totalDocuments: number
  totalRisksFound: number
  lastAnalyzed?: Date
}

export class DocumentStorage {
  private static readonly STORAGE_KEY = "legal-ai-documents"
  private static readonly MAX_STORED_DOCUMENTS = 50

  static saveAnalysis(analysis: DocumentAnalysis): void {
    try {
      const existing = this.getHistory()
      const updated = {
        ...existing,
        analyses: [analysis, ...existing.analyses.slice(0, this.MAX_STORED_DOCUMENTS - 1)],
        totalDocuments: existing.totalDocuments + 1,
        totalRisksFound: existing.totalRisksFound + analysis.riskyClausesList.length,
        lastAnalyzed: new Date(),
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error("Failed to save document analysis:", error)
    }
  }

  static getHistory(): DocumentHistory {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        return {
          analyses: [],
          totalDocuments: 0,
          totalRisksFound: 0,
        }
      }

      const parsed = JSON.parse(stored)
      // Convert date strings back to Date objects
      return {
        ...parsed,
        analyses: parsed.analyses.map((analysis: any) => ({
          ...analysis,
          uploadedAt: new Date(analysis.uploadedAt),
        })),
        lastAnalyzed: parsed.lastAnalyzed ? new Date(parsed.lastAnalyzed) : undefined,
      }
    } catch (error) {
      console.error("Failed to load document history:", error)
      return {
        analyses: [],
        totalDocuments: 0,
        totalRisksFound: 0,
      }
    }
  }

  static deleteAnalysis(id: string): void {
    try {
      const existing = this.getHistory()
      const analysisToDelete = existing.analyses.find((a) => a.id === id)

      if (analysisToDelete) {
        const updated = {
          ...existing,
          analyses: existing.analyses.filter((a) => a.id !== id),
          totalRisksFound: existing.totalRisksFound - analysisToDelete.riskyClausesList.length,
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))
      }
    } catch (error) {
      console.error("Failed to delete document analysis:", error)
    }
  }

  static clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error("Failed to clear document history:", error)
    }
  }

  static exportHistory(): string {
    const history = this.getHistory()
    return JSON.stringify(history, null, 2)
  }

  static getAnalysisById(id: string): DocumentAnalysis | undefined {
    const history = this.getHistory()
    return history.analyses.find((analysis) => analysis.id === id)
  }

  static getRecentAnalyses(limit = 10): DocumentAnalysis[] {
    const history = this.getHistory()
    return history.analyses.slice(0, limit)
  }

  static getAnalyticsSummary() {
    const history = this.getHistory()
    const analyses = history.analyses

    if (analyses.length === 0) {
      return {
        totalDocuments: 0,
        totalRisks: 0,
        avgRisksPerDocument: 0,
        riskDistribution: { high: 0, medium: 0, low: 0 },
        categoryDistribution: {},
        recentActivity: [],
      }
    }

    const riskDistribution = { high: 0, medium: 0, low: 0 }
    const categoryDistribution: Record<string, number> = {}

    analyses.forEach((analysis) => {
      analysis.riskyClausesList.forEach((clause) => {
        riskDistribution[clause.riskLevel]++
        categoryDistribution[clause.category] = (categoryDistribution[clause.category] || 0) + 1
      })
    })

    return {
      totalDocuments: analyses.length,
      totalRisks: history.totalRisksFound,
      avgRisksPerDocument: Math.round((history.totalRisksFound / analyses.length) * 10) / 10,
      riskDistribution,
      categoryDistribution,
      recentActivity: analyses.slice(0, 5),
    }
  }
}

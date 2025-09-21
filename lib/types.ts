export interface DocumentAnalysis {
  id: string
  originalText: string
  summary: string
  riskyClausesList: RiskyClause[]
  uploadedAt: Date
  status: "processing" | "completed" | "error"
  metadata?: {
    files?: Array<{
      fileName: string
      fileSize: number
      fileType: string
      pageCount?: number
    }>
    totalFiles?: number
    hasManualText?: boolean
  }
}

export interface RiskyClause {
  id: string
  text: string
  riskLevel: "high" | "medium" | "low"
  category: "data-sharing" | "arbitration" | "tracking" | "other"
  explanation: string
  startIndex: number
  endIndex: number
}

export interface HuggingFaceResponse {
  summary_text?: string
  label?: string
  score?: number
}

export interface DocumentHistory {
  analyses: DocumentAnalysis[]
  totalDocuments: number
  totalRisksFound: number
  lastAnalyzed?: Date
}

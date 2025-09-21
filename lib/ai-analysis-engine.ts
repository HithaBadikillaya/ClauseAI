import { HuggingFaceService } from "./huggingface"
import type { DocumentAnalysis, RiskyClause } from "./types"

export interface AnalysisProgress {
  stage: string
  progress: number
  message: string
}

export interface EnhancedAnalysis extends DocumentAnalysis {
  keyTerms: string[]
  documentType: string
  readabilityScore: number
  sentimentAnalysis: {
    overall: "positive" | "neutral" | "negative"
    score: number
  }
  legalComplexity: "low" | "medium" | "high"
  recommendations: string[]
}

export class AIAnalysisEngine {
  private hfService: HuggingFaceService

  constructor() {
    this.hfService = new HuggingFaceService()
  }

  async analyzeDocument(text: string, onProgress?: (progress: AnalysisProgress) => void): Promise<EnhancedAnalysis> {
    const id = crypto.randomUUID()

    try {
      onProgress?.({ stage: "initialization", progress: 5, message: "Starting analysis..." })

      // Document preprocessing
      const preprocessedText = this.preprocessText(text)
      onProgress?.({ stage: "preprocessing", progress: 15, message: "Preprocessing document..." })

      // Parallel analysis tasks
      const analysisPromises = [
        this.generateSummary(preprocessedText),
        this.identifyRiskyClauses(preprocessedText),
        this.extractKeyTerms(preprocessedText),
        this.detectDocumentType(preprocessedText),
        this.calculateReadabilityScore(preprocessedText),
        this.analyzeSentiment(preprocessedText),
        this.assessLegalComplexity(preprocessedText),
      ]

      onProgress?.({ stage: "ai-processing", progress: 30, message: "Running AI analysis..." })

      const [summary, riskyClausesList, keyTerms, documentType, readabilityScore, sentimentAnalysis, legalComplexity] =
        await Promise.all(analysisPromises)

      onProgress?.({ stage: "generating-recommendations", progress: 85, message: "Generating recommendations..." })

      // Generate recommendations based on analysis
      const recommendations = this.generateRecommendations({
        riskyClausesList,
        documentType,
        legalComplexity,
        sentimentAnalysis,
      })

      onProgress?.({ stage: "finalizing", progress: 100, message: "Analysis complete!" })

      return {
        id,
        originalText: text,
        summary,
        riskyClausesList,
        uploadedAt: new Date(),
        status: "completed",
        keyTerms,
        documentType,
        readabilityScore,
        sentimentAnalysis,
        legalComplexity,
        recommendations,
      }
    } catch (error) {
      console.error("Enhanced document analysis error:", error)
      return {
        id,
        originalText: text,
        summary: "Error generating summary",
        riskyClausesList: [],
        uploadedAt: new Date(),
        status: "error",
        keyTerms: [],
        documentType: "unknown",
        readabilityScore: 0,
        sentimentAnalysis: { overall: "neutral", score: 0 },
        legalComplexity: "medium",
        recommendations: ["Analysis failed. Please try again with a different document."],
      }
    }
  }

  private preprocessText(text: string): string {
    return text
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/[^\w\s.,;:!?()-]/g, "") // Remove special characters
      .trim()
  }

  private async generateSummary(text: string): Promise<string> {
    try {
      // For very long documents, chunk and summarize
      if (text.length > 4000) {
        const chunks = this.chunkText(text, 3000)
        const summaries = await Promise.all(chunks.map((chunk) => this.hfService.summarizeDocument(chunk)))

        // Combine and re-summarize if needed
        const combinedSummary = summaries.join(" ")
        if (combinedSummary.length > 1000) {
          return await this.hfService.summarizeDocument(combinedSummary)
        }
        return combinedSummary
      }

      return await this.hfService.summarizeDocument(text)
    } catch (error) {
      console.error("Summary generation error:", error)
      return "Unable to generate summary due to processing error."
    }
  }

  private async identifyRiskyClauses(text: string): Promise<RiskyClause[]> {
    const clauses: RiskyClause[] = []
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20)

    // Enhanced risk patterns with more comprehensive detection
    const riskPatterns = [
      {
        pattern:
          /data.*shar(e|ing)|information.*third.party|personal.*data.*transfer|sell.*information|disclose.*data/i,
        category: "data-sharing" as const,
        explanation: "This clause may allow sharing or selling of your personal data with third parties",
        severity: 0.8,
      },
      {
        pattern: /arbitration|dispute.*resolution|waive.*right.*sue|class.*action|binding.*arbitration|jury.*trial/i,
        category: "arbitration" as const,
        explanation:
          "This clause may limit your legal rights and force private arbitration instead of court proceedings",
        severity: 0.9,
      },
      {
        pattern: /track(ing)?|monitor|behavioral.*data|usage.*pattern|analytics|cookies|pixel|beacon/i,
        category: "tracking" as const,
        explanation: "This clause may allow extensive tracking of your behavior and activities",
        severity: 0.6,
      },
      {
        pattern: /automatic.*renewal|auto.*renew|continue.*billing|recurring.*charge|unless.*cancel/i,
        category: "other" as const,
        explanation: "This clause establishes automatic renewal terms that may be difficult to cancel",
        severity: 0.7,
      },
      {
        pattern: /liability.*limit|damages.*exclude|consequential.*damages|indirect.*damages|not.*liable/i,
        category: "other" as const,
        explanation: "This clause may limit the company's liability for damages or losses",
        severity: 0.5,
      },
      {
        pattern: /terminate.*account|suspend.*service|discontinue.*access|modify.*terms|change.*agreement/i,
        category: "other" as const,
        explanation: "This clause gives the company broad rights to terminate or modify services",
        severity: 0.4,
      },
    ]

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim()

      for (const { pattern, category, explanation, severity } of riskPatterns) {
        if (pattern.test(sentence)) {
          const riskScore = this.calculateEnhancedRiskScore(sentence, severity)

          clauses.push({
            id: crypto.randomUUID(),
            text: sentence,
            riskLevel: riskScore > 0.7 ? "high" : riskScore > 0.4 ? "medium" : "low",
            category,
            explanation,
            startIndex: text.indexOf(sentence),
            endIndex: text.indexOf(sentence) + sentence.length,
          })
        }
      }
    }

    return clauses
  }

  private calculateEnhancedRiskScore(text: string, baseSeverity: number): number {
    const highRiskWords = ["mandatory", "required", "must", "shall", "waive", "forfeit", "irrevocable", "perpetual"]
    const mediumRiskWords = ["may", "can", "might", "could", "allow", "permit", "authorize"]
    const mitigatingWords = ["reasonable", "necessary", "appropriate", "limited", "opt-out", "consent"]

    let score = baseSeverity
    const words = text.toLowerCase().split(/\s+/)

    words.forEach((word) => {
      if (highRiskWords.includes(word)) score += 0.2
      if (mediumRiskWords.includes(word)) score += 0.1
      if (mitigatingWords.includes(word)) score -= 0.1
    })

    return Math.max(0, Math.min(score, 1))
  }

  private extractKeyTerms(text: string): string[] {
    // Simple keyword extraction based on frequency and legal relevance
    const legalTerms = [
      "agreement",
      "contract",
      "terms",
      "conditions",
      "privacy",
      "data",
      "information",
      "liability",
      "damages",
      "breach",
      "termination",
      "intellectual property",
      "copyright",
      "trademark",
      "confidential",
      "proprietary",
      "indemnification",
      "warranty",
      "disclaimer",
      "arbitration",
      "jurisdiction",
      "governing law",
      "force majeure",
      "assignment",
    ]

    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || []
    const wordFreq: Record<string, number> = {}

    words.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    })

    // Prioritize legal terms and high-frequency words
    const keyTerms = Object.entries(wordFreq)
      .filter(([word, freq]) => freq > 2 || legalTerms.includes(word))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word)

    return keyTerms
  }

  private detectDocumentType(text: string): string {
    const documentTypes = [
      { type: "Privacy Policy", patterns: [/privacy.*policy/i, /data.*collection/i, /personal.*information/i] },
      { type: "Terms of Service", patterns: [/terms.*service/i, /user.*agreement/i, /acceptable.*use/i] },
      {
        type: "Employment Contract",
        patterns: [/employment.*agreement/i, /job.*description/i, /salary/i, /benefits/i],
      },
      { type: "Software License", patterns: [/software.*license/i, /end.*user.*license/i, /intellectual.*property/i] },
      { type: "Service Agreement", patterns: [/service.*agreement/i, /professional.*services/i, /statement.*work/i] },
      { type: "Lease Agreement", patterns: [/lease.*agreement/i, /rental.*agreement/i, /landlord.*tenant/i] },
      { type: "Purchase Agreement", patterns: [/purchase.*agreement/i, /sale.*agreement/i, /buyer.*seller/i] },
    ]

    for (const { type, patterns } of documentTypes) {
      if (patterns.some((pattern) => pattern.test(text))) {
        return type
      }
    }

    return "Legal Document"
  }

  private calculateReadabilityScore(text: string): number {
    // Simplified Flesch Reading Ease calculation
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    const words = text.split(/\s+/).filter((w) => w.length > 0).length
    const syllables = this.countSyllables(text)

    if (sentences === 0 || words === 0) return 0

    const avgSentenceLength = words / sentences
    const avgSyllablesPerWord = syllables / words

    const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord
    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().match(/\b\w+\b/g) || []
    return words.reduce((total, word) => {
      const syllableCount = word.match(/[aeiouy]+/g)?.length || 1
      return total + Math.max(1, syllableCount)
    }, 0)
  }

  private analyzeSentiment(text: string): { overall: "positive" | "neutral" | "negative"; score: number } {
    // Simple sentiment analysis based on word patterns
    const positiveWords = ["benefit", "protect", "secure", "guarantee", "ensure", "provide", "support"]
    const negativeWords = ["restrict", "prohibit", "liable", "penalty", "forfeit", "terminate", "breach", "violation"]

    const words = text.toLowerCase().split(/\s+/)
    let positiveCount = 0
    let negativeCount = 0

    words.forEach((word) => {
      if (positiveWords.some((pos) => word.includes(pos))) positiveCount++
      if (negativeWords.some((neg) => word.includes(neg))) negativeCount++
    })

    const totalSentimentWords = positiveCount + negativeCount
    if (totalSentimentWords === 0) return { overall: "neutral", score: 0 }

    const score = (positiveCount - negativeCount) / totalSentimentWords

    if (score > 0.1) return { overall: "positive", score: Math.round(score * 100) / 100 }
    if (score < -0.1) return { overall: "negative", score: Math.round(score * 100) / 100 }
    return { overall: "neutral", score: Math.round(score * 100) / 100 }
  }

  private assessLegalComplexity(text: string): "low" | "medium" | "high" {
    const complexLegalTerms = [
      "heretofore",
      "whereas",
      "notwithstanding",
      "indemnification",
      "subrogation",
      "ipso facto",
      "pro rata",
      "force majeure",
      "liquidated damages",
      "estoppel",
    ]

    const avgWordsPerSentence = this.calculateAverageWordsPerSentence(text)
    const complexTermCount = complexLegalTerms.filter((term) => text.toLowerCase().includes(term)).length

    const readabilityScore = this.calculateReadabilityScore(text)

    // Complexity scoring
    let complexityScore = 0
    if (avgWordsPerSentence > 25) complexityScore += 1
    if (complexTermCount > 3) complexityScore += 1
    if (readabilityScore < 30) complexityScore += 1

    if (complexityScore >= 2) return "high"
    if (complexityScore === 1) return "medium"
    return "low"
  }

  private calculateAverageWordsPerSentence(text: string): number {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const totalWords = text.split(/\s+/).filter((w) => w.length > 0).length
    return sentences.length > 0 ? totalWords / sentences.length : 0
  }

  private generateRecommendations(analysis: {
    riskyClausesList: RiskyClause[]
    documentType: string
    legalComplexity: "low" | "medium" | "high"
    sentimentAnalysis: { overall: string; score: number }
  }): string[] {
    const recommendations: string[] = []

    // Risk-based recommendations
    const highRiskClauses = analysis.riskyClausesList.filter((c) => c.riskLevel === "high")
    if (highRiskClauses.length > 0) {
      recommendations.push(
        `⚠️ ${highRiskClauses.length} high-risk clause${highRiskClauses.length > 1 ? "s" : ""} identified. Consider legal review before signing.`,
      )
    }

    const dataSharing = analysis.riskyClausesList.filter((c) => c.category === "data-sharing")
    if (dataSharing.length > 0) {
      recommendations.push(
        "🔒 Review data sharing provisions carefully. Consider if you're comfortable with how your information may be used.",
      )
    }

    const arbitration = analysis.riskyClausesList.filter((c) => c.category === "arbitration")
    if (arbitration.length > 0) {
      recommendations.push(
        "⚖️ Arbitration clauses limit your right to sue. Understand the dispute resolution process before agreeing.",
      )
    }

    // Complexity-based recommendations
    if (analysis.legalComplexity === "high") {
      recommendations.push(
        "📚 This document contains complex legal language. Consider consulting with a legal professional.",
      )
    }

    // Document type specific recommendations
    if (analysis.documentType === "Employment Contract") {
      recommendations.push(
        "💼 For employment contracts, pay special attention to non-compete, confidentiality, and termination clauses.",
      )
    } else if (analysis.documentType === "Privacy Policy") {
      recommendations.push(
        "🔐 Review what personal data is collected, how it's used, and your rights regarding your information.",
      )
    }

    // General recommendations
    if (analysis.riskyClausesList.length === 0) {
      recommendations.push("✅ No major risk indicators found, but always read the full document carefully.")
    }

    recommendations.push(
      "💡 This analysis is for informational purposes only and doesn't replace professional legal advice.",
    )

    return recommendations
  }

  private chunkText(text: string, maxLength: number): string[] {
    const chunks: string[] = []
    const sentences = text.split(/[.!?]+/)
    let currentChunk = ""

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxLength && currentChunk) {
        chunks.push(currentChunk.trim())
        currentChunk = sentence
      } else {
        currentChunk += sentence + "."
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim())
    }

    return chunks
  }
}

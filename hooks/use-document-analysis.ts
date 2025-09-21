"use client"

import { useState } from "react"
import type { DocumentAnalysis } from "@/lib/types"
import type { AnalysisProgress } from "@/lib/ai-analysis-engine"
import { getErrorMessage } from "@/lib/error-handler"

export function useDocumentAnalysis() {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<AnalysisProgress>({
    stage: "idle",
    progress: 0,
    message: "Ready to analyze",
  })

  const analyzeDocument = async (text: string, metadata?: any) => {
    setIsLoading(true)
    setError(null)
    setAnalysis(null)
    setProgress({ stage: "starting", progress: 0, message: "Initializing analysis..." })

    try {
      // Validate input
      if (!text.trim()) {
        throw new Error("Please provide document text to analyze.")
      }

      if (text.length < 100) {
        throw new Error("Document is too short. Please provide at least 100 characters.")
      }

      if (text.length > 100000) {
        throw new Error("Document is too long. Maximum 100,000 characters allowed.")
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      // Create a progress tracking system
      const progressInterval = setInterval(() => {
        setProgress((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 2, 95),
        }))
      }, 1000)

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, metadata, enhanced: true }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      // Validate response structure
      if (!result || typeof result !== "object") {
        throw new Error("Invalid response from analysis service.")
      }

      setProgress({ stage: "completed", progress: 100, message: "Analysis complete!" })
      setAnalysis(result)
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      setProgress({ stage: "error", progress: 0, message: "Analysis failed" })
      console.error("Document analysis error:", err)
    } finally {
      setIsLoading(false)
      // Reset progress after a delay
      setTimeout(() => {
        setProgress({ stage: "idle", progress: 0, message: "Ready to analyze" })
      }, 3000)
    }
  }

  const reset = () => {
    setAnalysis(null)
    setError(null)
    setIsLoading(false)
    setProgress({ stage: "idle", progress: 0, message: "Ready to analyze" })
  }

  return {
    analysis,
    isLoading,
    error,
    progress,
    analyzeDocument,
    reset,
  }
}

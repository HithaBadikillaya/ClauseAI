"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DocumentStorage } from "@/lib/document-storage"
import { DashboardHeader } from "@/components/dashboard-header"
import { DocumentHistory } from "@/components/document-history"
import { ResultsDashboard } from "@/components/results-dashboard"
import type { DocumentAnalysis, DocumentHistory as DocumentHistoryType } from "@/lib/types"

export default function DashboardPage() {
  const [history, setHistory] = useState<DocumentHistoryType>({
    analyses: [],
    totalDocuments: 0,
    totalRisksFound: 0,
  })
  const [selectedAnalysis, setSelectedAnalysis] = useState<DocumentAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load document history on component mount
    const loadHistory = () => {
      try {
        const documentHistory = DocumentStorage.getHistory()
        setHistory(documentHistory)
      } catch (error) {
        console.error("Failed to load document history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [])

  const handleViewAnalysis = (analysis: DocumentAnalysis) => {
    setSelectedAnalysis(analysis)
  }

  const handleDeleteAnalysis = (id: string) => {
    if (confirm("Are you sure you want to delete this analysis?")) {
      DocumentStorage.deleteAnalysis(id)
      const updatedHistory = DocumentStorage.getHistory()
      setHistory(updatedHistory)

      // If the deleted analysis was currently selected, clear selection
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(null)
      }
    }
  }

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all document history? This action cannot be undone.")) {
      DocumentStorage.clearHistory()
      setHistory({
        analyses: [],
        totalDocuments: 0,
        totalRisksFound: 0,
      })
      setSelectedAnalysis(null)
    }
  }

  const handleExportHistory = () => {
    try {
      const exportData = DocumentStorage.exportHistory()
      const blob = new Blob([exportData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `legal-ai-history-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export history:", error)
      alert("Failed to export history. Please try again.")
    }
  }

  const handleBackToDashboard = () => {
    setSelectedAnalysis(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-lg font-medium text-foreground">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  // Show analysis results if one is selected
  if (selectedAnalysis) {
    return <ResultsDashboard analysis={selectedAnalysis} onReset={handleBackToDashboard} showBackButton={true} />
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        totalDocuments={history.totalDocuments}
        totalRisks={history.totalRisksFound}
        lastAnalyzed={history.lastAnalyzed}
        onClearHistory={handleClearHistory}
        onExportHistory={handleExportHistory}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DocumentHistory
            analyses={history.analyses}
            onViewAnalysis={handleViewAnalysis}
            onDeleteAnalysis={handleDeleteAnalysis}
          />
        </motion.div>
      </main>
    </div>
  )
}

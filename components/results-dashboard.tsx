"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ArrowLeft, Download, Share2 } from "lucide-react"
import type { DocumentAnalysis } from "@/lib/types"
import { SummaryCard } from "./summary-card"
import { RiskAnalysis } from "./risk-analysis"
import { EnhancedResultsDashboard } from "./enhanced-results-dashboard"

interface ResultsDashboardProps {
  analysis: DocumentAnalysis
  onReset: () => void
  showBackButton?: boolean
}

export function ResultsDashboard({ analysis, onReset, showBackButton = false }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "risks">("summary")

  // Check if this is an enhanced analysis
  const isEnhanced = "keyTerms" in analysis

  const handleExport = () => {
    const exportData = {
      summary: analysis.summary,
      riskCount: analysis.riskyClausesList.length,
      risks: analysis.riskyClausesList.map((clause) => ({
        text: clause.text,
        riskLevel: clause.riskLevel,
        category: clause.category,
        explanation: clause.explanation,
      })),
      analyzedAt: analysis.uploadedAt.toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `legal-analysis-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Legal Document Analysis",
          text: `Document analyzed: ${analysis.riskyClausesList.length} risk(s) found. Summary: ${analysis.summary.substring(0, 100)}...`,
        })
      } catch (error) {
        console.log("Share cancelled or failed")
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `Legal Document Analysis Results:\n\nSummary: ${analysis.summary}\n\nRisks Found: ${analysis.riskyClausesList.length}`
      await navigator.clipboard.writeText(shareText)
      alert("Analysis copied to clipboard!")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto p-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{showBackButton ? "Back to Dashboard" : "New Analysis"}</span>
          </button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analysis Complete</h1>
            <p className="text-muted-foreground">Analyzed {analysis.originalText.length.toLocaleString()} characters</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </motion.div>

      {isEnhanced ? (
        <EnhancedResultsDashboard analysis={analysis} onReset={onReset} showBackButton={showBackButton} />
      ) : (
        <>
          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit"
          >
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === "summary" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab("risks")}
              className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                activeTab === "risks" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Risk Analysis
              {analysis.riskyClausesList.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {analysis.riskyClausesList.length}
                </span>
              )}
            </button>
          </motion.div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "summary" ? (
              <SummaryCard summary={analysis.summary} originalLength={analysis.originalText.length} />
            ) : (
              <RiskAnalysis clauses={analysis.riskyClausesList} originalText={analysis.originalText} />
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round((analysis.summary.length / analysis.originalText.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Compression Ratio</div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{analysis.riskyClausesList.length}</div>
              <div className="text-sm text-gray-600">Risk Clauses Found</div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analysis.riskyClausesList.filter((c) => c.riskLevel === "high").length === 0 ? "✓" : "!"}
              </div>
              <div className="text-sm text-gray-600">
                {analysis.riskyClausesList.filter((c) => c.riskLevel === "high").length === 0
                  ? "No High Risks"
                  : "High Risks Present"}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

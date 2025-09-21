"use client"

import { motion } from "framer-motion"
import { Scale, ArrowLeft } from "lucide-react"
import { DocumentUpload } from "@/components/document-upload"
import { ResultsDashboard } from "@/components/results-dashboard"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { useDocumentAnalysis } from "@/hooks/use-document-analysis"
import { DocumentStorage } from "@/lib/document-storage"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect } from "react"

export default function AnalyzePage() {
  const { analysis, isLoading, error, analyzeDocument, reset } = useDocumentAnalysis()

  // Save analysis to storage when completed
  useEffect(() => {
    if (analysis && analysis.status === "completed") {
      DocumentStorage.saveAnalysis(analysis)
    }
  }, [analysis])

  if (analysis) {
    return <ResultsDashboard analysis={analysis} onReset={reset} showBackButton={true} />
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-b border-border shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Scale className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">New Document Analysis</h1>
                  <p className="text-muted-foreground">Upload documents for AI-powered risk assessment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <p className="text-destructive font-medium">Analysis Error</p>
            <p className="text-destructive/80 text-sm mt-1">{error}</p>
          </motion.div>
        )}

        {/* Upload Component */}
        <DocumentUpload onUpload={analyzeDocument} isProcessing={isLoading} />
      </main>
    </div>
  )
}

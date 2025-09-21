"use client"

import { motion, AnimatePresence } from "framer-motion"
import { FileText, Calendar, AlertTriangle, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DocumentAnalysis } from "@/lib/types"

interface DocumentHistoryProps {
  analyses: DocumentAnalysis[]
  onViewAnalysis: (analysis: DocumentAnalysis) => void
  onDeleteAnalysis: (id: string) => void
}

export function DocumentHistory({ analyses, onViewAnalysis, onDeleteAnalysis }: DocumentHistoryProps) {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getFileTypeIcon = (fileName?: string) => {
    if (!fileName) return <FileText className="h-5 w-5" />
    const ext = fileName.split(".").pop()?.toLowerCase()
    return <FileText className="h-5 w-5" />
  }

  if (analyses.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Documents Yet</h3>
        <p className="text-muted-foreground mb-6">
          Upload your first legal document to start analyzing risks and generating summaries.
        </p>
        <Button>Start Analyzing</Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Document History</h2>
        <p className="text-muted-foreground">{analyses.length} documents analyzed</p>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {analyses.map((analysis, index) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {analysis.metadata?.files?.[0] ? (
                        getFileTypeIcon(analysis.metadata.files[0].fileName)
                      ) : (
                        <FileText className="h-5 w-5 text-primary" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {analysis.metadata?.files?.[0]?.fileName || `Document ${analysis.id.slice(0, 8)}`}
                        </h3>
                        <Badge
                          variant={analysis.status === "completed" ? "default" : "secondary"}
                          className={
                            analysis.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : ""
                          }
                        >
                          {analysis.status}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{analysis.uploadedAt.toLocaleDateString()}</span>
                        </div>
                        {analysis.metadata?.totalFiles && analysis.metadata.totalFiles > 1 && (
                          <span>{analysis.metadata.totalFiles} files</span>
                        )}
                        <span>{analysis.originalText.split(/\s+/).length} words</span>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{analysis.summary}</p>

                      {/* Risk Summary */}
                      <div className="flex items-center space-x-2 mb-4">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {analysis.riskyClausesList.length} risk{analysis.riskyClausesList.length !== 1 ? "s" : ""}{" "}
                          found
                        </span>
                        {analysis.riskyClausesList.length > 0 && (
                          <div className="flex space-x-1">
                            {["high", "medium", "low"].map((level) => {
                              const count = analysis.riskyClausesList.filter((c) => c.riskLevel === level).length
                              if (count === 0) return null
                              return (
                                <Badge key={level} className={`text-xs ${getRiskLevelColor(level)}`}>
                                  {count} {level}
                                </Badge>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => onViewAnalysis(analysis)} className="gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteAnalysis(analysis.id)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

"use client"

import { motion } from "framer-motion"
import { FileText, Hash, BarChart3, BookOpen } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { EnhancedAnalysis } from "@/lib/ai-analysis-engine"

interface DocumentInsightsProps {
  analysis: EnhancedAnalysis
}

export function DocumentInsights({ analysis }: DocumentInsightsProps) {
  const getReadabilityLevel = (score: number) => {
    if (score >= 90) return { level: "Very Easy", color: "text-green-600" }
    if (score >= 80) return { level: "Easy", color: "text-green-500" }
    if (score >= 70) return { level: "Fairly Easy", color: "text-yellow-500" }
    if (score >= 60) return { level: "Standard", color: "text-yellow-600" }
    if (score >= 50) return { level: "Fairly Difficult", color: "text-orange-500" }
    if (score >= 30) return { level: "Difficult", color: "text-red-500" }
    return { level: "Very Difficult", color: "text-red-600" }
  }

  const readabilityInfo = getReadabilityLevel(analysis.readabilityScore)

  const riskDistribution = analysis.riskyClausesList.reduce(
    (acc, clause) => {
      acc[clause.riskLevel]++
      return acc
    },
    { high: 0, medium: 0, low: 0 } as Record<string, number>,
  )

  const categoryDistribution = analysis.riskyClausesList.reduce(
    (acc, clause) => {
      acc[clause.category] = (acc[clause.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      {/* Document Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Document Overview</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Document Type</span>
              <Badge variant="outline">{analysis.documentType}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Legal Complexity</span>
              <Badge
                className={
                  analysis.legalComplexity === "high"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    : analysis.legalComplexity === "medium"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                }
              >
                {analysis.legalComplexity}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Word Count</span>
              <span className="font-medium">{analysis.originalText.split(/\s+/).length.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Character Count</span>
              <span className="font-medium">{analysis.originalText.length.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Readability Analysis</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Readability Score</span>
                <span className={`font-bold ${readabilityInfo.color}`}>{analysis.readabilityScore}/100</span>
              </div>
              <Progress value={analysis.readabilityScore} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {readabilityInfo.level} -{" "}
                {analysis.readabilityScore >= 60 ? "Accessible to most readers" : "May require legal expertise"}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Sentiment</span>
              <Badge
                className={
                  analysis.sentimentAnalysis.overall === "positive"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : analysis.sentimentAnalysis.overall === "negative"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                }
              >
                {analysis.sentimentAnalysis.overall} ({analysis.sentimentAnalysis.score > 0 ? "+" : ""}
                {analysis.sentimentAnalysis.score})
              </Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Risk Distribution */}
      {analysis.riskyClausesList.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Risk Distribution</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Risk Level Distribution */}
              <div>
                <h4 className="font-medium text-foreground mb-4">By Risk Level</h4>
                <div className="space-y-3">
                  {Object.entries(riskDistribution).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            level === "high" ? "bg-red-500" : level === "medium" ? "bg-yellow-500" : "bg-green-500"
                          }`}
                        />
                        <span className="capitalize text-muted-foreground">{level} Risk</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Distribution */}
              <div>
                <h4 className="font-medium text-foreground mb-4">By Category</h4>
                <div className="space-y-3">
                  {Object.entries(categoryDistribution).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="capitalize text-muted-foreground">{category.replace("-", " ")}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Key Terms */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Hash className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Key Terms</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.keyTerms.map((term, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {term}
              </Badge>
            ))}
          </div>
          {analysis.keyTerms.length === 0 && (
            <p className="text-muted-foreground text-sm">No significant key terms identified.</p>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

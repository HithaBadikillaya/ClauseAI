"use client"

import { motion } from "framer-motion"
import { Lightbulb, AlertTriangle, CheckCircle, Info, ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { EnhancedAnalysis } from "@/lib/ai-analysis-engine"

interface RecommendationsPanelProps {
  recommendations: string[]
  analysis: EnhancedAnalysis
}

export function RecommendationsPanel({ recommendations, analysis }: RecommendationsPanelProps) {
  const getRecommendationType = (recommendation: string) => {
    if (recommendation.includes("⚠️") || recommendation.includes("high-risk")) {
      return { type: "warning", icon: AlertTriangle, color: "text-red-600" }
    }
    if (recommendation.includes("✅") || recommendation.includes("No major risk")) {
      return { type: "success", icon: CheckCircle, color: "text-green-600" }
    }
    if (recommendation.includes("💡") || recommendation.includes("informational")) {
      return { type: "info", icon: Info, color: "text-blue-600" }
    }
    return { type: "general", icon: Lightbulb, color: "text-yellow-600" }
  }

  const actionableRecommendations = [
    {
      title: "Get Professional Review",
      description: "Consider consulting with a legal professional for complex documents or high-risk clauses.",
      action: "Find Legal Help",
      condition: analysis.legalComplexity === "high" || analysis.riskyClausesList.some((c) => c.riskLevel === "high"),
    },
    {
      title: "Request Clarification",
      description: "Ask for plain language explanations of complex terms before signing.",
      action: "Draft Questions",
      condition: analysis.readabilityScore < 50,
    },
    {
      title: "Negotiate Terms",
      description: "Consider negotiating problematic clauses, especially those related to data sharing or arbitration.",
      action: "Prepare Counterproposal",
      condition: analysis.riskyClausesList.length > 3,
    },
    {
      title: "Document Review Checklist",
      description: "Use a systematic approach to review all important sections.",
      action: "Download Checklist",
      condition: true,
    },
  ]

  const relevantActions = actionableRecommendations.filter((action) => action.condition)

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Lightbulb className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">AI Recommendations</h3>
            <Badge variant="secondary">{recommendations.length} insights</Badge>
          </div>
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => {
              const { type, icon: Icon, color } = getRecommendationType(recommendation)
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg"
                >
                  <Icon className={`h-5 w-5 ${color} flex-shrink-0 mt-0.5`} />
                  <p className="text-sm text-foreground leading-relaxed">{recommendation}</p>
                </motion.div>
              )
            })}
          </div>
        </Card>
      </motion.div>

      {/* Actionable Steps */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CheckCircle className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Recommended Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow"
              >
                <h4 className="font-medium text-foreground mb-2">{action.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  {action.action}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Risk Summary */}
      {analysis.riskyClausesList.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Risk Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {analysis.riskyClausesList.filter((c) => c.riskLevel === "high").length}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">High Risk</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {analysis.riskyClausesList.filter((c) => c.riskLevel === "medium").length}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Medium Risk</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analysis.riskyClausesList.filter((c) => c.riskLevel === "low").length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Low Risk</div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 bg-muted/50 rounded-lg border border-border"
      >
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Important Disclaimer</p>
            <p>
              This analysis is provided for informational purposes only and does not constitute legal advice. Always
              consult with a qualified legal professional before making important decisions based on legal documents.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

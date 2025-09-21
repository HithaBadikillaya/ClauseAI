"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { AlertTriangle, Shield, Info, Eye } from "lucide-react"
import type { RiskyClause } from "@/lib/types"

interface RiskAnalysisProps {
  clauses: RiskyClause[]
  originalText: string
}

const riskColors = {
  high: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon: "text-red-500",
    dot: "bg-red-500",
  },
  medium: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    icon: "text-yellow-500",
    dot: "bg-yellow-500",
  },
  low: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: "text-blue-500",
    dot: "bg-blue-500",
  },
}

const categoryIcons = {
  "data-sharing": Shield,
  arbitration: AlertTriangle,
  tracking: Eye,
  other: Info,
}

export function RiskAnalysis({ clauses, originalText }: RiskAnalysisProps) {
  const [selectedClause, setSelectedClause] = useState<string | null>(null)
  const [showOriginalText, setShowOriginalText] = useState(false)

  const riskCounts = clauses.reduce(
    (acc, clause) => {
      acc[clause.riskLevel] = (acc[clause.riskLevel] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const highlightedText = showOriginalText ? highlightRiskyText(originalText, clauses) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Risk Analysis</h3>
              <p className="text-sm text-gray-600">{clauses.length} potentially risky clauses identified</p>
            </div>
          </div>

          <button
            onClick={() => setShowOriginalText(!showOriginalText)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {showOriginalText ? "Hide Original" : "Show Original"}
          </button>
        </div>

        {/* Risk Summary */}
        <div className="flex items-center space-x-6 mt-4">
          {Object.entries(riskCounts).map(([level, count]) => (
            <div key={level} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${riskColors[level as keyof typeof riskColors].dot}`} />
              <span className="text-sm font-medium text-gray-700 capitalize">
                {level}: {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {showOriginalText ? (
            <motion.div
              key="original"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <h4 className="font-semibold text-gray-900 mb-3">Original Document with Highlights</h4>
              <div
                className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: highlightedText || "" }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Identified Risk Clauses</h4>

          {clauses.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-3 text-green-400" />
              <p className="text-lg font-medium">No significant risks detected</p>
              <p className="text-sm">This document appears to have standard, low-risk language</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {clauses.map((clause, index) => {
                const colors = riskColors[clause.riskLevel]
                const IconComponent = categoryIcons[clause.category]

                return (
                  <motion.div
                    key={clause.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${colors.bg} ${colors.border}`}
                    onClick={() => setSelectedClause(selectedClause === clause.id ? null : clause.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent className={`h-5 w-5 mt-0.5 ${colors.icon}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                          >
                            {clause.riskLevel.toUpperCase()} RISK
                          </span>
                          <span className="text-xs text-gray-500 capitalize">{clause.category.replace("-", " ")}</span>
                        </div>

                        <p className="text-sm text-gray-700 leading-relaxed mb-2">"{clause.text}"</p>

                        <AnimatePresence>
                          {selectedClause === clause.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3 border-t border-gray-200"
                            >
                              <div className="flex items-start space-x-2">
                                <Info className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-600">{clause.explanation}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function highlightRiskyText(text: string, clauses: RiskyClause[]): string {
  let highlightedText = text

  // Sort clauses by start index in descending order to avoid index shifting
  const sortedClauses = [...clauses].sort((a, b) => b.startIndex - a.startIndex)

  sortedClauses.forEach((clause) => {
    const riskClass =
      clause.riskLevel === "high"
        ? "bg-red-200 border-l-4 border-red-500"
        : clause.riskLevel === "medium"
          ? "bg-yellow-200 border-l-4 border-yellow-500"
          : "bg-blue-200 border-l-4 border-blue-500"

    const before = highlightedText.substring(0, clause.startIndex)
    const highlighted = `<span class="px-1 py-0.5 rounded ${riskClass}" title="${clause.explanation}">${clause.text}</span>`
    const after = highlightedText.substring(clause.endIndex)

    highlightedText = before + highlighted + after
  })

  return highlightedText
}

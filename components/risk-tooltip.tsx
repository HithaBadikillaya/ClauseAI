"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Info } from "lucide-react"

interface RiskTooltipProps {
  explanation: string
  riskLevel: "high" | "medium" | "low"
  category: string
  children: React.ReactNode
}

export function RiskTooltip({ explanation, riskLevel, category, children }: RiskTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const colors = {
    high: "bg-red-50 border-red-200 text-red-800",
    medium: "bg-yellow-50 border-yellow-200 text-yellow-800",
    low: "bg-blue-50 border-blue-200 text-blue-800",
  }

  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)} className="cursor-help">
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 w-80 p-4 rounded-lg border shadow-lg ${colors[riskLevel]} bottom-full left-1/2 transform -translate-x-1/2 mb-2`}
          >
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium uppercase tracking-wide">
                    {riskLevel} Risk - {category.replace("-", " ")}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{explanation}</p>
              </div>
            </div>

            {/* Arrow */}
            <div
              className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                riskLevel === "high"
                  ? "border-t-red-200"
                  : riskLevel === "medium"
                    ? "border-t-yellow-200"
                    : "border-t-blue-200"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

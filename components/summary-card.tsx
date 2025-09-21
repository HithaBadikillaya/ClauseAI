"use client"

import { motion } from "framer-motion"
import { FileText, Clock, CheckCircle } from "lucide-react"

interface SummaryCardProps {
  summary: string
  originalLength: number
  isLoading?: boolean
}

export function SummaryCard({ summary, originalLength, isLoading = false }: SummaryCardProps) {
  const compressionRatio = Math.round((1 - summary.length / originalLength) * 100)

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Document Summary</h3>
            <p className="text-sm text-gray-600">AI-generated plain language summary</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center space-x-6 mb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Generated in ~3s</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>{compressionRatio}% more concise</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-gray max-w-none"
        >
          <p className="text-gray-700 leading-relaxed text-balance">{summary}</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

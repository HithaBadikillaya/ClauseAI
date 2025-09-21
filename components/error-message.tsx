"use client"

import { motion } from "framer-motion"
import { AlertCircle, RefreshCw, X } from "lucide-react"

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  type?: "error" | "warning" | "info"
}

export function ErrorMessage({ title = "Error", message, onRetry, onDismiss, type = "error" }: ErrorMessageProps) {
  const styles = {
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-500",
      title: "text-red-800",
      text: "text-red-700",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: "text-yellow-500",
      title: "text-yellow-800",
      text: "text-yellow-700",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-500",
      title: "text-blue-800",
      text: "text-blue-700",
    },
  }

  const style = styles[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-lg border p-4 ${style.bg} ${style.border}`}
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className={`h-5 w-5 mt-0.5 ${style.icon}`} />

        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${style.title}`}>{title}</h3>
          <p className={`mt-1 text-sm ${style.text}`}>{message}</p>

          {(onRetry || onDismiss) && (
            <div className="mt-3 flex space-x-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`flex items-center space-x-1 text-sm font-medium ${style.title} hover:underline`}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
              )}
              {onDismiss && (
                <button onClick={onDismiss} className={`text-sm font-medium ${style.title} hover:underline`}>
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>

        {onDismiss && (
          <button onClick={onDismiss} className={`${style.icon} hover:opacity-75`}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

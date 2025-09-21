"use client"

import { motion } from "framer-motion"
import { Scale, Plus, Download, Trash2, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface DashboardHeaderProps {
  totalDocuments: number
  totalRisks: number
  lastAnalyzed?: Date
  onClearHistory: () => void
  onExportHistory: () => void
}

export function DashboardHeader({
  totalDocuments,
  totalRisks,
  lastAnalyzed,
  onClearHistory,
  onExportHistory,
}: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Scale className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Legal AI Dashboard</h1>
              <p className="text-muted-foreground">
                {lastAnalyzed ? `Last analysis: ${lastAnalyzed.toLocaleDateString()}` : "No documents analyzed yet"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard/analyze">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Analysis
              </Button>
            </Link>
            <Button variant="outline" onClick={onExportHistory} className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
            {totalDocuments > 0 && (
              <Button
                variant="outline"
                onClick={onClearHistory}
                className="gap-2 text-destructive hover:text-destructive bg-transparent"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                <p className="text-3xl font-bold text-foreground">{totalDocuments}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risks Identified</p>
                <p className="text-3xl font-bold text-foreground">{totalRisks}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Scale className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Risks/Doc</p>
                <p className="text-3xl font-bold text-foreground">
                  {totalDocuments > 0 ? Math.round((totalRisks / totalDocuments) * 10) / 10 : 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

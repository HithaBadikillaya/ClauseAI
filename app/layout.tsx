import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ErrorBoundary } from "@/components/error-boundary"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "ClauseAI - Transform Legal Documents into Plain English",
  description:
    "AI-powered legal document analysis with automatic summarization and risk detection. Make complex legal text accessible to everyone.",
  keywords: "legal, AI, document analysis, risk assessment, contract review, plain language, legal tech",
    
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}

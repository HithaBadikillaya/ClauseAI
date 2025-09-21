"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, File, AlertCircle, CheckCircle } from "lucide-react"
import { FileParser, type ParsedDocument } from "@/lib/file-parsers"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface DocumentUploadProps {
  onUpload: (text: string, metadata?: any) => void
  isProcessing: boolean
}

export function DocumentUpload({ onUpload, isProcessing }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<ParsedDocument[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [isParsingFiles, setIsParsingFiles] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFiles = async (files: File[]) => {
    setIsParsingFiles(true)
    setParseErrors([])

    const newParsedFiles: ParsedDocument[] = []
    const errors: string[] = []

    for (const file of files) {
      try {
        // Validate file
        const validation = FileParser.validateFile(file)
        if (!validation.valid) {
          errors.push(`${file.name}: ${validation.error}`)
          continue
        }

        // Parse file
        const parsedDoc = await FileParser.parseFile(file)
        newParsedFiles.push(parsedDoc)
      } catch (error) {
        errors.push(`${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    setUploadedFiles((prev) => [...prev, ...newParsedFiles])
    setParseErrors(errors)
    setIsParsingFiles(false)

    // Auto-populate text input if only one file and no existing text
    if (newParsedFiles.length === 1 && !textInput.trim()) {
      setTextInput(newParsedFiles[0].text)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const combineAllText = () => {
    const fileTexts = uploadedFiles.map((doc) => doc.text).join("\n\n")
    const combinedText = [fileTexts, textInput].filter(Boolean).join("\n\n")
    return combinedText.trim()
  }

  const handleSubmit = () => {
    const finalText = combineAllText()
    if (finalText) {
      const metadata = {
        files: uploadedFiles.map((doc) => doc.metadata),
        totalFiles: uploadedFiles.length,
        hasManualText: !!textInput.trim(),
      }
      onUpload(finalText, metadata)
    }
  }

  const clearAll = () => {
    setUploadedFiles([])
    setTextInput("")
    setParseErrors([])
  }

  const totalText = combineAllText()
  const supportedFormats = FileParser.getSupportedFormats()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto p-6"
    >
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground mb-2">Upload Legal Documents</h2>
          <p className="text-muted-foreground">
            Upload multiple documents or paste text for AI-powered analysis and risk assessment
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload Area */}
          <motion.div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <input
              type="file"
              accept={FileParser.getAcceptString()}
              onChange={handleFileInput}
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing || isParsingFiles}
            />

            <div className="space-y-4">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="text-lg font-medium text-foreground">
                  {isParsingFiles ? "Processing files..." : "Drop documents here or click to browse"}
                </p>
                <p className="text-muted-foreground">Supports multiple files: {supportedFormats.join(", ")}</p>
              </div>
              <p className="text-sm text-muted-foreground">Maximum 25MB per file</p>
            </div>

            {isParsingFiles && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Parsing files...</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Parse Errors */}
          <AnimatePresence>
            {parseErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
              >
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-destructive">File parsing errors:</p>
                    {parseErrors.map((error, index) => (
                      <p key={index} className="text-sm text-destructive/80">
                        • {error}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Uploaded Files */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Uploaded Files ({uploadedFiles.length})</h3>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    Clear All
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {uploadedFiles.map((doc, index) => (
                    <motion.div
                      key={`${doc.metadata.fileName}-${index}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-muted/50 rounded-lg p-4 border border-border"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <File className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm text-foreground truncate">{doc.metadata.fileName}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                              <span>{(doc.metadata.fileSize / 1024).toFixed(1)} KB</span>
                              {doc.metadata.pageCount && <span>{doc.metadata.pageCount} pages</span>}
                              <span>{doc.text.split(/\s+/).length} words</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-muted rounded-full transition-colors"
                            disabled={isProcessing}
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text Input Area */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Additional text or paste document content:
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste additional legal document text here..."
              className="w-full h-32 p-4 border border-border rounded-lg resize-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all bg-background text-foreground"
              disabled={isProcessing}
            />
          </div>

          {/* Document Stats */}
          {totalText && (
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {totalText.split(/\s+/).length.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Words</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">{totalText.length.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Characters</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">{uploadedFiles.length}</div>
                  <div className="text-sm text-muted-foreground">Files</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {Math.ceil(totalText.split(/\s+/).length / 250)}
                  </div>
                  <div className="text-sm text-muted-foreground">Est. Pages</div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!totalText || isProcessing || isParsingFiles}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Analyzing Documents...</span>
              </div>
            ) : (
              `Analyze ${uploadedFiles.length > 0 ? `${uploadedFiles.length} Document${uploadedFiles.length > 1 ? "s" : ""}` : "Document"}`
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

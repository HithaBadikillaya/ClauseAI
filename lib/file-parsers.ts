export interface ParsedDocument {
  text: string
  metadata: {
    fileName: string
    fileSize: number
    fileType: string
    pageCount?: number
  }
}

export class FileParser {
  static async parseFile(file: File): Promise<ParsedDocument> {
    const metadata = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    }

    try {
      switch (file.type) {
        case "text/plain":
          return {
            text: await file.text(),
            metadata,
          }

        case "application/pdf":
          return await this.parsePDF(file, metadata)

        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        case "application/msword":
          return await this.parseWord(file, metadata)

        case "application/rtf":
        case "text/rtf":
          return await this.parseRTF(file, metadata)

        default:
          // Try to parse as text for unknown types
          const text = await file.text()
          if (text.trim()) {
            return { text, metadata }
          }
          throw new Error(`Unsupported file type: ${file.type}`)
      }
    } catch (error) {
      console.error("File parsing error:", error)
      throw new Error(`Failed to parse ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private static async parsePDF(file: File, metadata: any): Promise<ParsedDocument> {
    // For now, we'll use a simple approach that works in the browser
    // In a production environment, you'd want to use a proper PDF parser
    try {
      const arrayBuffer = await file.arrayBuffer()
      const text = await this.extractTextFromPDF(arrayBuffer)

      return {
        text,
        metadata: {
          ...metadata,
          pageCount: this.estimatePageCount(text),
        },
      }
    } catch (error) {
      throw new Error("PDF parsing failed. Please convert to text format or try a different file.")
    }
  }

  private static async parseWord(file: File, metadata: any): Promise<ParsedDocument> {
    try {
      // For Word documents, we'll extract what we can
      // In production, you'd use libraries like mammoth.js
      const arrayBuffer = await file.arrayBuffer()
      const text = await this.extractTextFromWord(arrayBuffer)

      return {
        text,
        metadata,
      }
    } catch (error) {
      throw new Error("Word document parsing failed. Please save as .txt or copy-paste the content.")
    }
  }

  private static async parseRTF(file: File, metadata: any): Promise<ParsedDocument> {
    try {
      const text = await file.text()
      // Basic RTF parsing - remove RTF control codes
      const cleanText = text
        .replace(/\\[a-z]+\d*\s?/g, "") // Remove RTF control words
        .replace(/[{}]/g, "") // Remove braces
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim()

      return {
        text: cleanText,
        metadata,
      }
    } catch (error) {
      throw new Error("RTF parsing failed. Please convert to text format.")
    }
  }

  private static async extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
    // Simple PDF text extraction (basic implementation)
    // In production, use pdf-parse or similar library
    const uint8Array = new Uint8Array(arrayBuffer)
    const text = new TextDecoder().decode(uint8Array)

    // Extract readable text between stream objects
    const textMatches = text.match(/stream\s*(.*?)\s*endstream/gs)
    if (textMatches) {
      return textMatches
        .map((match) => match.replace(/stream|endstream/g, ""))
        .join(" ")
        .replace(/[^\x20-\x7E\n\r\t]/g, " ") // Keep only printable ASCII
        .replace(/\s+/g, " ")
        .trim()
    }

    throw new Error("Could not extract text from PDF")
  }

  private static async extractTextFromWord(arrayBuffer: ArrayBuffer): Promise<string> {
    // Basic Word document text extraction
    // In production, use mammoth.js or similar library
    const uint8Array = new Uint8Array(arrayBuffer)
    const text = new TextDecoder().decode(uint8Array)

    // Extract readable text (very basic approach)
    const cleanText = text
      .replace(/[^\x20-\x7E\n\r\t]/g, " ") // Keep only printable ASCII
      .replace(/\s+/g, " ")
      .trim()

    if (cleanText.length < 50) {
      throw new Error("Could not extract meaningful text from Word document")
    }

    return cleanText
  }

  private static estimatePageCount(text: string): number {
    // Rough estimate: 250 words per page
    const wordCount = text.split(/\s+/).length
    return Math.ceil(wordCount / 250)
  }

  static getSupportedFormats(): string[] {
    return [".txt", ".pdf", ".doc", ".docx", ".rtf"]
  }

  static getAcceptString(): string {
    return ".txt,.pdf,.doc,.docx,.rtf,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/rtf,text/rtf"
  }

  static validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 25 * 1024 * 1024 // 25MB
    const supportedTypes = [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/rtf",
      "text/rtf",
    ]

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size must be less than 25MB",
      }
    }

    if (!supportedTypes.includes(file.type) && !file.name.match(/\.(txt|pdf|doc|docx|rtf)$/i)) {
      return {
        valid: false,
        error: "Unsupported file format. Please use .txt, .pdf, .doc, .docx, or .rtf files",
      }
    }

    return { valid: true }
  }
}

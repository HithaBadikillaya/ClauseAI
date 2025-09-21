const HF_API_URL = "https://api-inference.huggingface.co/models"

export class HuggingFaceService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.HF_API_KEY || ""
    if (!this.apiKey) {
      throw new Error("HF_API_KEY environment variable is required")
    }
  }

  private async makeRequest(modelName: string, inputs: any): Promise<any> {
    const response = await fetch(`${HF_API_URL}/${modelName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs }),
    })

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.statusText}`)
    }

    return response.json()
  }

  async summarizeDocument(text: string): Promise<string> {
    try {
      // Use BART model for summarization
      const result = await this.makeRequest("facebook/bart-large-cnn", text)
      return result[0]?.summary_text || "Unable to generate summary"
    } catch (error) {
      console.error("Summarization error:", error)
      throw new Error("Failed to summarize document")
    }
  }

  async classifyText(text: string): Promise<{ label: string; score: number }> {
    try {
      // Use a classification model for risk detection
      const result = await this.makeRequest("nlpaueb/legal-bert-base-uncased", text)
      return {
        label: result[0]?.label || "unknown",
        score: result[0]?.score || 0,
      }
    } catch (error) {
      console.error("Classification error:", error)
      throw new Error("Failed to classify text")
    }
  }
}

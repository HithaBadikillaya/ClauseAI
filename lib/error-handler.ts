export class APIError extends Error {
  constructor(
    message: string,
    public status = 500,
    public code?: string,
  ) {
    super(message)
    this.name = "APIError"
  }
}

export function handleAPIError(error: unknown): APIError {
  if (error instanceof APIError) {
    return error
  }

  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes("fetch")) {
      return new APIError("Network error. Please check your connection.", 0, "NETWORK_ERROR")
    }

    if (error.message.includes("timeout")) {
      return new APIError("Request timed out. Please try again.", 408, "TIMEOUT")
    }

    return new APIError(error.message, 500, "UNKNOWN_ERROR")
  }

  return new APIError("An unexpected error occurred.", 500, "UNKNOWN_ERROR")
}

export function getErrorMessage(error: unknown): string {
  const apiError = handleAPIError(error)

  switch (apiError.code) {
    case "NETWORK_ERROR":
      return "Unable to connect to the AI service. Please check your internet connection and try again."
    case "TIMEOUT":
      return "The analysis is taking longer than expected. Please try with a shorter document."
    case "RATE_LIMIT":
      return "Too many requests. Please wait a moment before trying again."
    default:
      return apiError.message
  }
}

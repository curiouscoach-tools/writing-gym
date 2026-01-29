import Anthropic from '@anthropic-ai/sdk'

/**
 * Validate required environment variables are set
 * Call this early in each handler to fail fast with a clear message
 * @throws {Error} If required env vars are missing
 */
export function validateEnv() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Server configuration error: ANTHROPIC_API_KEY is not set')
  }
}

// Lazy-initialized Anthropic client
let _anthropic = null

/**
 * Get the Anthropic client instance (lazy initialization)
 * @returns {Anthropic} Configured Anthropic client
 */
export function getAnthropicClient() {
  if (!_anthropic) {
    validateEnv()
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })
  }
  return _anthropic
}

// For backwards compatibility - will throw if env not configured
export const anthropic = {
  messages: {
    create: (...args) => getAnthropicClient().messages.create(...args)
  }
}

/**
 * Parse JSON from Claude response, stripping markdown code blocks if present
 * @param {string} text - Raw response text from Claude
 * @returns {object} Parsed JSON object
 * @throws {Error} If JSON parsing fails
 */
export function parseJsonResponse(text) {
  try {
    const stripped = text
      .replace(/^```(?:json)?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim()
    return JSON.parse(stripped)
  } catch (err) {
    throw new Error(`Failed to parse JSON response: ${err.message}`)
  }
}

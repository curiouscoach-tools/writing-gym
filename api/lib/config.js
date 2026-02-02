// Centralized configuration for API functions
// Override via environment variables in production

export const CONFIG = {
  // Claude model - Haiku for fast structured JSON tasks (sub-1s typical)
  // Override with CLAUDE_MODEL=claude-sonnet-4-20250514 for higher quality
  model: process.env.CLAUDE_MODEL || 'claude-3-5-haiku-latest',

  // Token limits by endpoint (sized to actual output)
  maxTokens: {
    extractCriteria: 512,
    assessDraft: 1024
  },

  // Assessment scale (used for criteria)
  assessmentScale: [1, 5],

  // Criteria extraction limits
  criteria: {
    min: 3,
    max: 5
  }
}

/**
 * Validation utilities for API handlers
 */

const REQUIRED_CONTEXT_FIELDS = ['audience', 'intent', 'concerns', 'type']

/**
 * Validate that context object has all required fields with non-empty values
 * @param {object} context - The context object from request
 * @returns {{ valid: boolean, missing?: string[] }}
 */
export function validateContext(context) {
  if (!context || typeof context !== 'object') {
    return { valid: false, missing: REQUIRED_CONTEXT_FIELDS }
  }

  const missing = REQUIRED_CONTEXT_FIELDS.filter(
    field => !context[field] || typeof context[field] !== 'string' || !context[field].trim()
  )

  return missing.length === 0
    ? { valid: true }
    : { valid: false, missing }
}

/**
 * Extract text from Claude API response, validating structure
 * @param {object} message - Claude API response message
 * @returns {string} The text content
 * @throws {Error} If response structure is unexpected
 */
export function extractResponseText(message) {
  if (!message) {
    throw new Error('Empty response from Claude API')
  }

  if (!message.content || !Array.isArray(message.content) || message.content.length === 0) {
    throw new Error('Unexpected response format: missing content array')
  }

  const firstBlock = message.content[0]
  if (!firstBlock || firstBlock.type !== 'text' || typeof firstBlock.text !== 'string') {
    throw new Error('Unexpected response format: expected text content')
  }

  return firstBlock.text
}

/**
 * Validate criteria extraction response structure
 * @param {object} parsed - Parsed JSON response
 * @returns {object} Validated criteria array
 * @throws {Error} If structure is invalid
 */
export function validateCriteriaResponse(parsed) {
  if (!parsed || !Array.isArray(parsed.criteria)) {
    throw new Error('Invalid response: expected criteria array')
  }

  if (parsed.criteria.length === 0) {
    throw new Error('No criteria extracted from context')
  }

  // Validate each criterion has required fields
  parsed.criteria.forEach((c, i) => {
    if (!c.id || !c.description) {
      throw new Error(`Invalid criterion at index ${i}: missing id or description`)
    }
  })

  return parsed.criteria
}

/**
 * Validate assessment response structure
 * @param {object} parsed - Parsed JSON response
 * @param {string[]} expectedIds - Expected criterion IDs
 * @returns {object} Validated { scores, reasoning }
 * @throws {Error} If structure is invalid
 */
export function validateAssessmentResponse(parsed, expectedIds) {
  if (!parsed || typeof parsed.scores !== 'object' || typeof parsed.reasoning !== 'object') {
    throw new Error('Invalid response: expected scores and reasoning objects')
  }

  // Check all expected criteria have scores
  const missingScores = expectedIds.filter(id => !(id in parsed.scores))
  if (missingScores.length > 0) {
    throw new Error(`Missing scores for criteria: ${missingScores.join(', ')}`)
  }

  const suggestions = (parsed.suggestions && typeof parsed.suggestions === 'object')
    ? parsed.suggestions
    : {}

  const qualityFlags = Array.isArray(parsed.qualityFlags)
    ? parsed.qualityFlags.filter(f => typeof f === 'string' && f.trim())
    : []

  return { scores: parsed.scores, reasoning: parsed.reasoning, suggestions, qualityFlags }
}

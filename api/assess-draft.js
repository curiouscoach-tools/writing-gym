import { anthropic, parseJsonResponse, validateEnv } from './lib/anthropic.js'
import { CONFIG } from './lib/config.js'
import { validateContext, extractResponseText, validateAssessmentResponse } from './lib/validation.js'

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validate environment early
  try {
    validateEnv()
  } catch (err) {
    console.error('Environment configuration error:', err.message)
    return res.status(503).json({ error: 'Service temporarily unavailable' })
  }

  const { draft, criteria, context } = req.body

  if (!draft || typeof draft !== 'string' || !draft.trim()) {
    return res.status(400).json({ error: 'Draft is required and must be non-empty' })
  }

  if (!criteria || !Array.isArray(criteria) || criteria.length === 0) {
    return res.status(400).json({ error: 'Criteria array is required and must not be empty' })
  }

  const contextValidation = validateContext(context)
  if (!contextValidation.valid) {
    return res.status(400).json({
      error: 'Missing required context fields',
      missing: contextValidation.missing
    })
  }

  const criteriaList = criteria.map((c, i) => `${i + 1}. [ID: ${c.id}] ${c.description}`).join('\n')

  const prompt = `You are a writing coach assessing a draft. Score how well it meets each criterion on a 1-5 scale:
1 = Strongly disagree (criterion not met at all)
2 = Disagree (criterion barely met)
3 = Neutral (criterion partially met)
4 = Agree (criterion mostly met)
5 = Strongly agree (criterion fully met)

**Context:**
- Audience: ${context.audience}
- Intent: ${context.intent}
- Concerns: ${context.concerns}
- Type: ${context.type}

**Criteria to assess:**
${criteriaList}

**Draft to assess:**
${draft}

For each criterion, provide:
- A score (1-5)
- Brief reasoning (1-2 sentences explaining why you gave that score, with specific examples from the draft)

Respond with JSON only, no other text:
{
  "scores": {
    "criterion_id": score_number,
    ...
  },
  "reasoning": {
    "criterion_id": "explanation string",
    ...
  }
}`

  try {
    const message = await anthropic.messages.create({
      model: CONFIG.model,
      max_tokens: CONFIG.maxTokens.assessDraft,
      messages: [{ role: 'user', content: prompt }]
    })

    const responseText = extractResponseText(message)
    const parsed = parseJsonResponse(responseText)
    const expectedIds = criteria.map(c => c.id)
    const validated = validateAssessmentResponse(parsed, expectedIds)

    res.status(200).json({
      scores: validated.scores,
      reasoning: validated.reasoning
    })
  } catch (err) {
    console.error('Error assessing draft:', err)
    res.status(500).json({
      error: 'Failed to assess draft',
      detail: err.message
    })
  }
}

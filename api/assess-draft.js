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

  const { draft, criteria, context, criterionNotes, previousAssessment } = req.body

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

  const criteriaList = criteria.map((c, i) => {
    let line = `${i + 1}. [ID: ${c.id}] ${c.description}`
    if (criterionNotes && criterionNotes[c.id]) {
      line += `\n   [Writer's context: "${criterionNotes[c.id]}"]`
    }
    return line
  }).join('\n')

  let previousAssessmentBlock = ''
  if (previousAssessment && previousAssessment.scores && previousAssessment.reasoning) {
    const prevLines = criteria.map(c => {
      const score = previousAssessment.scores[c.id]
      const reason = previousAssessment.reasoning[c.id]
      return score != null ? `- ${c.description}: Score ${score} — "${reason || 'No reasoning'}"` : null
    }).filter(Boolean).join('\n')

    previousAssessmentBlock = `
**Your previous assessment of an earlier draft:**
${prevLines}

The writer has revised their draft. Assess the new version against the same criteria.
Reference specific improvements or regressions compared to the previous draft.

`
  }

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
${previousAssessmentBlock}**Draft to assess:**
${draft}

For each criterion, provide:
- A score (1-5)
- Brief reasoning (1-2 sentences explaining why you gave that score, with specific examples from the draft)
- For scores 1-2: a reflective coaching question that helps the writer think about what's missing, without rewriting for them (e.g., "What would you say if you were responding to this person face-to-face? How would you acknowledge their experience before jumping to solutions?")
- For score 3: a lighter nudge pointing at what could push it higher (e.g., "The intent is there — what specific detail or phrase could make it land more clearly?")
- For scores 4-5: no suggestion needed, omit the key or set to null

Respond with JSON only, no other text:
{
  "scores": {
    "criterion_id": score_number,
    ...
  },
  "reasoning": {
    "criterion_id": "explanation string",
    ...
  },
  "suggestions": {
    "criterion_id": "coaching question or null",
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
      reasoning: validated.reasoning,
      suggestions: validated.suggestions
    })
  } catch (err) {
    console.error('Error assessing draft:', err)
    res.status(500).json({
      error: 'Failed to assess draft',
      detail: err.message
    })
  }
}

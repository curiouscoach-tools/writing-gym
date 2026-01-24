import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config() // fallback to .env
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const PORT = process.env.PORT || 3001

const anthropic = new Anthropic()

// Strip markdown code blocks if present
function parseJsonResponse(text) {
  const stripped = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '')
  return JSON.parse(stripped)
}

app.use(cors())
app.use(express.json())

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Writing Gym API',
    message: 'Use the client at http://localhost:3000'
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Extract criteria from pre-draft context
app.post('/api/extract-criteria', async (req, res) => {
  const { context } = req.body

  if (!context) {
    return res.status(400).json({ error: 'Context is required' })
  }

  const prompt = `You are a writing coach helping someone prepare to write. Based on their answers below, extract 3-5 specific criteria they can use to assess whether their draft succeeds.

**Audience:** ${context.audience}
**Intent (what they want the reader to think/feel/do):** ${context.intent}
**Concerns:** ${context.concerns}
**Writing type:** ${context.type}

Extract criteria that:
- Are specific and measurable (can be rated 1-5)
- Reflect what THEY said matters, not generic writing advice
- Include both positive goals (what to achieve) and concerns to avoid
- Are phrased as statements to rate agreement with (e.g., "The tone feels supportive, not condescending")

Respond with JSON only, no other text:
{
  "criteria": [
    {
      "id": "1",
      "description": "criterion text here",
      "extracted_from": "audience|intent|concerns|type"
    }
  ]
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })

    const responseText = message.content[0].text
    const parsed = parseJsonResponse(responseText)

    // Add scale to each criterion
    const criteria = parsed.criteria.map(c => ({
      ...c,
      scale: [1, 5]
    }))

    res.json({ criteria })
  } catch (err) {
    console.error('Error extracting criteria:', err)
    res.status(500).json({ error: 'Failed to extract criteria' })
  }
})

// Assess draft against criteria
app.post('/api/assess-draft', async (req, res) => {
  const { draft, criteria, context } = req.body

  if (!draft || !criteria || !context) {
    return res.status(400).json({ error: 'Draft, criteria, and context are required' })
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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    })

    const responseText = message.content[0].text
    const parsed = parseJsonResponse(responseText)

    res.json({
      scores: parsed.scores,
      reasoning: parsed.reasoning
    })
  } catch (err) {
    console.error('Error assessing draft:', err)
    res.status(500).json({ error: 'Failed to assess draft' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

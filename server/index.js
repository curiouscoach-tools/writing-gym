import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Extract criteria from pre-draft context
app.post('/api/extract-criteria', async (req, res) => {
  const { context } = req.body

  // TODO: Call Anthropic API to extract criteria
  // For now, return placeholder
  res.json({
    criteria: [
      { id: '1', description: 'Placeholder criterion', scale: [1, 5] }
    ]
  })
})

// Assess draft against criteria
app.post('/api/assess-draft', async (req, res) => {
  const { draft, criteria, context } = req.body

  // TODO: Call Anthropic API to assess draft
  // For now, return placeholder
  res.json({
    scores: {},
    reasoning: {}
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

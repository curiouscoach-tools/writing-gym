import { useState } from 'react'
import PreDraftQuestions from './components/PreDraftQuestions'

const STEPS = {
  CONTEXT: 'context',
  DRAFT: 'draft',
  SELF_ASSESS: 'self_assess',
  AI_ASSESS: 'ai_assess',
  COMPARE: 'compare'
}

function App() {
  const [step, setStep] = useState(STEPS.CONTEXT)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [session, setSession] = useState({
    context: {
      audience: '',
      intent: '',
      concerns: '',
      type: ''
    },
    criteria: [],
    drafts: []
  })

  const updateContext = (newContext) => {
    setSession(prev => ({ ...prev, context: newContext }))
  }

  const handleContextSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/extract-criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: session.context })
      })

      if (!response.ok) {
        throw new Error('Failed to extract criteria')
      }

      const data = await response.json()
      setSession(prev => ({ ...prev, criteria: data.criteria }))
      setStep(STEPS.DRAFT)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case STEPS.CONTEXT:
        return (
          <PreDraftQuestions
            context={session.context}
            onUpdate={updateContext}
            onSubmit={handleContextSubmit}
            isLoading={isLoading}
          />
        )
      case STEPS.DRAFT:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Draft input coming next...</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Extracted criteria:</p>
              <ul className="text-sm text-gray-600">
                {session.criteria.map((c, i) => (
                  <li key={c.id || i} className="py-1">• {c.description}</li>
                ))}
              </ul>
            </div>
          </div>
        )
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Step: {step}</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">The Writing Gym</h1>
          <p className="text-sm text-gray-500">Coach, don't rewrite</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {renderStep()}
        </div>
      </main>
    </div>
  )
}

export default App

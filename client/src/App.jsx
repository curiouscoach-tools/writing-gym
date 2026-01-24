import { useState } from 'react'
import PreDraftQuestions from './components/PreDraftQuestions'
import DraftInput from './components/DraftInput'
import SelfAssessment from './components/SelfAssessment'
import ComparisonView from './components/ComparisonView'

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
    currentDraft: '',
    selfAssessment: null,
    aiAssessment: null
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

  const handleDraftSubmit = (draft) => {
    setSession(prev => ({ ...prev, currentDraft: draft }))
    setStep(STEPS.SELF_ASSESS)
  }

  const handleSelfAssessSubmit = async (scores) => {
    setSession(prev => ({ ...prev, selfAssessment: scores }))
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/assess-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: session.currentDraft,
          criteria: session.criteria,
          context: session.context
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI assessment')
      }

      const data = await response.json()
      setSession(prev => ({ ...prev, aiAssessment: data }))
      setStep(STEPS.COMPARE)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleIterate = () => {
    setSession(prev => ({
      ...prev,
      selfAssessment: null,
      aiAssessment: null
    }))
    setStep(STEPS.DRAFT)
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
          <DraftInput
            criteria={session.criteria}
            onSubmit={handleDraftSubmit}
          />
        )
      case STEPS.SELF_ASSESS:
        return (
          <SelfAssessment
            criteria={session.criteria}
            draft={session.currentDraft}
            onSubmit={handleSelfAssessSubmit}
            isLoading={isLoading}
          />
        )
      case STEPS.COMPARE:
        return (
          <ComparisonView
            criteria={session.criteria}
            selfAssessment={session.selfAssessment}
            aiAssessment={session.aiAssessment}
            draft={session.currentDraft}
            onIterate={handleIterate}
          />
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

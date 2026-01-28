import { useState } from 'react'
import PreDraftQuestions from './components/PreDraftQuestions'
import Workspace from './components/Workspace'
import { API_ENDPOINTS } from './config'

const PHASES = {
  CONTEXT: 'context',
  WORKSPACE: 'workspace'
}

function App() {
  const [phase, setPhase] = useState(PHASES.CONTEXT)
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
    iterations: [],
    workingDraft: '',
    currentIterationId: null
  })

  const updateContext = (newContext) => {
    setSession(prev => ({ ...prev, context: newContext }))
  }

  const handleContextSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(API_ENDPOINTS.EXTRACT_CRITERIA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: session.context })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to extract criteria')
      }
      setSession(prev => ({ ...prev, criteria: data.criteria }))
      setPhase(PHASES.WORKSPACE)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDraftSubmit = (draft) => {
    const newIterationId = session.iterations.length + 1
    const newIteration = {
      id: newIterationId,
      draft,
      selfAssessment: null,
      aiAssessment: null
    }

    setSession(prev => ({
      ...prev,
      iterations: [...prev.iterations, newIteration],
      currentIterationId: newIterationId
    }))
  }

  const handleSelfAssessSubmit = async (iterationId, scores) => {
    // Update self-assessment immediately
    setSession(prev => ({
      ...prev,
      iterations: prev.iterations.map(iter =>
        iter.id === iterationId
          ? { ...iter, selfAssessment: scores }
          : iter
      )
    }))

    setIsLoading(true)
    setError(null)

    try {
      const iteration = session.iterations.find(i => i.id === iterationId)
      const response = await fetch(API_ENDPOINTS.ASSESS_DRAFT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: iteration.draft,
          criteria: session.criteria,
          context: session.context
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to get AI assessment')
      }

      setSession(prev => ({
        ...prev,
        iterations: prev.iterations.map(iter =>
          iter.id === iterationId
            ? { ...iter, aiAssessment: data }
            : iter
        ),
        workingDraft: iteration.draft,
        currentIterationId: null
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Determine if editor should be disabled (during self-assessment)
  const editorDisabled = session.currentIterationId !== null

  const renderPhase = () => {
    switch (phase) {
      case PHASES.CONTEXT:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              <PreDraftQuestions
                context={session.context}
                onUpdate={updateContext}
                onSubmit={handleContextSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        )
      case PHASES.WORKSPACE:
        return (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm max-w-3xl mx-auto">
                {error}
              </div>
            )}
            <Workspace
              criteria={session.criteria}
              iterations={session.iterations}
              workingDraft={session.workingDraft}
              currentIterationId={session.currentIterationId}
              onDraftSubmit={handleDraftSubmit}
              onSelfAssessSubmit={handleSelfAssessSubmit}
              isLoading={isLoading}
              editorDisabled={editorDisabled}
            />
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">The Writing Gym</h1>
            <p className="text-sm text-gray-500">Coach, don't rewrite</p>
          </div>
          {phase === PHASES.WORKSPACE && (
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {renderPhase()}
      </main>
    </div>
  )
}

export default App

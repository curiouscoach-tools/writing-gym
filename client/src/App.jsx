import { useState } from 'react'
import PreDraftQuestions from './components/PreDraftQuestions'
import Workspace from './components/Workspace'
import { useSession } from './hooks/useSession'

const PHASES = {
  CONTEXT: 'context',
  WORKSPACE: 'workspace'
}

function App() {
  const [phase, setPhase] = useState(PHASES.CONTEXT)

  const {
    session,
    isLoading,
    error,
    editorDisabled,
    updateContext,
    resetSession,
    extractCriteria,
    submitDraft,
    submitSelfAssessment,
    saveCriterionNote
  } = useSession()

  const handleContextSubmit = async () => {
    const result = await extractCriteria()
    if (result.success) {
      setPhase(PHASES.WORKSPACE)
    }
  }

  const renderError = () => {
    if (!error) return null
    return (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        {error}
      </div>
    )
  }

  const renderPhase = () => {
    switch (phase) {
      case PHASES.CONTEXT:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              {renderError()}
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
            <div className="max-w-3xl mx-auto">
              {renderError()}
            </div>
            <Workspace
              criteria={session.criteria}
              iterations={session.iterations}
              workingDraft={session.workingDraft}
              currentIterationId={session.currentIterationId}
              onDraftSubmit={submitDraft}
              onSelfAssessSubmit={submitSelfAssessment}
              isLoading={isLoading}
              editorDisabled={editorDisabled}
              criterionNotes={session.criterionNotes}
              onCriterionNote={saveCriterionNote}
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
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <img
            src="/assets/writing-gym-logo.png"
            alt="The Writing Gym - Coach, don't rewrite"
            className="h-20 w-auto"
          />
          <div className="flex items-center gap-4">
            {phase === PHASES.WORKSPACE && (
              <>
                <button
                  onClick={() => { resetSession(); setPhase(PHASES.CONTEXT) }}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Start Over
                </button>
                <div className="h-6 w-px bg-gray-200" />
              </>
            )}
            <a
              href="https://github.com/IanSimon23/writing-gym"
              target="_blank"
              rel="noopener noreferrer"
              title="View on GitHub"
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://curiouscoach.tools"
              target="_blank"
              rel="noopener noreferrer"
              title="Curious Coach Tools"
            >
              <img
                src="/assets/curious_coach_tools_logo.png"
                alt="Curious Coach Tools"
                className="h-12 w-auto"
              />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {renderPhase()}
      </main>
    </div>
  )
}

export default App

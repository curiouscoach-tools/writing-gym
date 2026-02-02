import DraftEditor from './DraftEditor'
import HistoryPanel from './HistoryPanel'

function Workspace({
  criteria,
  iterations,
  workingDraft,
  currentIterationId,
  onDraftSubmit,
  onSelfAssessSubmit,
  isLoading,
  editorDisabled,
  criterionNotes,
  onCriterionNote
}) {
  return (
    <div className="flex gap-6 h-[calc(100vh-180px)] min-h-[500px]">
      {/* Left panel - Draft Editor */}
      <div className="w-1/2 flex flex-col">
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Write your draft</h2>
          <p className="text-sm text-gray-500">
            Keep your criteria in mind as you write
          </p>
        </div>
        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
          <DraftEditor
            initialValue={workingDraft}
            onSubmit={onDraftSubmit}
            disabled={editorDisabled}
          />
        </div>
      </div>

      {/* Right panel - History */}
      <div className="w-1/2 flex flex-col">
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Assessment history</h2>
          <p className="text-sm text-gray-500">
            Track your progress across iterations
          </p>
        </div>
        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 overflow-hidden">
          <HistoryPanel
            criteria={criteria}
            iterations={iterations}
            currentIterationId={currentIterationId}
            onSelfAssessSubmit={onSelfAssessSubmit}
            isLoading={isLoading}
            criterionNotes={criterionNotes}
            onCriterionNote={onCriterionNote}
          />
        </div>
      </div>
    </div>
  )
}

export default Workspace

import CriteriaSummary from './CriteriaSummary'
import IterationCard from './IterationCard'

function HistoryPanel({
  criteria,
  iterations,
  currentIterationId,
  onSelfAssessSubmit,
  isLoading,
  criterionNotes,
  onCriterionNote
}) {
  const hasIterations = iterations.length > 0

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 pb-4">
        <CriteriaSummary criteria={criteria} />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {!hasIterations && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              Submit your first draft to start the assessment cycle.
            </p>
          </div>
        )}

        {iterations.map((iteration, index) => (
          <IterationCard
            key={iteration.id}
            iteration={iteration}
            criteria={criteria}
            onSelfAssessSubmit={(scores) => onSelfAssessSubmit(iteration.id, scores)}
            isLoading={isLoading && currentIterationId === iteration.id}
            isActive={currentIterationId === iteration.id}
            criterionNotes={criterionNotes}
            onCriterionNote={onCriterionNote}
            previousAiScores={index > 0 ? iterations[index - 1].aiAssessment?.scores || null : null}
          />
        ))}
      </div>
    </div>
  )
}

export default HistoryPanel

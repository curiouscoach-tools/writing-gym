import { useState } from 'react'

function ScoreBadge({ score, variant = 'default' }) {
  const colors = {
    default: 'bg-gray-100 text-gray-700',
    self: 'bg-blue-100 text-blue-700',
    ai: 'bg-purple-100 text-purple-700'
  }

  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${colors[variant]}`}>
      {score}
    </span>
  )
}

function DeltaIndicator({ selfScore, aiScore }) {
  const delta = selfScore - aiScore

  if (delta === 0) {
    return <span className="text-xs text-gray-500">Match</span>
  }

  const isOverconfident = delta > 0

  return (
    <span className={`text-xs font-medium ${isOverconfident ? 'text-amber-600' : 'text-teal-600'}`}>
      {isOverconfident ? `+${delta}` : delta}
    </span>
  )
}

function ProgressIndicator({ currentScore, previousScore }) {
  if (previousScore == null) {
    return null
  }

  const delta = currentScore - previousScore

  if (delta === 0) {
    return <span className="text-xs text-gray-500">No change</span>
  }

  const improved = delta > 0

  return (
    <span className={`text-xs font-medium ${improved ? 'text-green-600' : 'text-red-600'}`}>
      {improved ? `+${delta}` : delta}
    </span>
  )
}

function CriterionNote({ criterionId, note, onSave }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(note || '')

  const handleSave = () => {
    onSave(criterionId, draft)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraft(note || '')
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="mt-1 bg-slate-50 border border-slate-200 rounded p-2">
        <p className="text-xs text-slate-500 italic mb-1">Your context:</p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full text-xs border border-slate-300 rounded p-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-slate-400"
          rows={2}
          placeholder="Add context the AI should know about this criterion..."
          autoFocus
        />
        <div className="flex gap-2 mt-1.5">
          <button
            onClick={handleSave}
            className="text-xs px-2 py-0.5 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="text-xs px-2 py-0.5 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (note) {
    return (
      <div className="mt-1 bg-slate-50 border border-slate-200 rounded p-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-slate-500 italic">Your context:</p>
          <p className="text-xs text-slate-700 mt-0.5">{note}</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-slate-400 hover:text-slate-600 shrink-0 transition-colors"
        >
          Edit
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="mt-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
    >
      + Add context
    </button>
  )
}

function AssessmentComparison({ criteria, selfAssessment, aiAssessment, criterionNotes = {}, onCriterionNote, previousAiScores }) {
  const hasSelfAssessment = !!selfAssessment

  if (hasSelfAssessment) {
    return (
      <CalibrationView
        criteria={criteria}
        selfAssessment={selfAssessment}
        aiAssessment={aiAssessment}
        criterionNotes={criterionNotes}
        onCriterionNote={onCriterionNote}
      />
    )
  }

  return (
    <ProgressView
      criteria={criteria}
      aiAssessment={aiAssessment}
      previousAiScores={previousAiScores}
      criterionNotes={criterionNotes}
      onCriterionNote={onCriterionNote}
    />
  )
}

// Mode A: Iteration 1 — self vs AI calibration
function CalibrationView({ criteria, selfAssessment, aiAssessment, criterionNotes, onCriterionNote }) {
  const getDeltaClass = (selfScore, aiScore) => {
    const delta = Math.abs(selfScore - aiScore)
    if (delta === 0) return 'border-gray-200 bg-white'
    if (delta === 1) return 'border-amber-200 bg-amber-50'
    return 'border-amber-400 bg-amber-50'
  }

  const totalSelf = criteria.reduce((sum, c) => sum + (selfAssessment[c.id] || 0), 0)
  const totalAi = criteria.reduce((sum, c) => sum + (aiAssessment.scores[c.id] || 0), 0)
  const avgSelf = (totalSelf / criteria.length).toFixed(1)
  const avgAi = (totalAi / criteria.length).toFixed(1)

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 bg-blue-50 rounded-lg p-2 text-center">
          <p className="text-xs text-blue-600 font-medium">You</p>
          <p className="text-lg font-bold text-blue-700">{avgSelf}</p>
        </div>
        <div className="flex-1 bg-purple-50 rounded-lg p-2 text-center">
          <p className="text-xs text-purple-600 font-medium">AI</p>
          <p className="text-lg font-bold text-purple-700">{avgAi}</p>
        </div>
      </div>

      <div className="space-y-2">
        {criteria.map((criterion) => {
          const selfScore = selfAssessment[criterion.id]
          const aiScore = aiAssessment.scores[criterion.id]
          const reasoning = aiAssessment.reasoning[criterion.id]
          const suggestion = aiAssessment.suggestions?.[criterion.id]

          return (
            <div
              key={criterion.id}
              className={`border rounded-lg p-3 ${getDeltaClass(selfScore, aiScore)}`}
            >
              <p className="text-sm font-medium text-gray-900 mb-2">
                {criterion.description}
              </p>

              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">You:</span>
                  <ScoreBadge score={selfScore} variant="self" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">AI:</span>
                  <ScoreBadge score={aiScore} variant="ai" />
                </div>
                <DeltaIndicator selfScore={selfScore} aiScore={aiScore} />
              </div>

              {reasoning && (
                <p className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                  {reasoning}
                </p>
              )}

              {suggestion && (
                <div className={`text-xs rounded p-2 mt-1 ${aiScore <= 2 ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-teal-50 border border-teal-200 text-teal-800'}`}>
                  <span className="font-medium">Ask yourself: </span>{suggestion}
                </div>
              )}

              {onCriterionNote && (
                <CriterionNote
                  criterionId={criterion.id}
                  note={criterionNotes[criterion.id]}
                  onSave={onCriterionNote}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Mode B: Iterations 2+ — AI progress over previous iteration
function ProgressView({ criteria, aiAssessment, previousAiScores, criterionNotes, onCriterionNote }) {
  const getProgressClass = (currentScore, previousScore) => {
    if (previousScore == null) return 'border-gray-200 bg-white'
    const delta = currentScore - previousScore
    if (delta > 0) return 'border-green-200 bg-green-50'
    if (delta < 0) return 'border-amber-200 bg-amber-50'
    return 'border-gray-200 bg-white'
  }

  const totalAi = criteria.reduce((sum, c) => sum + (aiAssessment.scores[c.id] || 0), 0)
  const avgAi = (totalAi / criteria.length).toFixed(1)

  let avgDelta = null
  if (previousAiScores) {
    const totalPrev = criteria.reduce((sum, c) => sum + (previousAiScores[c.id] || 0), 0)
    const avgPrev = totalPrev / criteria.length
    avgDelta = (totalAi / criteria.length - avgPrev).toFixed(1)
  }

  return (
    <div className="space-y-3">
      <div className="bg-purple-50 rounded-lg p-2 text-center">
        <p className="text-xs text-purple-600 font-medium">AI Assessment</p>
        <div className="flex items-center justify-center gap-2">
          <p className="text-lg font-bold text-purple-700">{avgAi}</p>
          {avgDelta !== null && (
            <span className={`text-sm font-medium ${Number(avgDelta) > 0 ? 'text-green-600' : Number(avgDelta) < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {Number(avgDelta) > 0 ? `+${avgDelta}` : Number(avgDelta) < 0 ? avgDelta : 'No change'}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {criteria.map((criterion) => {
          const aiScore = aiAssessment.scores[criterion.id]
          const prevScore = previousAiScores?.[criterion.id] ?? null
          const reasoning = aiAssessment.reasoning[criterion.id]
          const suggestion = aiAssessment.suggestions?.[criterion.id]

          return (
            <div
              key={criterion.id}
              className={`border rounded-lg p-3 ${getProgressClass(aiScore, prevScore)}`}
            >
              <p className="text-sm font-medium text-gray-900 mb-2">
                {criterion.description}
              </p>

              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">AI:</span>
                  <ScoreBadge score={aiScore} variant="ai" />
                </div>
                <ProgressIndicator currentScore={aiScore} previousScore={prevScore} />
              </div>

              {reasoning && (
                <p className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                  {reasoning}
                </p>
              )}

              {suggestion && (
                <div className={`text-xs rounded p-2 mt-1 ${aiScore <= 2 ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-teal-50 border border-teal-200 text-teal-800'}`}>
                  <span className="font-medium">Ask yourself: </span>{suggestion}
                </div>
              )}

              {onCriterionNote && (
                <CriterionNote
                  criterionId={criterion.id}
                  note={criterionNotes[criterion.id]}
                  onSave={onCriterionNote}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AssessmentComparison

function ScoreBadge({ score, variant = 'default' }) {
  const colors = {
    default: 'bg-gray-100 text-gray-700',
    self: 'bg-blue-100 text-blue-700',
    ai: 'bg-purple-100 text-purple-700'
  }

  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${colors[variant]}`}>
      {score}
    </span>
  )
}

function DeltaIndicator({ selfScore, aiScore }) {
  const delta = selfScore - aiScore

  if (delta === 0) {
    return <span className="text-sm text-gray-500">Match</span>
  }

  const isOverconfident = delta > 0
  const absDelta = Math.abs(delta)

  return (
    <span className={`text-sm font-medium ${isOverconfident ? 'text-amber-600' : 'text-teal-600'}`}>
      {isOverconfident ? `+${delta} overestimate` : `${delta} underestimate`}
    </span>
  )
}

function ComparisonView({ criteria, selfAssessment, aiAssessment, draft, onIterate }) {
  const getDeltaClass = (selfScore, aiScore) => {
    const delta = Math.abs(selfScore - aiScore)
    if (delta === 0) return 'border-gray-200'
    if (delta === 1) return 'border-amber-200 bg-amber-50'
    return 'border-amber-400 bg-amber-50'
  }

  const totalSelf = criteria.reduce((sum, c) => sum + (selfAssessment[c.id] || 0), 0)
  const totalAi = criteria.reduce((sum, c) => sum + (aiAssessment.scores[c.id] || 0), 0)
  const avgSelf = (totalSelf / criteria.length).toFixed(1)
  const avgAi = (totalAi / criteria.length).toFixed(1)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Compare Assessments</h2>
        <p className="text-gray-600 mt-1">
          See how your self-assessment compares to the AI's evaluation.
          Gaps reveal blind spots—this is where learning happens.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-600 font-medium">Your Average</p>
          <p className="text-3xl font-bold text-blue-700">{avgSelf}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-sm text-purple-600 font-medium">AI Average</p>
          <p className="text-3xl font-bold text-purple-700">{avgAi}</p>
        </div>
      </div>

      <div className="space-y-4">
        {criteria.map((criterion) => {
          const selfScore = selfAssessment[criterion.id]
          const aiScore = aiAssessment.scores[criterion.id]
          const reasoning = aiAssessment.reasoning[criterion.id]

          return (
            <div
              key={criterion.id}
              className={`border rounded-lg p-4 ${getDeltaClass(selfScore, aiScore)}`}
            >
              <p className="font-medium text-gray-900 mb-3">
                {criterion.description}
              </p>

              <div className="flex items-center gap-6 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">You:</span>
                  <ScoreBadge score={selfScore} variant="self" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">AI:</span>
                  <ScoreBadge score={aiScore} variant="ai" />
                </div>
                <DeltaIndicator selfScore={selfScore} aiScore={aiScore} />
              </div>

              {reasoning && (
                <div className="bg-white rounded p-3 border border-gray-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">AI reasoning: </span>
                    {reasoning}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Your draft:</p>
        <p className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
          {draft}
        </p>
      </div>

      <div className="pt-4 flex gap-3">
        <button
          onClick={onIterate}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-colors"
        >
          Revise Draft
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700
            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  )
}

export default ComparisonView

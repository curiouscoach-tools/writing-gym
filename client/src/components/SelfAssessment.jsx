import { useState } from 'react'

const SCALE_LABELS = {
  1: 'Strongly disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly agree'
}

function SelfAssessment({ criteria, draft, onSubmit, isLoading }) {
  const [scores, setScores] = useState(() => {
    const initial = {}
    criteria.forEach(c => { initial[c.id] = null })
    return initial
  })

  const allScored = Object.values(scores).every(s => s !== null)

  const handleScore = (criterionId, score) => {
    setScores(prev => ({ ...prev, [criterionId]: score }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (allScored) {
      onSubmit(scores)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Assess your draft</h2>
        <p className="text-gray-600 mt-1">
          Before seeing AI feedback, rate how well your draft meets each criterion.
          Be honest—this is where learning happens.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Your draft:</p>
        <p className="text-sm text-gray-600 whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
          {draft}
        </p>
      </div>

      <div className="space-y-6">
        {criteria.map((criterion) => (
          <div key={criterion.id} className="border border-gray-200 rounded-lg p-4">
            <p className="font-medium text-gray-900 mb-3">
              {criterion.description}
            </p>
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleScore(criterion.id, score)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-[60px]
                    ${scores[criterion.id] === score
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'hover:bg-gray-100 border-2 border-transparent'
                    }`}
                >
                  <span className={`text-lg font-bold ${
                    scores[criterion.id] === score ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {score}
                  </span>
                  <span className="text-xs text-gray-500 text-center mt-1">
                    {SCALE_LABELS[score]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={!allScored || isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          {isLoading ? 'Getting AI assessment...' : 'See AI Assessment'}
        </button>
        {!allScored && (
          <p className="text-sm text-gray-500 text-center mt-2">
            Rate all {criteria.length} criteria to continue
          </p>
        )}
      </div>
    </form>
  )
}

export default SelfAssessment

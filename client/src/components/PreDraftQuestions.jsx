import { useState } from 'react'

const QUESTIONS = [
  {
    id: 'audience',
    label: "Who's your audience?",
    placeholder: "e.g., My manager, a frustrated customer, the engineering team...",
    hint: "Think about your relationship and their context"
  },
  {
    id: 'intent',
    label: "What do you want them to think, feel, or do?",
    placeholder: "e.g., Feel reassured that we're handling the issue, understand the timeline, approve my proposal...",
    hint: "Be specific about the outcome you're aiming for"
  },
  {
    id: 'concerns',
    label: "What concerns do you have about this communication?",
    placeholder: "e.g., I don't want to sound defensive, I'm worried it's too long, I might come across as pushy...",
    hint: "What could go wrong? What tone pitfalls worry you?"
  },
  {
    id: 'type',
    label: "What type of writing is this?",
    placeholder: "e.g., Email, Slack message, blog post, documentation, user story...",
    hint: "This helps calibrate expectations"
  }
]

function PreDraftQuestions({ context, onUpdate, onSubmit, isLoading }) {
  const [errors, setErrors] = useState({})

  const handleChange = (id, value) => {
    onUpdate({ ...context, [id]: value })
    if (errors[id]) {
      setErrors({ ...errors, [id]: null })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate required fields
    const newErrors = {}
    QUESTIONS.forEach(q => {
      if (!context[q.id]?.trim()) {
        newErrors[q.id] = 'This field is required'
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Before you write</h2>
        <p className="text-gray-600 mt-1">
          Answer these questions to establish your criteria. This is how you'll measure success.
        </p>
      </div>

      {QUESTIONS.map((question) => (
        <div key={question.id}>
          <label
            htmlFor={question.id}
            className="block text-sm font-medium text-gray-900 mb-1"
          >
            {question.label}
          </label>
          <textarea
            id={question.id}
            value={context[question.id] || ''}
            onChange={(e) => handleChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors[question.id] ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors[question.id] ? (
            <p className="mt-1 text-sm text-red-600">{errors[question.id]}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">{question.hint}</p>
          )}
        </div>
      ))}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          {isLoading ? 'Extracting criteria...' : 'Continue to Draft'}
        </button>
      </div>
    </form>
  )
}

export default PreDraftQuestions

import { useState } from 'react'

function DraftInput({ criteria, onSubmit }) {
  const [draft, setDraft] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (draft.trim()) {
      onSubmit(draft)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Write your draft</h2>
        <p className="text-gray-600 mt-1">
          Keep your criteria in mind as you write. You'll assess yourself against them next.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Your criteria:</p>
        <ul className="text-sm text-gray-600 space-y-1">
          {criteria.map((c) => (
            <li key={c.id} className="flex items-start">
              <span className="text-gray-400 mr-2">•</span>
              <span>{c.description}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label htmlFor="draft" className="block text-sm font-medium text-gray-900 mb-1">
          Your draft
        </label>
        <textarea
          id="draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Start writing..."
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            font-mono text-sm"
        />
        <p className="mt-1 text-sm text-gray-500">
          {draft.length} characters
        </p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={!draft.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          Continue to Self-Assessment
        </button>
      </div>
    </form>
  )
}

export default DraftInput

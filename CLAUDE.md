# The Writing Gym

## Vision

The Writing Gym is a coaching tool that helps people become better writers by making them aware of the signals they're sending, the tone they're conveying, and how their audience might receive their message. Unlike AI tools that rewrite content, this tool guides users through structured reflection to build their writing skills.

**Core Philosophy**: Coach, don't rewrite. Make writers better, not outputs better.

**The Problem**: Current AI writing tools create dependency - people get better outputs but become worse writers. They outsource thinking instead of developing skill.

**Our Approach**: Force structured thinking before writing, self-assessment before AI feedback, and multiple iterations before offering AI rewrites.

## Success Criteria

- Single context-agnostic tool (works for emails, blog posts, user stories, etc.)
- Pre-draft coaching questions establish user's own criteria
- Self-assessment before AI feedback (maximize learning)
- 3-iteration cycle before unlocking AI rewrites
- Scoring compares self vs AI assessment against user's stated goals

## Simple Prototype Scope

Build the core learning loop:

1. **Pre-draft questions** (3-4 key questions to establish context and criteria)
2. **Draft input** (single text area)
3. **Self-assessment** (rate how well draft meets extracted criteria)
4. **AI assessment reveal** (scores + comparison to self-assessment)
5. **One iteration cycle** (prove the loop works)

**Deferred to later**:
- Full 3-iteration tracking
- Color-coded text highlighting
- Inline annotations
- Side-by-side editing
- Export functionality
- AI rewrite unlock
- Sign-in and progress tracking
- Personal style library

## Technical Architecture

**Stack**:
- Frontend: React + Tailwind (Vite)
- Backend: Node/Express (thin API proxy for Anthropic)
- Storage: localStorage (session state only)
- Deployment: Vercel (static frontend + serverless functions)

**File Structure**:
```
writing-gym/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── server/                 # Express backend
│   ├── index.js
│   └── package.json
└── README.md
```

**API Design**:
- `POST /api/extract-criteria` - Parse pre-draft answers, return criteria
- `POST /api/assess-draft` - Score draft against criteria, return feedback

## Design Decisions & Future Flexibility

These decisions keep options open as the product evolves:

### Data Schema (Flexible Foundation)

Design localStorage with future database migration in mind:

```javascript
// Proposed schema - not final, but shows thinking
{
  version: "1.0",              // Support schema evolution
  user_id: null,               // null for now, ready for sign-in
  session_id: "uuid",
  timestamp: "ISO8601",
  context: {
    audience: "...",
    intent: "...",
    concerns: "...",
    type: "..."
  },
  criteria: [                  // Flexible structure
    {
      id: "uuid",
      type: "scale",           // Could add "binary", "rubric", etc.
      scale: [1, 5],           // Configurable range
      description: "Make them feel supported",
      extracted_from: "intent"
    }
  ],
  drafts: [
    {
      iteration: 1,
      content: {
        main: "text"           // Extensible - could add {subject, body}, {title, sections}
      },
      self_assessment: {
        scores: {...},
        timestamp: "..."
      },
      ai_assessment: {
        scores: {...},
        reasoning: {...},
        timestamp: "..."
      }
    }
  ]
}
```

**Why this matters**: 
- Adding structured writing types (email vs blog) doesn't break existing data
- Migration to real database is schema translation, not redesign
- Versioning lets us evolve assessment logic without orphaning old sessions

### Configurable Thresholds

Make iteration counts and assessment scales configurable early:

```javascript
// Even if we start with defaults, keep them configurable
const CONFIG = {
  iterations_before_unlock: 3,     // Could vary by writing type
  assessment_scale: [1, 5],        // Could support different scales
  min_criteria: 2,                 // Minimum extracted criteria
  max_criteria: 6                  // Avoid overwhelming users
}
```

**Why this matters**: Different contexts may need different coaching intensity. Quick emails might unlock after 2 iterations, complex documents after 5.

### API Abstractions

Keep API endpoints focused but extensible:

- `POST /api/analyze-context` - Returns criteria + metadata (not just criteria)
- `POST /api/assess-draft` - Accepts flexible assessment config
- `POST /api/export-session` - Takes format parameter from day one

**Why this matters**: As assessment logic gets sophisticated (RAG, user preferences, context rules), we add complexity in one place, not refactor the API.

### Component Design Principles

Build comparison views to accept any two assessment sources:

```jsx
<ComparisonView 
  sourceA={selfAssessment} 
  sourceB={aiAssessment}
  // Later: sourceB could be historicalAssessment, peerAssessment, expertAssessment
/>
```

**Why this matters**: Enables historical comparison (iteration 1 vs 3), peer comparison, expert benchmarks without rebuilding UI.

### Export Flexibility

Design export to support multiple formats from the start:

```javascript
function exportSession(session, format = 'json') {
  // Prototype: just JSON
  // Later: add 'markdown', 'pdf', 'docx' handlers
}
```

**Why this matters**: Users will want their final drafts in different formats. Starting with abstraction makes this trivial to add.

---

**Note**: These are working assumptions to avoid painting ourselves into corners. We're not implementing all this complexity in the prototype - just structuring code so adding these capabilities later is straightforward, not a rewrite.

## Development Phases

### Phase 1: Prototype (Current)
- Pre-draft questions UI
- Draft input
- Self-assessment scoring
- AI assessment + comparison
- Basic iteration (re-submit draft)

### Phase 2: MVP
- Full 3-iteration tracking
- Side-by-side editing view
- AI rewrite unlock after iteration 3
- Export session (.json) + final draft

### Phase 3: Extensions
- User sign-in
- Progress tracking across sessions
- Writing evolution reporting
- Personal style library
- User-editable criteria
- Mobile optimization

## Pre-Draft Questions

The coaching starts with these questions to establish criteria:

1. **Who's your audience?** (relationship/context)
2. **What do you want them to think/feel/do?** (intent)
3. **What concerns do you have about this communication?** (anxiety points)
4. **What type of writing is this?** (email, blog post, documentation, etc.)

From these answers, the system extracts assessment criteria like:
- "Make them feel supported"
- "Provide clear next steps"
- "Avoid sounding condescending"
- etc.

## Assessment Flow

**Self-Assessment**:
- User rates their own draft (1-5 scale) against each extracted criterion
- Forces reflection before seeing AI feedback

**AI Assessment**:
- AI scores same criteria (1-5 scale)
- Provides specific reasoning for each score
- Highlights delta between self and AI assessment

**Comparison**:
- Side-by-side scores reveal blind spots
- "You thought you nailed supportive tone (5), but AI sees it as mixed (3)"
- This is the learning moment

## Success Metrics

**For the prototype**:
- Does the self-assess → AI-assess → compare flow create "aha" moments?
- Do extracted criteria accurately reflect user intent?
- Does the UX rhythm feel natural?

**For MVP**:
- Do users iterate at least twice before accepting their draft?
- Does quality improve across iterations?
- Do self-assessments get more accurate over time?

## BlogLog Integration

Initialize BlogLog for this project:

```bash
bl init --name "The Writing Gym"
```

**CLI Commands**:
- `bl commit "msg"` - Log message + git commit
- `bl note "text"` - Capture a thought
- `bl win "text"` - Log a breakthrough
- `bl blocker "text"` - Log a stuck point
- `bl serve` - Start web interface (localhost:3001)
- `bl generate` - Generate blog post (interactive)

## First Steps

1. Initialize BlogLog
2. Set up project structure (client + server)
3. Build pre-draft questions UI
4. Implement criteria extraction
5. Build draft input + self-assessment UI
6. Implement AI assessment API
7. Build comparison view
8. Test one full iteration cycle

---

**Portfolio Context**: This tool demonstrates AI product thinking - using AI to augment human capability rather than replace it. Shows understanding of skill development, learning psychology, and the risks of AI dependency.
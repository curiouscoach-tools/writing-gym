# The Writing Gym

A coaching tool that helps people become better writers through structured self-reflection and AI feedback. Unlike tools that rewrite your content, The Writing Gym makes *you* a better writer.

**Core Philosophy**: Coach, don't rewrite. Make writers better, not outputs better.

## The Problem

Current AI writing tools create dependency. People get better outputs but become worse writers. They outsource thinking instead of developing skill.

## Our Approach

1. **Structured thinking before writing** - Answer coaching questions to establish your own success criteria
2. **Self-assessment before AI feedback** - Rate your draft first to maximize learning
3. **Comparison reveals blind spots** - See where your self-assessment differs from AI evaluation
4. **Iterate to improve** - Revise with full history visible

## How It Works

```
┌─────────────────────┬─────────────────────┐
│   Draft Editor      │   History Panel     │
│   (always visible)  │   (scrollable)      │
│                     │   - Your criteria   │
│                     │   - Iteration 1     │
│                     │     - Draft         │
│                     │     - Self-assess   │
│                     │     - AI feedback   │
│                     │   - Iteration 2...  │
└─────────────────────┴─────────────────────┘
```

1. Answer pre-draft questions (audience, intent, concerns, type)
2. System extracts assessment criteria from your answers
3. Write your draft in the persistent left panel
4. Self-assess against each criterion (1-5 scale)
5. See AI assessment with reasoning and score deltas
6. Revise and repeat - your history stays visible

## Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/writing-gym.git
cd writing-gym

# Install dependencies
npm install --prefix api
npm install --prefix client

# Set up environment
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local

# Run development server (uses Vercel CLI)
npx vercel dev
```

Visit `http://localhost:3000`

## Tech Stack

- **Frontend**: React + Tailwind CSS (Vite)
- **Backend**: Vercel Serverless Functions (API proxy for Anthropic)
- **AI**: Claude API for criteria extraction and assessment
- **Storage**: In-memory (session only for now)
- **Deployment**: Vercel

## Project Structure

```
writing-gym/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── PreDraftQuestions.jsx
│       │   ├── Workspace.jsx
│       │   ├── DraftEditor.jsx
│       │   ├── HistoryPanel.jsx
│       │   └── ...
│       └── App.jsx
├── api/                    # Vercel serverless functions
│   ├── extract-criteria.js
│   ├── assess-draft.js
│   └── health.js
├── vercel.json             # Vercel deployment config
└── .bloglog/               # Development timeline
```

## Architecture

This project uses **Vercel's serverless architecture**:

- **Frontend**: Static React app built with Vite, served from `client/dist`
- **API**: Serverless functions in `/api` handle Claude API calls
- **Development**: `vercel dev` runs both frontend and API locally
- **Production**: Vercel hosts static files and serverless functions together

The API functions act as a thin proxy to the Anthropic API, keeping the API key server-side.

## API Endpoints

- `POST /api/extract-criteria` - Parse context, return assessment criteria
- `POST /api/assess-draft` - Score draft against criteria with reasoning

## Development

This project uses [BlogLog](https://github.com/your-username/bloglog) for development tracking:

```bash
bl commit "message"   # Git commit + timeline log
bl win "text"         # Log a breakthrough
bl note "text"        # Capture a thought
bl serve              # View development timeline
```

## Roadmap

- [ ] 3-iteration gate before AI rewrite unlock
- [ ] Session export (JSON, Markdown)
- [ ] localStorage persistence
- [ ] User authentication (freemium model)
- [ ] Scenario templates
- [ ] Calibration tracking over time

## License

AGPL-3.0 - See [LICENSE](LICENSE)

---

Built to demonstrate that AI can make humans more capable, not more dependent.

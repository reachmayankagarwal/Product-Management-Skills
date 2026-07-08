# Product Management Skills Portal

Single-page web portal exposing the 21 consulting skills from *The Consultant's Guide to Claude*
([PM-Consultant-Skills](https://github.com/reachmayankagarwal/PM-Consultant-Skills)) to any product manager.

Pick a skill from the vertical tabs (grouped Diagnose → Analyze → Synthesize → Decide → Execute → Measure),
drop your query, and get a client-ready markdown answer streamed back.

## Stack

- Next.js 14 (App Router) — UI + API route
- Groq (`llama-3.3-70b-versatile`) — inference; each skill's SKILL.md is the system prompt
- Vercel — hosting

## Run locally

```bash
npm install
GROQ_API_KEY=your_key npm run dev
```

## Deploy

Deployed on Vercel. Required environment variable:

- `GROQ_API_KEY` — Groq API key (server-side only, never exposed to the browser)
- `GROQ_MODEL` (optional) — defaults to `llama-3.3-70b-versatile`

## How it works

`lib/skills.js` embeds all 21 skills (id, phase, description, system prompt) generated from their
SKILL.md files, adapted for single-shot web use (assume-and-proceed instead of asking follow-ups).
`POST /api/generate` validates the request, calls Groq with the selected skill's system prompt and
the user's query, and streams the completion back as plain text that the client renders as markdown.

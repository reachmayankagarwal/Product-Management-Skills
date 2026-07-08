"use client";

import { useMemo, useRef, useState } from "react";
import { marked } from "marked";
import Link from "next/link";
import { PHASES, SKILLS } from "../../lib/skills";

marked.setOptions({ breaks: true, gfm: true });

const PLACEHOLDERS = {
  Diagnose: "Describe the client situation, how the client frames it, and the business context...",
  Analyze: "Paste the problem, question, and whatever data or observations you have...",
  Synthesize: "Paste the problem, evidence, options, and constraints developed so far...",
  Decide: "Paste the options, trade-offs, and what the decision-maker cares about...",
  Execute: "Paste the approved recommendation, initiatives, people, and constraints...",
  Measure: "Paste the recommendation, success criteria, business case, or delivery status...",
};

function renderMarkdown(text) {
  // escape raw HTML so only markdown formatting renders
  const escaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return { __html: marked.parse(escaped) };
}

export default function Home() {
  const [activeId, setActiveId] = useState(SKILLS[0].id);
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | streaming | error
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const active = useMemo(() => SKILLS.find((s) => s.id === activeId), [activeId]);
  const grouped = useMemo(
    () => PHASES.map((p) => ({ phase: p, items: SKILLS.filter((s) => s.phase === p) })),
    []
  );

  function selectSkill(id) {
    abortRef.current?.abort();
    setActiveId(id);
    setOutput("");
    setError("");
    setStatus("idle");
  }

  async function run() {
    if (!query.trim() || status === "loading" || status === "streaming") return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setOutput("");
    setError("");
    setStatus("loading");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: activeId, query }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      setStatus("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setOutput(acc);
      }
      setStatus("idle");
    } catch (e) {
      if (e.name === "AbortError") return;
      setError(e.message);
      setStatus("error");
    }
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Link href="/" className="home-link">&larr; Home</Link>
          <h1>PM Consultant Skills</h1>
          <p>21 skills. Pick one, drop your query, get a client-ready answer.</p>
        </div>
        <nav>
          {grouped.map(({ phase, items }) => (
            <div key={phase} className="phase-group">
              <div className="phase-label">{phase}</div>
              {items.map((s) => (
                <button
                  key={s.id}
                  className={`tab ${s.id === activeId ? "active" : ""}`}
                  onClick={() => selectSkill(s.id)}
                >
                  <span className="tab-num">{s.num}</span>
                  <span>{s.title}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="skill-header">
          <span className="phase-chip">{active.phase}</span>
          <h2>{active.title}</h2>
          <p>{active.blurb}</p>
        </header>

        <section className="query-box">
          <textarea
            value={query}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run();
            }}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={PLACEHOLDERS[active.phase]}
            rows={6}
          />
          <div className="actions">
            <span className="hint">Cmd/Ctrl + Enter to run</span>
            <button
              className="run"
              onClick={run}
              disabled={!query.trim() || status === "loading" || status === "streaming"}
            >
              {status === "loading" || status === "streaming" ? "Working..." : "Run skill"}
            </button>
          </div>
        </section>

        <section className="output">
          {status === "error" && <div className="error">{error}</div>}
          {status === "loading" && <div className="loading">Thinking with {active.title}...</div>}
          {output && <article dangerouslySetInnerHTML={renderMarkdown(output)} />}
          {!output && status === "idle" && !error && (
            <div className="empty">Output appears here.</div>
          )}
        </section>
      </main>
    </div>
  );
}

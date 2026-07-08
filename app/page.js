import Link from "next/link";
import { PHASES, SKILLS } from "../lib/skills";

const PHASE_TAGLINES = {
  Diagnose: "Frame the real problem, the people, the targets, and the scope before any analysis.",
  Analyze: "Map the evidence, test hypotheses, find root causes, and put a number on the problem.",
  Synthesize: "Generate real options, expose trade-offs, stress-test assumptions, model futures.",
  Decide: "Commit to one position, quantify the case, and land it in a one-page memo.",
  Execute: "Sequence the roadmap, assign single owners, and surface delivery risks early.",
  Measure: "Pick the KPIs that matter, track promised value, and capture the lessons.",
};

export default function HomePage() {
  return (
    <div className="home">
      <section className="hero">
        <span className="phase-chip">21 skills · 6 phases</span>
        <h1>PM Consultant Skills</h1>
        <p className="lede">
          A consulting co-pilot for product managers. Each skill turns your messy, real-world
          input into a structured, client-ready deliverable — a framed problem, a trade-off
          matrix, an executive memo — following the disciplines from{" "}
          <em>The Consultant&apos;s Guide to Claude</em>.
        </p>
        <Link href="/skills" className="cta">Open the portal &rarr;</Link>
      </section>

      <section className="how">
        <h2>How to use it</h2>
        <ol className="steps">
          <li>
            <strong>Pick a skill.</strong> The vertical tabs are grouped by engagement phase —
            start at Diagnose if you&apos;re at the beginning, or jump straight to the skill that
            matches where you&apos;re stuck.
          </li>
          <li>
            <strong>Drop your query.</strong> Paste real context: the situation, what you know,
            numbers, constraints, who&apos;s deciding. The more specific the input, the sharper
            the output. Missing details are fine — the skill states its assumptions and proceeds.
          </li>
          <li>
            <strong>Get the deliverable.</strong> The answer streams back in the skill&apos;s
            fixed structure (each skill enforces its own quality gate), ready to paste into a
            doc or deck. Then feed it into the next skill in the chain.
          </li>
        </ol>
        <p className="chain-note">
          The skills form a chain — <strong>Problem &rarr; Evidence &rarr; Options &rarr;
          Recommendation &rarr; Roadmap &rarr; Value</strong> — so each output is designed to be
          the next skill&apos;s input.
        </p>
      </section>

      <section className="phases">
        <h2>The six phases</h2>
        <div className="phase-grid">
          {PHASES.map((phase) => {
            const items = SKILLS.filter((s) => s.phase === phase);
            return (
              <Link href="/skills" key={phase} className="phase-card">
                <h3>{phase}</h3>
                <p>{PHASE_TAGLINES[phase]}</p>
                <ul>
                  {items.map((s) => (
                    <li key={s.id}>{s.title}</li>
                  ))}
                </ul>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="foot">
        <p>
          Powered by Groq · Skills source:{" "}
          <a href="https://github.com/reachmayankagarwal/PM-Consultant-Skills">
            PM-Consultant-Skills
          </a>{" "}
          · Portal code:{" "}
          <a href="https://github.com/reachmayankagarwal/Product-Management-Skills">
            Product-Management-Skills
          </a>
        </p>
      </footer>
    </div>
  );
}

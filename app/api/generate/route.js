import { SKILLS } from "../../../lib/skills";

export const maxDuration = 60;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { skillId, query } = body || {};
  const skill = SKILLS.find((s) => s.id === skillId);
  if (!skill) {
    return Response.json({ error: "Unknown skill" }, { status: 400 });
  }
  if (!query || typeof query !== "string" || !query.trim()) {
    return Response.json({ error: "Query is required" }, { status: 400 });
  }
  if (query.length > 12000) {
    return Response.json({ error: "Query too long (12k char limit)" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GROQ_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      stream: true,
      temperature: 0.4,
      max_tokens: 4096,
      messages: [
        { role: "system", content: skill.system },
        { role: "user", content: query },
      ],
    }),
  });

  if (!groqRes.ok) {
    const detail = await groqRes.text().catch(() => "");
    return Response.json(
      { error: `Groq API error (${groqRes.status}): ${detail.slice(0, 300)}` },
      { status: 502 }
    );
  }

  // Re-emit Groq's SSE stream as plain text chunks
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const reader = groqRes.body.getReader();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              let delta = JSON.parse(data).choices?.[0]?.delta?.content;
              if (delta) {
                // enforce no long dashes in output regardless of model behavior
                delta = delta.replace(/\s*\u2014\s*/g, ", ").replace(/\u2013/g, "-");
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              /* skip malformed chunk */
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

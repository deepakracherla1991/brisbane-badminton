import Anthropic from "@anthropic-ai/sdk";
import { MAX_MESSAGE_CHARS, MAX_USER_MESSAGES, buildSystemPrompt, offlineAnswer } from "@/lib/assistant";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const MODEL = "claude-opus-5-5";
const SYSTEM_PROMPT = buildSystemPrompt();

// Simple per-IP limit (per server instance) to stop abuse: 40 requests per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 40;
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_REQUESTS;
}

function parseMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) return null;
  const raw = (body as { messages: unknown[] }).messages;
  const messages: ChatMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, MAX_MESSAGE_CHARS * 4);
    if (!text) continue;
    messages.push({ role, content: role === "user" ? text.slice(0, MAX_MESSAGE_CHARS) : text });
  }
  // The API needs the conversation to start with a user turn (the welcome message is UI-only).
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return null;
  return messages;
}

function textStream(produce: (write: (text: string) => void) => Promise<void>, mode: "ai" | "offline") {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      await produce((text) => controller.enqueue(encoder.encode(text)));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Assistant-Mode": mode },
  });
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (rateLimited(ip)) {
    return Response.json({ error: "Too many messages. Please try again in a few minutes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const messages = parseMessages(body);
  if (!messages) return Response.json({ error: "Invalid request." }, { status: 400 });
  if (messages.filter((m) => m.role === "user").length > MAX_USER_MESSAGES) {
    return Response.json({ error: "Chat limit reached." }, { status: 429 });
  }

  const question = messages[messages.length - 1].content;

  // No API key configured: answer common questions from the site content.
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return textStream(async (write) => write(offlineAnswer(question)), "offline");
  }

  const client = new Anthropic();

  return textStream(async (write) => {
    let wrote = false;
    try {
      const stream = client.beta.messages.stream({
        model: MODEL,
        max_tokens: 16000,
        output_config: { effort: "low" },
        // If the model declines on a safety classifier, retry on a fallback model automatically.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        messages,
      });
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          write(event.delta.text);
          wrote = true;
        }
      }
      const final = await stream.finalMessage();
      if (!wrote) {
        write(
          final.stop_reason === "refusal"
            ? "Sorry, I can't help with that one. Is there anything about the venue I can help with?"
            : offlineAnswer(question),
        );
      }
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) console.error("[chat] Invalid ANTHROPIC_API_KEY");
      else if (error instanceof Anthropic.RateLimitError) console.error("[chat] Anthropic rate limit hit");
      else if (error instanceof Anthropic.APIError) console.error(`[chat] Anthropic API error ${error.status}: ${error.message}`);
      else console.error("[chat] Unexpected error", error);
      // Keep the visitor moving with a basic answer instead of an error.
      write(wrote ? "\n\n(Sorry, I lost my connection. Please try again.)" : offlineAnswer(question));
    }
  }, "ai");
}

"use client";

import Image from "next/image";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, SendHorizontal, X } from "lucide-react";
import { WhatsAppIcon } from "./SocialIcons";
import { ASSISTANT_NAME, MAX_MESSAGE_CHARS, MAX_USER_MESSAGES, QUICK_REPLIES, WELCOME_MESSAGE } from "@/lib/assistant-config";
import { site } from "@/content/site";

type Msg = { role: "user" | "assistant"; content: string; time: number };

const STORAGE_KEY = "bb-chat-v1";
const NUDGE_KEY = "bb-chat-nudged";
const whatsappUrl = `https://wa.me/${site.contact.whatsapp.replace("+", "")}`;

function store<T>(key: string, value?: T): T | null {
  try {
    if (value === undefined) {
      const raw = sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    }
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be blocked (private mode etc.); the chat still works without it.
  }
  return null;
}

const timeFmt = (t: number) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function friendlyLabel(u: URL) {
  const host = u.hostname.replace(/^www\./, "");
  if (host === "wa.me") return "WhatsApp";
  if (host.includes("google.") && u.pathname.startsWith("/maps")) return "Google Maps";
  if (host.endsWith("instagram.com")) return "Instagram";
  if (host.endsWith("facebook.com")) return "Facebook";
  return host;
}

/** Turn URLs, emails and phone numbers into links; keep everything else as text. */
function RichText({ text }: { text: string }) {
  const pattern = /(https?:\/\/[^\s)]+[^\s).,!?]|[\w.+-]+@[\w-]+\.[\w.]+\w|\+61\s?\d{3}\s?\d{3}\s?\d{3})/g;
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
        let href = part;
        let label = part;
        if (part.includes("@") && !part.startsWith("http")) href = `mailto:${part}`;
        else if (part.startsWith("+61")) href = `tel:${part.replace(/\s/g, "")}`;
        else {
          try {
            const u = new URL(part);
            const internal = u.hostname.replace(/^www\./, "") === new URL(site.url).hostname.replace(/^www\./, "");
            if (internal) href = label = u.pathname + u.hash || "/";
            else label = friendlyLabel(u);
          } catch {
            /* leave as is */
          }
        }
        const external = href.startsWith("http");
        return (
          <a
            key={i}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="break-words font-medium text-brand-300 underline underline-offset-2 hover:text-white"
          >
            {label}
          </a>
        );
      })}
    </>
  );
}

function Avatar({ size = "h-9 w-9", online = false }: { size?: string; online?: boolean }) {
  return (
    <span className={`relative inline-grid shrink-0 place-items-center rounded-full bg-white ${size}`}>
      <Image src="/logos/emblem-red.png" alt="" width={259} height={259} className="h-[70%] w-[70%]" />
      {online && (
        <span className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-ink-2 bg-emerald-400" aria-hidden="true" />
      )}
    </span>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // Restore this tab's conversation, or start with the welcome message.
  useEffect(() => {
    const saved = store<Msg[]>(STORAGE_KEY);
    setMessages(saved?.length ? saved : [{ role: "assistant", content: WELCOME_MESSAGE, time: Date.now() }]);
    if (!store<boolean>(NUDGE_KEY)) {
      const t = setTimeout(() => setNudge(true), 5000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (messages.length) store(STORAGE_KEY, messages);
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (!open) return;
    setNudge(false);
    store(NUDGE_KEY, true);
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const used = messages.filter((m) => m.role === "user").length;
  const remaining = Math.max(0, MAX_USER_MESSAGES - used);
  const limitReached = remaining === 0;

  const send = useCallback(
    async (text: string) => {
      const question = text.trim().slice(0, MAX_MESSAGE_CHARS);
      if (!question || busy || limitReached) return;
      setError(null);
      setInput("");
      const history: Msg[] = [...messages, { role: "user", content: question, time: Date.now() }];
      setMessages(history);
      setBusy(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
        });
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Something went wrong.");
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let reply = "";
        const time = Date.now();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          reply += decoder.decode(value, { stream: true });
          setMessages([...history, { role: "assistant", content: reply, time }]);
        }
        if (!reply.trim()) throw new Error("No reply received.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
        setMessages(history);
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, limitReached, messages],
  );

  const showQuickReplies = used === 0 && !busy;
  const streaming = busy && messages[messages.length - 1]?.role === "assistant";

  return (
    <>
      {/* Chat panel */}
      <div
        role="dialog"
        aria-label={`Chat with ${ASSISTANT_NAME}`}
        hidden={!open}
        className="fixed top-20 right-3 bottom-24 left-3 z-[60] flex flex-col sm:top-auto sm:left-auto sm:h-[min(600px,calc(100dvh-8rem))] sm:w-[400px] overflow-hidden rounded-3xl border border-line bg-ink shadow-2xl shadow-black/60"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line bg-gradient-to-r from-[#2a0709] to-ink-2 px-4 py-3.5">
          <Avatar size="h-12 w-12" online />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg leading-tight font-semibold tracking-wide text-white">{ASSISTANT_NAME}</p>
            <p className="text-xs text-zinc-400">Online · replies instantly</p>
          </div>
          <span
            className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-zinc-200 tabular-nums"
            title={`${remaining} of ${MAX_USER_MESSAGES} questions left`}
          >
            {remaining}/{MAX_USER_MESSAGES}
          </span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with a person on WhatsApp"
            title="Chat with a person on WhatsApp"
            className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366]/15 text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-ink"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={listRef} aria-live="polite" className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          {messages.map((m, i) =>
            m.role === "assistant" ? (
              <div key={i} className="flex items-end gap-2.5">
                <Avatar size="h-8 w-8" />
                <div className="max-w-[80%]">
                  <p className="mb-1 text-xs font-medium text-zinc-500">{ASSISTANT_NAME}</p>
                  <div className="rounded-2xl rounded-bl-md bg-ink-3 px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-zinc-100">
                    <RichText text={m.content} />
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-600">{timeFmt(m.time)}</p>
                </div>
              </div>
            ) : (
              <div key={i} className="flex flex-col items-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-white">
                  {m.content}
                </div>
                <p className="mt-1 text-[11px] text-zinc-600">{timeFmt(m.time)}</p>
              </div>
            ),
          )}

          {busy && !streaming && (
            <div className="flex items-end gap-2.5" aria-label={`${ASSISTANT_NAME} is typing`}>
              <Avatar size="h-8 w-8" />
              <div className="flex gap-1 rounded-2xl rounded-bl-md bg-ink-3 px-4 py-3.5">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}

          {showQuickReplies && (
            <div className="flex flex-wrap gap-2 pl-10">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-brand/50 px-3 py-1.5 text-left text-sm text-brand-300 transition-colors hover:bg-brand hover:text-white"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-xl border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-red-200">
              {error} You can also{" "}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline">
                message us on WhatsApp
              </a>
              .
            </p>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-line bg-ink-2 p-3">
          {limitReached ? (
            <div className="space-y-2 text-center text-sm text-zinc-400">
              <p>You&apos;ve reached the chat limit. Our team is happy to help with anything else.</p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 font-semibold text-ink"
              >
                <WhatsAppIcon className="h-4 w-4" /> Message us on WhatsApp
              </a>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2"
            >
              <label htmlFor="chat-input" className="sr-only">
                Type a message
              </label>
              <textarea
                id="chat-input"
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={MAX_MESSAGE_CHARS}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Type a message…"
                className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border border-line bg-ink px-4 py-3 text-[15px] text-white placeholder:text-zinc-500 focus:border-brand-300 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || busy}
                aria-label="Send message"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-white transition-colors hover:bg-brand-600 disabled:bg-ink-3 disabled:text-zinc-500"
              >
                <SendHorizontal className="h-5 w-5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Nudge bubble */}
      {nudge && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-5 bottom-24 z-[60] max-w-60 rounded-2xl rounded-br-md bg-white px-4 py-3 text-left text-sm text-ink shadow-xl"
        >
          <span className="font-semibold">Questions?</span> Ask {ASSISTANT_NAME}, I reply instantly 🏸
        </button>
      )}

      {/* Launcher */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : `Chat with ${ASSISTANT_NAME}`}
        className="fixed right-5 bottom-5 z-[60] grid h-16 w-16 place-items-center rounded-full bg-brand text-white shadow-xl shadow-brand/30 transition-transform hover:scale-105 hover:bg-brand-600"
      >
        {open ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
        {!open && <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-brand bg-emerald-400" aria-hidden="true" />}
      </button>
    </>
  );
}

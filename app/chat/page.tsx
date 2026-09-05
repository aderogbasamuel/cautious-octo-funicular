"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, Copy, Share2, Sparkles } from "lucide-react";
import { timeAgo } from "@/lib/data";
import { usePosts } from "@/lib/usePosts";
import { ChatMessage, Post } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import Link from "next/link";

const SUGGESTIONS = [
  "When is the next fee deadline?",
  "Is there an update on hostel balloting?",
  "Any CPE 301 changes this week?",
];

export default function ChatPage() {
  const { posts: allPosts } = usePosts();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "Hey! I'm TrustBot. Ask me about deadlines, hostel updates, or anything posted to Campus Truth — I'll only answer from verified updates and tell you where they came from.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function ask(question: string) {
    if (!question.trim()) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const { answer, cited } = answerFrom(question, allPosts);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: answer,
          citedPostIds: cited.map((p) => p.id),
        },
      ]);
      setThinking(false);
    }, 700);
  }

  return (
    <main className="flex min-h-screen flex-col pb-4">
      <TopBar title="TrustBot" back />

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 pb-40">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} allPosts={allPosts} />
        ))}
        {thinking && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Bot size={16} className="text-signal" />
            <span className="flex gap-1">
              <Dot delay="0ms" />
              <Dot delay="120ms" />
              <Dot delay="240ms" />
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="fixed inset-x-0 bottom-[64px] mx-auto max-w-md bg-void px-5 pb-3 pt-2">
        {messages.length <= 1 && (
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="flex-shrink-0 rounded-pill border border-line bg-panel px-3 py-2 text-xs text-muted"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex items-center gap-2 rounded-pill border border-line bg-panel px-2 py-2 pl-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something about your school"
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Send"
            className="rounded-full bg-signal p-2.5 text-void disabled:opacity-40"
            disabled={!input.trim()}
          >
            <ArrowUp size={16} />
          </button>
        </form>
      </div>

      <BottomNav />
    </main>
  );
}

function ChatBubble({
  message,
  allPosts,
}: {
  message: ChatMessage;
  allPosts: Post[];
}) {
  const cited = message.citedPostIds
    ?.map((id) => allPosts.find((p) => p.id === id))
    .filter(Boolean) as Post[] | undefined;

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-ink px-4 py-2.5 text-sm text-void">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-signaldim">
        <Sparkles size={14} className="text-signal" />
      </div>
      <div className="max-w-[85%] space-y-2">
        <div className="rounded-2xl rounded-tl-sm border border-line bg-panel px-4 py-2.5 text-sm leading-relaxed text-ink">
          {message.content}
        </div>

        {cited && cited.length > 0 && (
          <div className="space-y-1.5">
            {cited.map((p) => (
              <Link
                key={p.id}
                href={`/feed/${p.id}`}
                className="block rounded-card border border-line bg-raised px-3 py-2 text-xs text-muted hover:border-signal/40"
              >
                <span className="text-ink">{p.title}</span>
                <span className="block text-[11px] text-muted/80">
                  {p.sourceName} · {timeAgo(p.postedAt)}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="flex gap-3 pl-1 text-muted">
          <button
            onClick={() => navigator.clipboard?.writeText(message.content)}
            aria-label="Copy"
            className="hover:text-ink"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() =>
              navigator.share?.({ text: message.content }).catch(() => {})
            }
            aria-label="Share"
            className="hover:text-ink"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
      style={{ animationDelay: delay }}
    />
  );
}

function answerFrom(
  question: string,
  allPosts: Post[]
): { answer: string; cited: Post[] } {
  const q = question.toLowerCase();
  const scored = allPosts
    .map((p) => {
      const haystack = `${p.title} ${p.body} ${p.tags.join(" ")}`.toLowerCase();
      const score = q
        .split(/\s+/)
        .filter((word) => word.length > 3 && haystack.includes(word)).length;
      return { post: p, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      answer:
        "I don't have a verified update on that yet. It might be worth checking with your class rep, or check back once something's confirmed here.",
      cited: [],
    };
  }

  const top = scored.slice(0, 2).map((s) => s.post);
  const primary = top[0];
  const confidenceNote =
    primary.sourceType === "official"
      ? `This is from an official source (${primary.confidence}% confidence).`
      : primary.sourceType === "class-rep"
      ? "This came from a verified class rep, not an official school channel."
      : "This is an unverified student report — treat it as a lead, not confirmed fact.";

  return {
    answer: `${primary.body} ${confidenceNote}`,
    cited: top,
  };
}

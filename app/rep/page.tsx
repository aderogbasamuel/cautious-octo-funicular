"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Send, ShieldCheck, MessageCircleQuestion } from "lucide-react";
import { departments } from "@/lib/data";
import { addSubmittedPost, getSubmittedPosts } from "@/lib/store";
import { useAppSession } from "@/lib/useAppSession";
import { usePosts } from "@/lib/usePosts";
import { isFirebaseConfigured } from "@/lib/firebase";
import { createPost } from "@/lib/firestoreStore";
import { Post } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { PostCard } from "@/components/PostCard";

export default function RepPage() {
  return (
    <Suspense fallback={null}>
      <RepContent />
    </Suspense>
  );
}

function RepContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"rep" | "tip">(
    searchParams.get("tab") === "tip" ? "tip" : "rep"
  );
  const { session, loading } = useAppSession();
  const { posts: allPosts, refresh } = usePosts();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [posted, setPosted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !session) router.replace("/");
  }, [loading, session, router]);

  if (!session) return null;

  const dept = departments.find((d) => d.id === session.departmentId);
  const canPostAsRep = session.isClassRep && mode === "rep";
  const mine = allPosts.filter((p) => p.authorName === session.name);

  async function submit() {
    if (!title.trim() || !body.trim() || !session) return;
    setSubmitting(true);
    const newPost: Omit<Post, "id"> = {
      title: title.trim(),
      body: body.trim(),
      departmentId: canPostAsRep ? session.departmentId : "general",
      sourceType: canPostAsRep ? "class-rep" : "community",
      sourceName: canPostAsRep
        ? `${session.name} — ${session.level} Class Rep`
        : "Anonymous student",
      confidence: 0,
      postedAt: new Date().toISOString(),
      authorName: session.name,
      history: [
        {
          label: canPostAsRep ? "Posted by class rep" : "Submitted by student",
          timestamp: new Date().toISOString(),
          note: canPostAsRep ? undefined : "Awaiting verification",
        },
      ],
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    if (isFirebaseConfigured) {
      await createPost(newPost);
      await refresh();
    } else {
      addSubmittedPost({ ...newPost, id: crypto.randomUUID() });
      await refresh();
    }

    setTitle("");
    setBody("");
    setTags("");
    setSubmitting(false);
    setPosted(true);
    setTimeout(() => setPosted(false), 2000);
  }

  return (
    <main className="pb-28">
      <TopBar title="Post an update" back />

      <div className="px-5 pt-4">
        <div className="flex overflow-hidden rounded-pill border border-line text-sm">
          <button
            onClick={() => setMode("rep")}
            className={`flex-1 py-2.5 text-center ${
              mode === "rep" ? "bg-ink text-void" : "text-muted"
            }`}
          >
            Class rep update
          </button>
          <button
            onClick={() => setMode("tip")}
            className={`flex-1 py-2.5 text-center ${
              mode === "tip" ? "bg-ink text-void" : "text-muted"
            }`}
          >
            Submit a tip
          </button>
        </div>

        {mode === "rep" && !session.isClassRep && (
          <div className="mt-3 flex items-start gap-2 rounded-card border border-flag/30 bg-flagdim px-4 py-3 text-xs text-flag">
            <MessageCircleQuestion size={16} className="mt-0.5 flex-shrink-0" />
            <span>
              Your profile isn't verified as a class rep yet, so this will
              post as an unverified community tip instead. Request
              verification from Profile → Account settings.
            </span>
          </div>
        )}

        {mode === "rep" && session.isClassRep && (
          <div className="mt-3 flex items-center gap-2 rounded-card border border-verify/30 bg-verifydim px-4 py-3 text-xs text-verify">
            <ShieldCheck size={16} />
            Posting as verified class rep for {dept?.name} · {session.level}
          </div>
        )}

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-muted">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                mode === "rep"
                  ? "e.g. CPE 301 test moved to Friday"
                  : "e.g. Heard library hours are extending"
              }
              className="mt-1.5 w-full rounded-card border border-line bg-panel px-4 py-3 text-ink placeholder:text-muted/60 focus:border-signal"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted">Details</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Give students what they need to act on this — dates, venue, what changed."
              className="mt-1.5 w-full resize-none rounded-card border border-line bg-panel px-4 py-3 text-ink placeholder:text-muted/60 focus:border-signal"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted">
              Tags (comma separated)
            </span>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="CPE301, test"
              className="mt-1.5 w-full rounded-card border border-line bg-panel px-4 py-3 text-ink placeholder:text-muted/60 focus:border-signal"
            />
          </label>

          <button
            onClick={submit}
            disabled={!title.trim() || !body.trim() || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-pill bg-ink py-4 text-sm font-semibold text-void disabled:opacity-40"
          >
            <Send size={16} />
            {submitting
              ? "Posting…"
              : mode === "rep" && session.isClassRep
              ? "Post to department feed"
              : "Submit for verification"}
          </button>

          {posted && (
            <p className="text-center text-xs text-verify">
              Posted. It now shows up in the feed.
            </p>
          )}
        </div>
      </div>

      {mine.length > 0 && (
        <section className="mt-8 px-5">
          <h2 className="font-display text-lg text-ink">Your submissions</h2>
          <div className="mt-3 space-y-3">
            {mine.map((p) => (
              <PostCard key={p.id} post={p} dense />
            ))}
          </div>
        </section>
      )}

      <BottomNav />
    </main>
  );
}

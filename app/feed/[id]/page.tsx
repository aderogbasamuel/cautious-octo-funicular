"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Share2, Bookmark, ChevronDown, ChevronUp } from "lucide-react";
import { timeAgo } from "@/lib/data";
import { usePosts } from "@/lib/usePosts";
import { getSavedPostIds, toggleSavedPost } from "@/lib/store";
import { SourceBadge } from "@/components/SourceBadge";
import { PostCard } from "@/components/PostCard";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export default function ArticlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [showHistory, setShowHistory] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const { posts: allPosts } = usePosts();

  const post = allPosts.find((p) => p.id === params.id);

  useEffect(() => {
    if (post) setSaved(getSavedPostIds().includes(post.id));
  }, [post]);

  if (!post) {
    return (
      <main className="px-5 py-10">
        <p className="text-muted">This update couldn't be found.</p>
        <button
          onClick={() => router.push("/feed")}
          className="mt-4 text-signal underline"
        >
          Back to feed
        </button>
      </main>
    );
  }

  const related = allPosts
    .filter((p) => p.id !== post.id && p.departmentId === post.departmentId)
    .slice(0, 4);

  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: post!.title, text: post!.body }).catch(() => {});
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <main className="pb-28">
      <TopBar
        title="Update"
        back
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              aria-label="Share"
              className="rounded-full p-2 text-ink hover:bg-raised"
            >
              <Share2 size={19} />
            </button>
            <button
              onClick={() => setSaved(toggleSavedPost(post.id).includes(post.id))}
              aria-label="Save"
              className="rounded-full p-2 text-ink hover:bg-raised"
            >
              <Bookmark
                size={19}
                fill={saved ? "#E7B44E" : "none"}
                className={saved ? "text-verify" : "text-ink"}
              />
            </button>
          </div>
        }
      />

      {copied && (
        <div className="mx-5 mt-3 rounded-card bg-raised px-4 py-2 text-xs text-muted">
          Link copied to clipboard
        </div>
      )}

      <article className="px-5 pt-5">
        <SourceBadge type={post.sourceType} confidence={post.confidence} />

        <h1 className="mt-3 font-display text-2xl leading-snug text-ink">
          {post.title}
        </h1>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted">
          <span>{post.sourceName}</span>
          <span aria-hidden>·</span>
          <span>{timeAgo(post.postedAt)}</span>
        </div>

        <p className="mt-5 text-[15px] leading-relaxed text-ink/90">
          {post.body}
        </p>

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-pill border border-line px-2.5 py-1 text-xs text-muted"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowHistory((s) => !s)}
          className="mt-6 flex w-full items-center justify-between rounded-card border border-line bg-panel px-4 py-3.5"
        >
          <span className="text-sm text-ink">View source history</span>
          {showHistory ? (
            <ChevronUp size={18} className="text-muted" />
          ) : (
            <ChevronDown size={18} className="text-muted" />
          )}
        </button>

        {showHistory && (
          <ol className="mt-3 space-y-3 border-l border-line pl-4">
            {post.history.map((h, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-signal" />
                <div className="text-sm text-ink">{h.label}</div>
                {h.note && <div className="text-xs text-muted">{h.note}</div>}
                <div className="text-xs text-muted/70">{timeAgo(h.timestamp)}</div>
              </li>
            ))}
          </ol>
        )}
      </article>

      {related.length > 0 && (
        <section className="mt-8 px-5">
          <h2 className="font-display text-lg text-ink">Related updates</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {related.map((p) => (
              <div key={p.id} className="w-56 flex-shrink-0">
                <PostCard post={p} dense />
              </div>
            ))}
          </div>
        </section>
      )}

      <BottomNav />
    </main>
  );
}

import Link from "next/link";
import { Post } from "@/lib/types";
import { timeAgo } from "@/lib/data";
import { SourceBadge } from "./SourceBadge";

export function PostCard({ post, dense = false }: { post: Post; dense?: boolean }) {
  return (
    <Link
      href={`/feed/${post.id}`}
      className="block rounded-card border border-line bg-panel p-4 transition-colors hover:border-signal/40 focus-visible:border-signal/60"
    >
      <div className="flex items-center justify-between gap-2">
        <SourceBadge type={post.sourceType} confidence={post.confidence} />
        <span className="text-xs text-muted">{timeAgo(post.postedAt)}</span>
      </div>
      <h3
        className={`mt-3 font-display text-ink ${
          dense ? "text-base leading-snug" : "text-lg leading-snug"
        }`}
      >
        {post.title}
      </h3>
      {!dense && (
        <p className="mt-2 line-clamp-2 text-sm text-muted">{post.body}</p>
      )}
      <div className="mt-3 text-xs text-muted">{post.sourceName}</div>
    </Link>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Sparkles,
  ArrowUpRight,
  FileWarning,
  Users2,
  BellRing,
} from "lucide-react";
import Link from "next/link";
import { departments } from "@/lib/data";
import { useAppSession } from "@/lib/useAppSession";
import { usePosts } from "@/lib/usePosts";
import { PostCard } from "@/components/PostCard";
import { BottomNav } from "@/components/BottomNav";

export default function FeedPage() {
  return (
    <Suspense fallback={null}>
      <FeedContent />
    </Suspense>
  );
}

function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deptOverride = searchParams.get("dept");
  const { session, loading } = useAppSession();
  const { posts: allPosts } = usePosts();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"mine" | "all">("mine");

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/");
    }
  }, [loading, session, router]);

  if (!session) return null;

  const activeDeptId = deptOverride ?? session.departmentId;
  const dept = departments.find((d) => d.id === activeDeptId);

  const scoped = allPosts.filter((p) => {
    if (deptOverride) {
      return p.departmentId === "general" || p.departmentId === deptOverride;
    }
    if (scope === "all") return true;
    return p.departmentId === "general" || p.departmentId === session.departmentId;
  });

  const filtered = scoped.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  const trending = [...allPosts]
    .filter((p) => p.sourceType === "official")
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  return (
    <main className="pb-28">
      <header className="px-5 pb-2 pt-8">
        <p className="text-sm text-muted">Hey, {session.name.split(" ")[0] || "there"} 👋</p>
        <h1 className="font-display text-2xl italic text-ink">
          {dept?.name ?? "Campus Truth"}
        </h1>
      </header>

      <div className="px-5">
        <div className="flex items-center gap-2 rounded-card border border-line bg-panel px-4 py-3">
          <Search size={18} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search updates, courses, tags"
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
      </div>

      <Link
        href="/chat"
        className="mx-5 mt-3 flex items-center justify-between rounded-card border border-signal/30 bg-signaldim px-4 py-3.5"
      >
        <div className="flex items-center gap-2.5">
          <Sparkles size={18} className="text-signal" />
          <span className="text-sm text-ink">
            Ask TrustBot anything about school
          </span>
        </div>
        <ArrowUpRight size={16} className="text-signal" />
      </Link>

      {trending.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center justify-between px-5">
            <h2 className="font-display text-lg text-ink">Trending now</h2>
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-none">
            {trending.map((p) => (
              <div key={p.id} className="w-64 flex-shrink-0">
                <PostCard post={p} dense />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 px-5">
        <h2 className="font-display text-lg text-ink">Quick links</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <QuickLink
            href="/rep"
            icon={<Users2 size={18} className="text-verify" />}
            label="Post an update"
          />
          <QuickLink
            href="/departments"
            icon={<BellRing size={18} className="text-signal" />}
            label="Browse departments"
          />
          <QuickLink
            href="/rep?tab=tip"
            icon={<FileWarning size={18} className="text-flag" />}
            label="Submit a tip"
          />
          <QuickLink
            href="/profile?tab=sources"
            icon={<Sparkles size={18} className="text-muted" />}
            label="Data sources used"
          />
        </div>
      </section>

      <section className="mt-7 px-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">
            {deptOverride ? `${dept?.name} feed` : "Your feed"}
          </h2>
          {deptOverride ? (
            <button
              onClick={() => router.push("/feed")}
              className="rounded-pill border border-line px-3 py-1.5 text-xs text-muted"
            >
              Back to mine
            </button>
          ) : (
            <div className="flex overflow-hidden rounded-pill border border-line text-xs">
              <button
                onClick={() => setScope("mine")}
                className={`px-3 py-1.5 ${
                  scope === "mine" ? "bg-ink text-void" : "text-muted"
                }`}
              >
                {dept?.name.split(" ")[0] ?? "Mine"}
              </button>
              <button
                onClick={() => setScope("all")}
                className={`px-3 py-1.5 ${
                  scope === "all" ? "bg-ink text-void" : "text-muted"
                }`}
              >
                All UNILAG
              </button>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-3">
          {filtered.length === 0 && (
            <p className="rounded-card border border-line bg-panel px-4 py-6 text-center text-sm text-muted">
              Nothing here yet. Try "All UNILAG" or check back later.
            </p>
          )}
          {filtered.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-card border border-line bg-panel px-4 py-4"
    >
      {icon}
      <span className="text-sm text-ink">{label}</span>
    </Link>
  );
}

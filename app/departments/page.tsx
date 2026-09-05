"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { departments } from "@/lib/data";
import { usePosts } from "@/lib/usePosts";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export default function DepartmentsPage() {
  const { posts: allPosts } = usePosts();

  const grouped = departments.reduce<Record<string, typeof departments>>(
    (acc, d) => {
      acc[d.faculty] = acc[d.faculty] ? [...acc[d.faculty], d] : [d];
      return acc;
    },
    {}
  );

  return (
    <main className="pb-28">
      <TopBar title="Departments" back />

      <div className="px-5 py-4">
        <p className="text-sm text-muted">
          Follow any department's feed — not just your own. Useful for
          checking a friend's fee deadline or a shared elective.
        </p>
      </div>

      <div className="space-y-6 px-5">
        {Object.entries(grouped).map(([faculty, list]) => (
          <section key={faculty}>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              {faculty}
            </h2>
            <div className="space-y-2">
              {list
                .filter((d) => d.id !== "gen")
                .map((d) => {
                  const count = allPosts.filter(
                    (p) => p.departmentId === d.id
                  ).length;
                  return (
                    <Link
                      key={d.id}
                      href={`/feed?dept=${d.id}`}
                      className="flex items-center justify-between rounded-card border border-line bg-panel px-4 py-3.5"
                    >
                      <div>
                        <div className="text-sm text-ink">{d.name}</div>
                        <div className="text-xs text-muted">
                          {count} update{count === 1 ? "" : "s"}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted" />
                    </Link>
                  );
                })}
            </div>
          </section>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}

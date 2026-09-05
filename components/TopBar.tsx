"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";

export function TopBar({
  title,
  back = false,
  right,
}: {
  title: string;
  back?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-void/90 px-5 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        {back && (
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="-ml-1 rounded-full p-1.5 text-ink hover:bg-raised"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <h1 className="font-display text-lg text-ink">{title}</h1>
      </div>
      {right}
    </header>
  );
}

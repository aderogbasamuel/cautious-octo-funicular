"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Newspaper, Bot, Bookmark, UserRound } from "lucide-react";

const items = [
  { href: "/feed", label: "Home", icon: House },
  { href: "/departments", label: "Departments", icon: Newspaper },
  { href: "/chat", label: "TrustBot", icon: Bot },
  { href: "/profile?tab=saved", label: "Saved", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-void/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-6 py-2.5">
        {items.map(({ href, label, icon: Icon }) => {
          const base = href.split("?")[0];
          const active = pathname === base;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-2 py-1 text-[10px]"
              aria-current={active ? "page" : undefined}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.8}
                className={active ? "text-signal" : "text-muted"}
              />
              <span className={active ? "text-signal" : "text-muted"}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

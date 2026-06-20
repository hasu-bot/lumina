"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: { href: string; label: string; match: (p: string) => boolean }[] = [
  { href: "/", label: "参加者一覧", match: (p) => p === "/" || p.startsWith("/models") },
  { href: "/m/login", label: "モデル", match: (p) => p.startsWith("/m") },
  { href: "/admin/login", label: "運営", match: (p) => p.startsWith("/admin") },
];

export function HeaderNav() {
  const pathname = usePathname();
  return (
    <nav className="header-nav">
      {LINKS.map((l) => {
        const active = l.match(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={active ? "is-active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

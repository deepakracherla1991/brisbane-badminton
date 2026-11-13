"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/portal/auth-actions";

export function PortalNav({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const links = [
    { href: "/portal", label: "My classes" },
    { href: "/portal/classes", label: "Enrol" },
    { href: "/portal/students", label: "Students" },
    { href: "/portal/account", label: "Account" },
    ...(isAdmin ? [{ href: "/portal/admin", label: "Admin" }] : []),
  ];
  const active = (href: string) => (href === "/portal" ? pathname === "/portal" : pathname.startsWith(href));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label="Portal" className="-mx-1 flex gap-1 overflow-x-auto pb-1 sm:pb-0">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active(l.href) ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 font-display text-sm uppercase tracking-wider transition-colors ${
              active(l.href) ? "bg-brand text-white" : "text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3 text-sm text-zinc-400">
        <span className="truncate">Signed in as {name}</span>
        <form action={signOut}>
          <button type="submit" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-zinc-300 hover:border-white/40 hover:text-white">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

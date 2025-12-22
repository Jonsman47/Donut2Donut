"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/market", label: "Market" },
  { href: "/market/orders", label: "Orders" },
  { href: "/market/sales", label: "Sales" },
  { href: "/market/messages", label: "Messages" },
  { href: "/rules", label: "Rules" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [counts, setCounts] = useState<{
    unreadMessages: number;
    pendingSales: number;
    activeOrders: number;
  } | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    async function loadCounts() {
      try {
        const res = await fetch("/api/unread-counts");
        if (!res.ok) return;
        const data = await res.json();
        if (active) setCounts(data);
      } catch (e) {
        console.error(e);
      }
    }
    loadCounts();
    return () => {
      active = false;
    };
  }, [status]);

  return (
    <header className="site-header">
      <div className="container site-nav">
        <Link href="/" className="stack-4" style={{ minWidth: 160 }}>
          <span style={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
            Donut2Donut
          </span>
          <span className="muted" style={{ fontSize: "0.75rem" }}>
            Secure DonutSMP Marketplace
          </span>
        </Link>

        <nav className="nav-links">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const badge =
              link.href === "/market/messages"
                ? counts?.unreadMessages
                : link.href === "/market/sales"
                ? counts?.pendingSales
                : link.href === "/market/orders"
                ? counts?.activeOrders
                : 0;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${isActive ? " active" : ""}`}
              >
                <span>{link.label}</span>
                {!!badge && badge > 0 && (
                  <span className="badge badge-warn" style={{ marginLeft: 6 }}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="badge badge-blue" style={{ display: "none" }}>
            Escrow on
          </span>

          <ThemeToggle />

          {status === "loading" && (
            <button className="btn btn-ghost" type="button" disabled>
              Loading...
            </button>
          )}

          {status === "unauthenticated" && (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => signIn(undefined, { callbackUrl: "/" })}
            >
              Sign in
            </button>
          )}

          {status === "authenticated" && (
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out {session?.user?.name ?? session?.user?.email}
            </button>
          )}

          <Link className="btn btn-primary" href="/market">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

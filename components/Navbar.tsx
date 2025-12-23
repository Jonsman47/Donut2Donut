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
  { href: "/rules", label: "Rules" },
];

const UNREAD_POLL_INTERVAL = 5000;

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [counts, setCounts] = useState<{
    pendingSales: number;
    activeOrders: number;
    balanceCents: number;
  } | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setCounts(null);
      return;
    }

    let active = true;
    async function loadCounts() {
      try {
        const res = await fetch(`/api/unread-counts?t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (active) setCounts(data);
      } catch (e) {
        console.error(e);
      }
    }

    loadCounts();
    const interval = setInterval(loadCounts, UNREAD_POLL_INTERVAL);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [status]);

  return (
    <header className="site-header" style={{ animation: 'fadeDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
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
              link.href === "/market/sales"
                ? counts?.pendingSales
                : link.href === "/market/orders"
                  ? counts?.activeOrders
                  : 0;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${isActive ? " active" : ""}`}
                style={{ display: "inline-flex", alignItems: "center" }}
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
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="btn btn-ghost" style={{ cursor: "default", display: "flex", alignItems: "center", gap: 8, pointerEvents: "none" }}>
                <span style={{ fontWeight: 600, color: "var(--primary)" }}>
                  {(counts?.balanceCents ?? 0) / 100} €
                </span>
                <span className="muted" style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Balance</span>
              </div>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </button>
            </div>
          )}

          <Link className="btn btn-primary" href="/market">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

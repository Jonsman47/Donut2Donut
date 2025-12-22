"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/market", label: "Market" },
  { href: "/orders", label: "Orders" },
  { href: "/rules", label: "Rules" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

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
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${isActive ? " active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="badge badge-blue" style={{ display: "none" }}>
            Escrow on
          </span>

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

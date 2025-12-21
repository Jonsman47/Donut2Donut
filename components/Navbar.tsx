"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        background: scrolled ? "rgba(10,16,36,0.78)" : "rgba(10,16,36,0.58)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.18)"
          : "1px solid rgba(255,255,255,0.10)",
        transition: "background .18s ease, border-color .18s ease",
      }}
    >
      <div
        className="container"
        style={{
          height: scrolled ? 56 : 62,
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* LEFT */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            minWidth: 260,
          }}
        >
          <span style={{ fontWeight: 950, letterSpacing: "-0.02em" }}>
            Donut2Donut
          </span>

          {/* subtitle ONLY on wide screens (prevents 2-line navbar) */}
          <span
            className="muted"
            style={{
              fontSize: ".78rem",
              display: "none",
            }}
          >
            Secure DonutSMP Marketplace
          </span>

          <style jsx>{`
            @media (min-width: 980px) {
              span.muted {
                display: inline;
              }
            }
          `}</style>
        </Link>

        {/* CENTER (true centered) */}
        <nav
          className="glass border-grad"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 8px",
            borderRadius: 999,
          }}
        >
          <Link
            href="/"
            className="badge"
            style={{ height: 32, display: "inline-flex", alignItems: "center" }}
          >
            Home
          </Link>
          <Link
            href="/market"
            className="badge badge-blue"
            style={{ height: 32, display: "inline-flex", alignItems: "center" }}
          >
            Market
          </Link>
          <span
            className="badge"
            style={{ height: 32, display: "inline-flex", alignItems: "center" }}
          >
            Docs
          </span>
        </nav>

        {/* RIGHT */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <a
          href="/login"
          className="btn btn-ghost"
          style={{ height: 32 }}
        >
          Login
        </a>

          <span
            className="badge badge-good ring-glow"
            style={{ height: 32, display: "inline-flex", alignItems: "center" }}
          >
            Escrow ON
          </span>

          {/* hide this on small screens so it doesn’t push layout */}
          <span
            className="muted"
            style={{
              fontSize: ".78rem",
              display: "none",
              whiteSpace: "nowrap",
            }}
          >
            Proof • Disputes • Logs
          </span>

          <style jsx>{`
            @media (min-width: 980px) {
              span.muted {
                display: inline;
              }
            }
          `}</style>
        </div>
      </div>
    </header>
  );
}

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
  { href: "/wheel", label: "Wheel" },
  { href: "/wallet", label: "Wallet" },
  { href: "/reviews", label: "Reviews" },
  { href: "/rules", label: "Rules" },
];

const UNREAD_POLL_INTERVAL = 5000;
const NOTIFICATIONS_PREVIEW_LIMIT = 6;

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [counts, setCounts] = useState<{
    pendingSales: number;
    activeOrders: number;
    balanceCents: number;
    unreadNotifications: number;
  } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

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

  useEffect(() => {
    if (!showNotifications || status !== "authenticated") return;
    let active = true;
    async function loadNotifications() {
      try {
        const res = await fetch(
          `/api/notifications?page=1&pageSize=${NOTIFICATIONS_PREVIEW_LIMIT}&t=${Date.now()}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (active) setNotifications(data.notifications || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadNotifications();
    return () => {
      active = false;
    };
  }, [showNotifications, status]);

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
              <div style={{ position: "relative" }}>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setShowNotifications((prev) => !prev)}
                  aria-label="Notifications"
                >
                  🔔
                  {!!counts?.unreadNotifications && counts.unreadNotifications > 0 && (
                    <span className="badge badge-warn" style={{ marginLeft: 6 }}>
                      {counts.unreadNotifications}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div
                    className="surface"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      minWidth: 280,
                      zIndex: 50,
                      padding: 12,
                      borderRadius: 14,
                      boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                    }}
                  >
                    <div className="stack-6">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong>Notifications</strong>
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={async () => {
                            await fetch("/api/notifications/mark-all", { method: "POST" });
                            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                            setCounts((prev) => (prev ? { ...prev, unreadNotifications: 0 } : prev));
                          }}
                        >
                          Mark all read
                        </button>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="muted">No notifications yet.</div>
                      ) : (
                        notifications.map((notification) => (
                          <Link
                            key={notification.id}
                            href={notification.linkUrl || "/notifications"}
                            className="card"
                            style={{
                              padding: 10,
                              borderRadius: 12,
                              background: notification.isRead ? "var(--card)" : "rgba(120,170,255,0.14)",
                              textDecoration: "none",
                            }}
                            onClick={async () => {
                              if (!notification.isRead) {
                                await fetch(`/api/notifications/${notification.id}/read`, { method: "POST" });
                                setCounts((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        unreadNotifications: Math.max(prev.unreadNotifications - 1, 0),
                                      }
                                    : prev
                                );
                              }
                              setShowNotifications(false);
                            }}
                          >
                            <div style={{ fontWeight: 600 }}>{notification.title}</div>
                            <div className="muted" style={{ fontSize: "0.75rem" }}>
                              {notification.body}
                            </div>
                          </Link>
                        ))
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Link className="btn btn-secondary" href="/notifications">
                          View all
                        </Link>
                        <button className="btn btn-ghost" type="button" onClick={() => setShowNotifications(false)}>
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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

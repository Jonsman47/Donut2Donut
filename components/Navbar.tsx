"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

interface NavItemBase {
  label: string;
  show?: boolean;
  badge?: number;
}

interface NavItemWithHref extends NavItemBase {
  href: string;
  action?: never;
}

interface NavItemWithAction extends NavItemBase {
  href?: never;
  action: () => void;
}

type NavItem = NavItemWithHref | NavItemWithAction;

interface NavSection {
  key: string;
  label: string;
  href?: string;
  isActive: boolean;
  items?: NavItem[];
  noDropdown?: boolean;
}

const UNREAD_POLL_INTERVAL = 5000;
const NOTIFICATIONS_PREVIEW_LIMIT = 6;
const NAV_OPEN_DELAY = 75;
const NAV_CLOSE_DELAY = 150;

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
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<{ setupComplete: boolean } | null>(null);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const username = useMemo(() => {
    const user = session?.user as any;
    return user?.username ?? user?.name ?? null;
  }, [session]);

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

  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (status !== "authenticated") {
      setVerifyStatus(null);
      return;
    }
    let active = true;
    async function loadVerifyStatus() {
      try {
        const res = await fetch("/api/verify/status");
        if (!res.ok) return;
        const data = await res.json();
        if (active) setVerifyStatus({ setupComplete: Boolean(data.setupComplete) });
      } catch (e) {
        console.error(e);
      }
    }
    loadVerifyStatus();
    return () => {
      active = false;
    };
  }, [status]);

  const showGetStarted = status === "authenticated" && verifyStatus && !verifyStatus.setupComplete;

  const clearOpenTimeout = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
  };

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleOpenMenu = (menuKey: string) => {
    if (['home', 'market'].includes(menuKey)) return; // Ne rien faire pour Home et Market
    clearCloseTimeout();
    clearOpenTimeout();
    openTimeoutRef.current = setTimeout(() => {
      setOpenMenu(menuKey);
    }, NAV_OPEN_DELAY);
  };

  const scheduleCloseMenu = () => {
    if (['home', 'market'].includes(openMenu || '')) return; // Ne rien faire pour Home et Market
    clearOpenTimeout();
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, NAV_CLOSE_DELAY);
  };

  const navSections: NavSection[] = [
    {
      key: "home",
      label: "Home",
      href: "/",
      isActive: pathname === "/",
      noDropdown: true
    },
    {
      key: "market",
      label: "Market",
      href: "/market",
      isActive: pathname.startsWith("/market"),
      noDropdown: true
    },
    {
      key: "wallet",
      label: "Wallet",
      isActive: pathname.startsWith("/wallet"),
      items: [
        { label: "Balance overview", href: "/wallet" },
        { label: "Transactions", href: "/wallet#transactions" },
      ],
    },
    {
      key: "account",
      label: "Account",
      isActive: pathname.startsWith("/dashboard/settings") || pathname.startsWith("/profile"),
      items: [
        { label: "Profile", href: username ? `/profile/${username}` : "/dashboard", show: status === "authenticated" },
        { label: "Settings", href: "/dashboard/settings", show: status === "authenticated" },
        { label: "Sign out", action: () => signOut({ callbackUrl: "/" }), show: status === "authenticated" },
      ],
    },
  ];

  return (
    <>
      <style jsx>{`
        .nav-item.no-dropdown .nav-trigger.no-dropdown {
          cursor: pointer;
          background: transparent;
          border: none;
          font-size: inherit;
          color: inherit;
          padding: 0;
          text-decoration: none;
        }
        .nav-item.no-dropdown .nav-trigger.no-dropdown:hover {
          background: transparent !important;
          transform: none !important;
        }
        .nav-item.no-dropdown::after {
          display: none !important;
        }
      `}</style>
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
          {navSections.map((section) => {
            const visibleItems = section.items ? section.items.filter((item) => item.show !== false) : [];
            return (
              <div
                key={section.key}
                className={`nav-item${section.isActive ? " active" : ""}${!section.noDropdown && openMenu === section.key ? " open" : ""}${section.noDropdown ? " no-dropdown" : ""}`}
                onMouseEnter={section.noDropdown ? undefined : () => scheduleOpenMenu(section.key)}
                onMouseLeave={section.noDropdown ? undefined : scheduleCloseMenu}
              >
                {section.noDropdown ? (
                  <Link href={section.href || "#"} className="nav-trigger no-dropdown">
                    {section.label}
                  </Link>
                ) : (
                  <>
                    <button
                      className="nav-trigger"
                      type="button"
                      onClick={() => {
                        clearOpenTimeout();
                        clearCloseTimeout();
                        setOpenMenu((prev) => (prev === section.key ? null : section.key));
                      }}
                    >
                      {section.label}
                    </button>
                    {visibleItems.length > 0 && (
                      <div className="nav-dropdown">
                        {visibleItems.map((item) =>
                          item.href ? (
                            <Link
                              key={`${section.key}-${item.label}`}
                              href={item.href}
                              className="nav-dropdown-item"
                              onClick={() => setOpenMenu(null)}
                            >
                              <span>{item.label}</span>
                              {!!item.badge && item.badge > 0 && (
                                <span className="badge badge-warn" style={{ marginLeft: 6 }}>
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          ) : (
                            <button
                              key={`${section.key}-${item.label}`}
                              className="nav-dropdown-item"
                              type="button"
                              onClick={() => {
                                setOpenMenu(null);
                                item.action?.();
                              }}
                            >
                              {item.label}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
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
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  );
}

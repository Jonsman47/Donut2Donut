"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Orders", value: "order" },
  { label: "Messages", value: "message" },
  { label: "Reviews", value: "review" },
  { label: "System", value: "system" },
  { label: "Listings", value: "listing" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  async function loadNotifications(reset = false, nextPage?: number) {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      const pageValue = reset ? 1 : nextPage ?? page;
      query.set("page", String(pageValue));
      query.set("pageSize", "10");
      if (filter === "unread") query.set("unread", "1");
      if (filter !== "all" && filter !== "unread") query.set("type", filter);

      const res = await fetch(`/api/notifications?${query.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      setTotal(data.total ?? 0);
      if (reset) {
        setNotifications(data.notifications || []);
        setPage(1);
      } else {
        setNotifications((prev) => [...prev, ...(data.notifications || [])]);
        setPage(pageValue);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const canLoadMore = notifications.length < total;

  return (
    <div className="container section">
      <div className="stack-12">
        <div className="stack-6">
          <h1 className="h2" style={{ margin: 0 }}>
            Notifications
          </h1>
          <div className="muted">Stay on top of orders, messages, and system updates.</div>
        </div>

        <div className="surface" style={{ padding: 16, borderRadius: 16 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FILTERS.map((item) => (
              <button
                key={item.value}
                className={filter === item.value ? "btn btn-primary" : "btn btn-ghost"}
                type="button"
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
            <button
              className="btn btn-secondary"
              type="button"
              onClick={async () => {
                await fetch("/api/notifications/mark-all", { method: "POST" });
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
              }}
            >
              Mark all read
            </button>
          </div>
        </div>

        <div className="stack-10">
          {notifications.length === 0 && !loading && (
            <div className="surface" style={{ padding: 20, borderRadius: 16 }}>
              <div className="muted">No notifications to show.</div>
            </div>
          )}
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.linkUrl || "/notifications"}
              className="surface"
              style={{
                padding: 16,
                borderRadius: 16,
                textDecoration: "none",
                border: notification.isRead ? "1px solid transparent" : "1px solid rgba(120,170,255,0.4)",
              }}
              onClick={async () => {
                if (!notification.isRead) {
                  await fetch(`/api/notifications/${notification.id}/read`, { method: "POST" });
                  setNotifications((prev) =>
                    prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
                  );
                }
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div className="stack-4">
                  <strong>{notification.title}</strong>
                  <div className="muted">{notification.body}</div>
                </div>
                <span className="badge badge-blue" style={{ alignSelf: "flex-start" }}>
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {canLoadMore && (
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              const next = page + 1;
              loadNotifications(false, next);
            }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type Counts = {
  users: number;
  listings: number;
  orders: number;
  conversations: number;
  messages: number;
  reviews: number;
};

export default function DevToolsPanel() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function loadCounts() {
    const res = await fetch("/api/admin/stats");
    if (!res.ok) return;
    const data = await res.json();
    setCounts(data);
  }

  useEffect(() => {
    loadCounts();
  }, []);

  async function handleSeed() {
    setStatus(null);
    const res = await fetch("/api/admin/seed", { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus((data as any).error || "Failed to seed demo data.");
      return;
    }
    setStatus("Seeded demo listings/users/orders.");
    loadCounts();
  }

  return (
    <div className="stack-12">
      <div className="surface" style={{ padding: 18 }}>
        <div className="stack-6">
          <strong>Database counts</strong>
          {counts ? (
            <div className="grid-3">
              <Stat label="Users" value={counts.users} />
              <Stat label="Listings" value={counts.listings} />
              <Stat label="Orders" value={counts.orders} />
              <Stat label="Conversations" value={counts.conversations} />
              <Stat label="Messages" value={counts.messages} />
              <Stat label="Reviews" value={counts.reviews} />
            </div>
          ) : (
            <div className="muted">Loading counts…</div>
          )}
        </div>
      </div>

      <div className="surface" style={{ padding: 18 }}>
        <div className="stack-6">
          <strong>Seed demo data</strong>
          <p className="muted">Create demo users, listings, orders, and a sample message.</p>
          <button className="btn btn-primary" type="button" onClick={handleSeed}>
            Seed demo data
          </button>
          {status && <div className="muted">{status}</div>}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface" style={{ padding: 12 }}>
      <div className="stack-4">
        <span className="muted" style={{ fontSize: "0.75rem" }}>
          {label}
        </span>
        <span style={{ fontWeight: 600 }}>{value}</span>
      </div>
    </div>
  );
}

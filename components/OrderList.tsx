"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate, getStatusTone } from "@/lib/order-utils";

export type OrderListRole = "buyer" | "seller";

type OrderListItem = {
  id: string;
  status: string;
  createdAt: string;
  quantity: number;
  totalCents: number;
  buyer: { username: string; image?: string | null };
  seller: { username: string; image?: string | null };
  listing: {
    title: string;
    images: { url: string }[];
  };
  unreadMessages: number;
  conversationId: string | null;
};

export default function OrderList({ role }: { role: OrderListRole }) {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`/api/orders?role=${role}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as any).error || "Failed to load orders");
        }
        const data = await res.json();
        if (active) setOrders(data.orders ?? []);
      } catch (err: any) {
        if (active) setError(err.message || "Failed to load orders");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [role]);

  if (loading) return <div className="muted">Loading orders…</div>;
  if (error) return <div className="badge badge-warn">{error}</div>;

  if (!orders.length) {
    return (
      <div className="surface" style={{ padding: 18 }}>
        <div className="stack-4">
          <span className="kicker">No orders</span>
          <p className="p">
            {role === "buyer"
              ? "You have not placed any orders yet."
              : "No sales have been placed on your listings yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-2" style={{ gap: 18 }}>
      {orders.map((order) => {
        const otherParty = role === "buyer" ? order.seller : order.buyer;
        const imageUrl = order.listing.images?.[0]?.url;
        return (
          <Link
            key={order.id}
            href={`/market/orders/${order.id}`}
            className="surface stack-10"
            style={{ padding: 18 }}
          >
            <div style={{ display: "flex", gap: 14 }}>
              <img
                src={imageUrl ?? "/donut-hero.png"}
                alt={order.listing.title}
                style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover" }}
              />
              <div className="stack-4" style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong>{order.listing.title}</strong>
                  <span className={getStatusTone(order.status)}>{order.status}</span>
                </div>
                <div className="muted" style={{ fontSize: "0.9rem" }}>
                  {formatCurrency(order.totalCents)} • Qty {order.quantity}
                </div>
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  {role === "buyer" ? "Seller" : "Buyer"}: {otherParty.username}
                </div>
                <div className="muted" style={{ fontSize: "0.8rem" }}>
                  {formatDate(order.createdAt)}
                </div>
                {order.unreadMessages > 0 && (
                  <span className="badge badge-warn" style={{ width: "fit-content" }}>
                    {order.unreadMessages} unread message
                    {order.unreadMessages > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatCurrency, formatDate, getNextActionBanner, getStatusTone } from "@/lib/order-utils";

const ACTION_LABELS: Record<string, string> = {
  ACCEPT: "Accept",
  DECLINE: "Decline",
  SHIP: "Mark as shipped",
  DELIVER: "Mark delivered",
  CANCEL: "Cancel order",
  COMPLETE: "Confirm received",
  DISPUTE: "Open dispute",
};

const MIN_REVIEW_LENGTH = 10;
const MAX_REVIEW_LENGTH = 500;

type OrderDetail = {
  id: string;
  status: string;
  createdAt: string;
  quantity: number;
  totalCents: number;
  safeTradeCode: string;
  listing: {
    id: string;
    title: string;
    deliveryType: string;
    images: { url: string }[];
  };
  buyer: { id: string; username: string };
  seller: { id: string; username: string };
  review?: { id: string } | null;
};

export default function OrderDetails({ orderId }: { orderId: string }) {
  const { data: session } = useSession();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState("");
  const [reviewState, setReviewState] = useState<string | null>(null);

  const role = useMemo(() => {
    if (!order || !session?.user?.id) return null;
    if (order.buyer.id === session.user.id) return "buyer";
    if (order.seller.id === session.user.id) return "seller";
    return null;
  }, [order, session?.user?.id]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as any).error || "Failed to load order");
        }
        const data = await res.json();
        if (!active) return;
        setOrder(data.order);
        setConversationId(data.conversationId ?? null);
      } catch (err: any) {
        if (active) setError(err.message || "Failed to load order");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [orderId]);

  const actions = useMemo(() => {
    if (!order || !role) return [] as string[];
    const status = order.status;
    const deliveryType = order.listing.deliveryType;

    if (role === "seller") {
      if (status === "PENDING") return ["ACCEPT", "DECLINE", "CANCEL"];
      if (status === "ACCEPTED" || status === "PAID") {
        return deliveryType === "SERVICE" ? ["DELIVER", "CANCEL"] : ["SHIP", "CANCEL"];
      }
    }

    if (role === "buyer") {
      if (status === "PENDING") return ["CANCEL"];
      if (status === "SHIPPED" || status === "DELIVERED") return ["COMPLETE", "DISPUTE"];
      if (status === "ACCEPTED" || status === "PAID") return ["DISPUTE"];
    }

    return [] as string[];
  }, [order, role]);

  async function handleAction(action: string) {
    setUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || "Failed to update order");
      }
      const data = await res.json();
      setOrder((prev) => (prev ? { ...prev, status: data.order.status } : prev));
    } catch (err: any) {
      setError(err.message || "Failed to update order");
    } finally {
      setUpdating(false);
    }
  }

  async function handleSubmitReview() {
    if (!order) return;
    setReviewState(null);
    const trimmedComment = comment.trim();
    if (!rating || rating < 1 || rating > 5) {
      setReviewState("Choose a rating between 1 and 5.");
      return;
    }
    if (trimmedComment.length < MIN_REVIEW_LENGTH) {
      setReviewState(`Review must be at least ${MIN_REVIEW_LENGTH} characters.`);
      return;
    }
    if (trimmedComment.length > MAX_REVIEW_LENGTH) {
      setReviewState(`Review must be under ${MAX_REVIEW_LENGTH} characters.`);
      return;
    }
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, rating, comment: trimmedComment, tags }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || "Failed to submit review");
      }
      setReviewState("Review submitted. Thank you!");
      setOrder((prev) => (prev ? { ...prev, review: { id: "new" } } : prev));
      setComment("");
      setTags("");
    } catch (err: any) {
      setReviewState(err.message || "Failed to submit review");
    }
  }

  if (loading) return <div className="muted">Loading order…</div>;
  if (error) return <div className="badge badge-warn">{error}</div>;
  if (!order) return null;

  const banner = role
    ? getNextActionBanner({
        status: order.status,
        role,
        deliveryType: order.listing.deliveryType,
      })
    : "";

  const imageUrl = order.listing.images?.[0]?.url ?? "/donut-hero.png";

  return (
    <div className="stack-14">
      <div className="surface" style={{ padding: 18 }}>
        <div className="stack-6">
          <span className="kicker">Order {order.id.slice(0, 8).toUpperCase()}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <img
              src={imageUrl}
              alt={order.listing.title}
              style={{ width: 88, height: 88, borderRadius: 12, objectFit: "cover" }}
            />
            <div className="stack-4" style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <strong>{order.listing.title}</strong>
                <span className={getStatusTone(order.status)}>{order.status}</span>
              </div>
              <div className="muted">Total: {formatCurrency(order.totalCents)}</div>
              <div className="muted">Quantity: {order.quantity}</div>
              <div className="muted">Created: {formatDate(order.createdAt)}</div>
              <div className="muted">Safe trade code: {order.safeTradeCode}</div>
            </div>
          </div>
        </div>
      </div>

      {banner && (
        <div className="surface surface-strong" style={{ padding: 14 }}>
          <strong>{banner}</strong>
        </div>
      )}

      <div className="surface" style={{ padding: 18 }}>
        <div className="stack-8">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="btn btn-ghost" href={`/listing/${order.listing.id}`}>
              View listing
            </Link>
            {conversationId && (
              <Link className="btn btn-secondary" href={`/market/messages/${conversationId}`}>
                Chat with {role === "buyer" ? "seller" : "buyer"}
              </Link>
            )}
          </div>

          {actions.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {actions.map((action) => (
                <button
                  key={action}
                  className={action === "CANCEL" || action === "DECLINE" ? "btn btn-ghost" : "btn btn-primary"}
                  type="button"
                  disabled={updating}
                  onClick={() => handleAction(action)}
                >
                  {ACTION_LABELS[action] ?? action}
                </button>
              ))}
            </div>
          )}

          {role === "buyer" && order.status === "COMPLETED" && !order.review && (
            <div className="surface" style={{ padding: 16 }}>
              <div className="stack-6">
                <strong>Leave a review</strong>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      className={rating === value ? "btn btn-soft" : "btn btn-ghost"}
                      type="button"
                      onClick={() => setRating(value)}
                    >
                      {value}★
                    </button>
                  ))}
                </div>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Share feedback for the seller"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={MAX_REVIEW_LENGTH}
                />
                <div className="small muted">
                  {comment.trim().length}/{MAX_REVIEW_LENGTH} characters (min {MIN_REVIEW_LENGTH})
                </div>
                <input
                  className="input"
                  placeholder="Optional tags (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <button className="btn btn-primary" type="button" onClick={handleSubmitReview}>
                  Submit review
                </button>
                {reviewState && <div className="muted">{reviewState}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

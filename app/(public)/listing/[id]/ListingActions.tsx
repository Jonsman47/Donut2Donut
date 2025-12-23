"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

export function ListingActions({
  listingId,
  sellerId,
}: {
  listingId: string;
  sellerId: string;
}) {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const isOwner = userId === sellerId;

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  async function handleRequest() {
    if (loading) return;
    try {
      setLoading(true);
      setInfo(null);
      setError(null);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, quantity: 1 }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.error || "Error while creating order";
        const details = data.details ? ` (${data.details})` : "";
        throw new Error(msg + details);
      }

      const data = await res.json();
      window.location.href = `/market/orders/${data.order.id}`;
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      const ok = confirm(
        "Are you sure you want to delete this listing? This action is permanent."
      );
      if (!ok) return;

      setDeleting(true);
      setError(null);
      setInfo(null);

      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as any).error || "Error deleting listing"
        );
      }

      window.location.href = "/market";
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="stack-6">
      {/* Buyer actions: Request only */}
      {!isOwner && (
        <button
          className="btn btn-primary"
          style={{ width: "100%" }}
          onClick={handleRequest}
          disabled={loading || deleting}
        >
          {loading
            ? "Creating purchase request..."
            : "Step 1 · Send Purchase Request"}
        </button>
      )}

      {/* Owner actions: Delete */}
      {isOwner && (
        <button
          className="btn btn-ghost"
          style={{ width: "100%" }}
          type="button"
          onClick={handleDelete}
          disabled={loading || deleting}
        >
          {deleting ? "Deleting..." : "Delete Listing"}
        </button>
      )}

      {info && (
        <div
          style={{
            fontSize: 12,
            color: "#bbf7d0",
            border: "1px solid #22c55e44",
            borderRadius: 8,
            padding: "6px 8px",
          }}
        >
          {info}
        </div>
      )}

      {error && (
        <div
          style={{
            fontSize: 12,
            color: "#fecaca",
            border: "1px solid #fca5a544",
            borderRadius: 8,
            padding: "6px 8px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

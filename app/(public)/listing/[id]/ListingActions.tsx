"use client";

import { useState } from "react";

export function ListingActions({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest() {
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
        throw new Error(
          (data as any).error || "Erreur lors de la création de la commande"
        );
      }

      const data = await res.json();
      setInfo(
        `Commande créée ! Code d'échange : ${data.order.safeTradeCode} (status: ${data.order.status})`
      );
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack-6">
      <button
        className="btn btn-primary"
        style={{ width: "100%" }}
        onClick={handleRequest}
        disabled={loading}
      >
        {loading
          ? "Création de la demande d'achat..."
          : "Étape 1 · Envoyer une demande d'achat"}
      </button>

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

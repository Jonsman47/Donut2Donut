"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

export function ListingActions({ listingId }: { listingId: string }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [messaging, setMessaging] = useState(false);

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
      window.location.href = `/market/orders/${data.order.id}`;
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  async function handleMessageSeller() {
    if (!session?.user?.id) {
      signIn(undefined, { callbackUrl: `/listing/${listingId}` });
      return;
    }

    try {
      setMessaging(true);
      setError(null);

      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || "Failed to start conversation");
      }

      const data = await res.json();
      const template = encodeURIComponent(
        "Hi, I’m interested in this listing. Is it still available?"
      );
      window.location.href = `/market/messages/${data.conversation.id}?prefill=${template}`;
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setMessaging(false);
    }
  }

  async function handleDelete() {
    try {
      const ok = confirm(
        "Tu es sûr de vouloir supprimer cette annonce ? Cette action est définitive."
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
          (data as any).error || "Erreur lors de la suppression de l'annonce"
        );
      }

      // Redirection simple vers le marché après suppression
      window.location.href = "/market";
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="stack-6">
      {/* Étape 1 : créer une demande d'achat */}
      <button
        className="btn btn-primary"
        style={{ width: "100%" }}
        onClick={handleRequest}
        disabled={loading || deleting || messaging}
      >
        {loading
          ? "Création de la demande d'achat..."
          : "Étape 1 · Envoyer une demande d'achat"}
      </button>

      <button
        className="btn btn-secondary"
        style={{ width: "100%" }}
        type="button"
        onClick={handleMessageSeller}
        disabled={loading || deleting || messaging}
      >
        {messaging ? "Ouverture du message..." : "Message seller"}
      </button>

      {/* Nouveau bouton : supprimer l'annonce */}
      <button
        className="btn btn-ghost"
        style={{ width: "100%" }}
        type="button"
        onClick={handleDelete}
        disabled={loading || deleting || messaging}
      >
        {deleting ? "Suppression en cours..." : "Supprimer l’annonce"}
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

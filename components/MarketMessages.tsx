"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

const MAX_MESSAGE_LENGTH = 500;

type Conversation = {
  id: string;
  listing: {
    id: string;
    title: string;
    images: { url: string }[];
  } | null;
  buyer: { id: string; username: string };
  seller: { id: string; username: string };
  messages: { id: string; body: string; senderId: string; createdAt: string }[];
  unreadMessages: number;
};

type Message = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
};

export default function MarketMessages({ initialConversationId }: { initialConversationId?: string }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id as string | undefined;
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(undefined, { callbackUrl: "/market/messages" });
    }
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    async function loadConversations() {
      try {
        const res = await fetch("/api/conversations");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as any).error || "Failed to load conversations");
        }
        const data = await res.json();
        if (!active) return;
        setConversations(data.conversations ?? []);
        if (!selectedId && data.conversations?.length) {
          setSelectedId(data.conversations[0].id);
        }
      } catch (err: any) {
        if (active) setError(err.message || "Failed to load conversations");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadConversations();
    return () => {
      active = false;
    };
  }, [selectedId, status]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    async function loadMessages() {
      try {
        const res = await fetch(`/api/conversations/${selectedId}/messages`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as any).error || "Failed to load messages");
        }
        const data = await res.json();
        if (!active) return;
        setMessages(data.messages ?? []);
        await fetch(`/api/conversations/${selectedId}/read`, { method: "POST" });
      } catch (err: any) {
        if (active) setError(err.message || "Failed to load messages");
      }
    }
    loadMessages();
    return () => {
      active = false;
    };
  }, [selectedId]);

  useEffect(() => {
    const prefill = searchParams.get("prefill");
    if (prefill) {
      setInput(decodeURIComponent(prefill));
    }
  }, [searchParams]);

  useEffect(() => {
    const listingId = searchParams.get("listingId");
    if (!listingId) return;
    let active = true;
    async function ensureConversation() {
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (active) setSelectedId(data.conversation.id);
      } catch (err) {
        console.error(err);
      }
    }
    ensureConversation();
    return () => {
      active = false;
    };
  }, [searchParams]);

  const selectedConversation = useMemo(
    () => conversations.find((conv) => conv.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  async function handleSend() {
    if (!selectedId || !input.trim()) return;
    const text = input.trim();
    if (text.length > MAX_MESSAGE_LENGTH) {
      setError(`Message too long (max ${MAX_MESSAGE_LENGTH})`);
      return;
    }

    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || "Failed to send message");
      }
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setInput("");
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedId
            ? {
                ...conv,
                messages: [data.message],
                unreadMessages: 0,
              }
            : conv
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="muted">Loading conversations…</div>;
  if (error) return <div className="badge badge-warn">{error}</div>;

  return (
    <div className="surface" style={{ padding: 18 }}>
      <div className="grid-2" style={{ gap: 16, gridTemplateColumns: "1fr 2fr" }}>
        <div className="stack-10">
          <strong>Inbox</strong>
          <div className="stack-6">
            {conversations.map((conv) => {
              const otherUser =
                conv.buyer.id === userId ? conv.seller : conv.buyer;
              const imageUrl = conv.listing?.images?.[0]?.url;
              const lastMessage = conv.messages?.[0]?.body ?? "No messages yet";
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedId(conv.id)}
                  className={
                    selectedId === conv.id ? "btn btn-soft" : "btn btn-ghost"
                  }
                  style={{ textAlign: "left" }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <img
                      src={imageUrl ?? "/donut-hero.png"}
                      alt={conv.listing?.title ?? "Listing"}
                      style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }}
                    />
                    <div className="stack-2" style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                        <strong>{conv.listing?.title ?? "General chat"}</strong>
                        {conv.unreadMessages > 0 && (
                          <span className="badge badge-warn">{conv.unreadMessages}</span>
                        )}
                      </div>
                      <div className="muted" style={{ fontSize: "0.8rem" }}>{lastMessage}</div>
                      <div className="muted" style={{ fontSize: "0.75rem" }}>Chat with {otherUser.username}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="stack-10">
          {selectedConversation ? (
            <>
              <div className="stack-4">
                <strong>{selectedConversation.listing?.title ?? "Conversation"}</strong>
                {selectedConversation.listing?.id && (
                  <Link className="btn btn-ghost" href={`/listing/${selectedConversation.listing.id}`}>
                    View listing
                  </Link>
                )}
              </div>
              <div className="surface" style={{ padding: 12, minHeight: 260 }}>
                <div className="stack-6">
                  {messages.map((message) => (
                    <div key={message.id} className="surface" style={{ padding: 10 }}>
                      <div className="muted" style={{ fontSize: "0.75rem" }}>
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                      <div>{message.body}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="stack-4">
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Write a message"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="muted" style={{ fontSize: "0.75rem" }}>
                    {input.length}/{MAX_MESSAGE_LENGTH}
                  </div>
                  <button className="btn btn-primary" type="button" disabled={sending} onClick={handleSend}>
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="muted">Select a conversation to start messaging.</div>
          )}
        </div>
      </div>
    </div>
  );
}

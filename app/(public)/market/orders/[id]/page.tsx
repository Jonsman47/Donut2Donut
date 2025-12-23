"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getStatusTone } from "@/lib/order-utils";

export default function OrderPage() {
    const { data: session, status: authStatus } = useSession();
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;
    const userId = (session?.user as any)?.id;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [hasUploadedProof, setHasUploadedProof] = useState(false);
    const [proofs, setProofs] = useState<any[]>([]);

    // Fetch order on load and when actions complete
    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${orderId}`);
            if (!res.ok) {
                if (res.status === 404) setError("Order not found");
                if (res.status === 403) setError("Access denied");
                return;
            }
            const data = await res.json();
            setOrder(data.order);
            // Check if user already has proofs uploaded
            const myProofs = data.order.deliveryProofs?.filter((p: any) => p.userId === userId) || [];
            if (myProofs.length > 0) {
                setHasUploadedProof(true);
            }
            setProofs(data.order.deliveryProofs || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authStatus === "authenticated") {
            fetchOrder();
            // Polling for real-time updates
            const interval = setInterval(fetchOrder, 5000);
            return () => clearInterval(interval);
        } else if (authStatus === "unauthenticated") {
            router.push("/login");
        }
    }, [authStatus, orderId, router]);

    // Proofs are fetched with order data - no separate polling needed

    if (loading) return <div className="container section">Loading trade...</div>;
    if (error) return <div className="container section badge badge-warn">{error}</div>;
    if (!order) return null;

    const isBuyer = userId === order.buyerId;
    const isSeller = userId === order.sellerId;
    const role = isBuyer ? "Buyer" : isSeller ? "Seller" : "Viewer";

    const { status, listing } = order;
    const step = getStepFromStatus(status);

    async function handleAction(endpoint: string, method = "POST") {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/${endpoint}`, { method });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                alert(d.error || d.details || "Action failed");
                return;
            }
            // Refresh order data after action
            await fetchOrder();
        } catch (e) {
            console.error(e);
            alert("Error performing action");
        } finally {
            setActionLoading(false);
        }
    }

    return (
        <div className="app-shell" style={{ background: "var(--bg)" }}>
            <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
                <div className="stack-18">
                    {/* Hero Header */}
                    <div className="glass-card fade-up" style={{ padding: 32, borderRadius: 24, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', background: 'linear-gradient(90deg, transparent, var(--primary-soft))', opacity: 0.5, pointerEvents: 'none' }} />

                        <div className="grid-2" style={{ alignItems: "center", position: 'relative', zIndex: 1 }}>
                            <div className="stack-6">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span className="badge badge-blue ring-glow">Room #{order.id.slice(-6)}</span>
                                    <span className={getStatusTone(status)}>{status.replace("_", " ")}</span>
                                </div>
                                <h1 className="h2" style={{ marginTop: 8 }}>
                                    {isBuyer ? "Buying" : "Selling"} {order.quantity}x {listing.title}
                                </h1>
                                <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <span>Partner: <strong>{isBuyer ? order.seller.username : order.buyer.username}</strong></span>
                                    {status !== "COMPLETED" && status !== "CANCELLED" && status !== "DECLINED" && (
                                        <StepTimer updatedAt={order.updatedAt} />
                                    )}
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "2.4rem", fontWeight: 800, color: 'var(--primary)' }}>
                                    {(order.totalCents / 100).toFixed(2)} €
                                </div>
                                {isSeller ? (
                                    <div className="muted" style={{ fontWeight: 600, fontSize: '1rem', marginTop: -4 }}>
                                        Revenue: {((order.totalCents - order.platformFeeCents) / 100).toFixed(2)} €
                                    </div>
                                ) : (
                                    <div className="muted" style={{ fontSize: "0.9rem" }}>
                                        Escrow Protection Active
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid-3" style={{ gridTemplateColumns: "1fr 2.5fr", alignItems: "start", gap: 32 }}>
                        {/* Sidebar: Progress & Info */}
                        <div className="stack-14">
                            <div className="surface pro-shadow" style={{ padding: 24, borderRadius: 20 }}>
                                <span className="kicker" style={{ marginBottom: 20, display: 'block' }}>Progress</span>
                                <div className="stack-18" style={{ position: 'relative' }}>
                                    <div className="timeline-line" />
                                    <TimelineStep number={1} label="Request" status={step >= 1 ? (step > 1 ? "done" : "active") : "pending"} />
                                    <TimelineStep number={2} label="Payment" status={step >= 2 ? (step > 2 ? "done" : "active") : "pending"} />
                                    <TimelineStep number={3} label="Exchange" status={step >= 3 ? (step > 3 ? "done" : "active") : "pending"} />
                                    <TimelineStep number={4} label="Closing" status={step >= 4 ? (step > 4 ? "done" : "active") : "pending"} />
                                </div>
                            </div>

                            <div className="surface pro-shadow" style={{ padding: 24, borderRadius: 20 }}>
                                <span className="kicker" style={{ marginBottom: 16, display: 'block' }}>Item Details</span>
                                <div className="stack-8">
                                    <div style={{ position: 'relative', height: 160, borderRadius: 12, overflow: 'hidden' }}>
                                        <Image src={listing.images[0]?.url || "/donut-hero.png"} fill alt={listing.title} style={{ objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ fontWeight: 600 }}>{listing.title}</div>
                                    <p className="p" style={{ fontSize: '0.9rem' }}>{listing.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Main Content: Actions & Chat */}
                        <div className="stack-18">
                            <div className="surface pro-shadow fade-up" style={{ padding: 32, borderRadius: 24, minHeight: 400 }}>
                                {status === "REQUESTED" && (
                                    <div className="stack-10">
                                        <h2 className="h3">Action Required: Validation</h2>
                                        {isSeller ? (
                                            <>
                                                <p className="p">A buyer wants to purchase your item. Do you accept the trade?</p>
                                                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                                                    <button className="btn btn-primary" disabled={actionLoading} onClick={() => handleAction("accept")}>
                                                        Accept Trade
                                                    </button>
                                                    <button className="btn btn-ghost" disabled={actionLoading} onClick={() => handleAction("decline")}>
                                                        Decline
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="stack-8" style={{ textAlign: 'center', padding: '40px 0' }}>
                                                <div className="glow-primary" style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                                                    <span style={{ fontSize: 24 }}>⏳</span>
                                                </div>
                                                <p className="p">Waiting for seller validation...</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {status === "ACCEPTED" && (
                                    <div className="stack-10">
                                        <h2 className="h3">Next Step: Payment</h2>
                                        {isBuyer ? (
                                            <>
                                                <p className="p">Seller accepted! Please pay the escrow to secure funds.</p>
                                                <button className="btn btn-primary btn-wide" style={{ marginTop: 12 }} disabled={actionLoading} onClick={() => handleAction("pay")}>
                                                    Pay {(order.totalCents / 100).toFixed(2)} €
                                                </button>
                                            </>
                                        ) : (
                                            <div className="stack-8" style={{ textAlign: 'center', padding: '40px 0' }}>
                                                <p className="p">Waiting for buyer payment...</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(status === "PAID_ESCROW" || status === "DELIVERED") && (
                                    <div className="stack-14">
                                        <div className="stack-6">
                                            <h2 className="h3">In-Game Exchange Phase</h2>
                                            <p className="p">Escrow is funded. You can now proceed to the exchange safely.</p>
                                        </div>

                                        <div className="glass-card" style={{ padding: 20, borderRadius: 16, border: '1px solid var(--primary-soft)' }}>
                                            <div className="stack-6" style={{ textAlign: 'center' }}>
                                                <span className="kicker">Security Code</span>
                                                <div className="h1" style={{ fontFamily: "monospace", letterSpacing: 8, color: 'var(--primary)' }}>{order.safeTradeCode}</div>
                                                <p className="p" style={{ fontSize: '0.8rem' }}>Give this code in-game to prove your identity.</p>
                                            </div>
                                        </div>

                                        <div className="sep" />

                                        <TradeChat orderId={orderId} userId={userId} />

                                        <div className="sep" />

                                        <div className="stack-10">
                                            <h3 className="h3">Proofs & Validation</h3>
                                            <ProofUpload orderId={orderId} onProofUploaded={() => setHasUploadedProof(true)} />
                                            <ProofList proofs={proofs} orderId={orderId} isBuyer={isBuyer} onUpdate={fetchOrder} />

                                            <div style={{ marginTop: 12 }}>
                                                <div className="grid-2" style={{ gap: 12, marginBottom: 16 }}>
                                                    <div className={`surface ${order.buyerConfirmedAt ? "surface-strong glow-primary" : ""}`} style={{ padding: 12, borderRadius: 12, fontSize: '0.9rem' }}>
                                                        Buyer: {order.buyerConfirmedAt ? "✅ Confirmed" : "⏳ Waiting"}
                                                    </div>
                                                    <div className={`surface ${order.sellerConfirmedAt ? "surface-strong glow-primary" : ""}`} style={{ padding: 12, borderRadius: 12, fontSize: '0.9rem' }}>
                                                        Seller: {order.sellerConfirmedAt ? "✅ Confirmed" : "⏳ Waiting"}
                                                    </div>
                                                </div>

                                                {!((isBuyer && order.buyerConfirmedAt) || (isSeller && order.sellerConfirmedAt)) ? (
                                                    <div className="stack-8">
                                                        {isSeller && !hasUploadedProof && (
                                                            <div className="badge badge-warn" style={{ padding: '8px 12px' }}>
                                                                ⚠️ You must upload video proof before confirming.
                                                            </div>
                                                        )}
                                                        <button
                                                            className="btn btn-primary btn-wide"
                                                            disabled={actionLoading || (isSeller && !hasUploadedProof)}
                                                            onClick={() => handleAction("confirm")}
                                                        >
                                                            Confirm Exchange Completed
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="badge badge-blue btn-wide" style={{ padding: 12 }}>
                                                        Confirmation saved. Waiting for the other party.
                                                    </div>
                                                )}
                                            </div>

                                            <button className="btn btn-ghost btn-wide" style={{ color: "var(--color-red)", marginTop: 8 }} disabled={actionLoading} onClick={() => {
                                                if (confirm("Report a problem? This will freeze funds and involve a moderator.")) {
                                                    handleAction("dispute");
                                                }
                                            }}>
                                                Open Dispute / Issue
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {status === "COMPLETED" && (
                                    <div className="stack-14" style={{ textAlign: "center", padding: "40px 0" }}>
                                        <div style={{ fontSize: 64 }}>🏆</div>
                                        <h2 className="h2" style={{ color: "var(--color-green)" }}>Trade Completed!</h2>
                                        <p className="p">The exchange was validated by both parties. Funds have been released.</p>
                                        <button className="btn btn-primary" onClick={() => router.push("/market")}>Back to Market</button>
                                    </div>
                                )}

                                {status === "DISPUTE_OPEN" && (
                                    <div className="stack-14" style={{ textAlign: "center", padding: "40px 0" }}>
                                        <div style={{ fontSize: 64 }}>⚖️</div>
                                        <h2 className="h3" style={{ color: "var(--color-red)" }}>Dispute in Progress</h2>
                                        <p className="p">A moderator is reviewing video evidence. Keep an eye on your notifications.</p>
                                    </div>
                                )}

                                {status === "DECLINED" && (
                                    <div className="stack-14" style={{ textAlign: "center", padding: "40px 0" }}>
                                        <div style={{ fontSize: 64 }}>❌</div>
                                        <h2 className="h3">Request Declined</h2>
                                        <p className="p">The seller has declined this proposal.</p>
                                        <button className="btn btn-ghost" onClick={() => router.push("/market")}>Back to Market</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TimelineStep({ number, label, status }: { number: number, label: string, status: "pending" | "active" | "done" }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
            <div className={`timeline-dot ${status}`}>
                {status === "done" ? "✓" : number}
            </div>
            <div className="stack-2">
                <div style={{ fontWeight: 600, color: status === "pending" ? 'var(--text-muted)' : 'var(--text)' }}>
                    {label}
                </div>
                {status === "active" && <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>IN PROGRESS</span>}
            </div>
        </div>
    );
}

function StepTimer({ updatedAt }: { updatedAt: string }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const deadline = new Date(updatedAt).getTime() + 24 * 60 * 60 * 1000;
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = deadline - now;
            if (diff <= 0) {
                setTimeLeft("EXPIRED");
                clearInterval(interval);
            } else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${h}h ${m}m ${s}s`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [updatedAt]);

    return (
        <span className="badge badge-warn" style={{ fontVariantNumeric: 'tabular-nums' }}>
            ⏳ expires in: {timeLeft}
        </span>
    );
}

function getStepFromStatus(status: string) {
    switch (status) {
        case "REQUESTED": return 1;
        case "ACCEPTED":
        case "AWAITING_PAYMENT": return 2;
        case "PAID_ESCROW": return 3;
        case "SHIPPED":
        case "DELIVERED":
        case "DISPUTE_OPEN":
        case "COMPLETED": return 4;
        default: return 1;
    }
}


function ProofUpload({ orderId, onProofUploaded }: { orderId: string; onProofUploaded?: () => void }) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function submit() {
        if (!url) return;

        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            alert("Please enter a valid URL (e.g., https://youtube.com/watch?v=...)");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/proof`, {
                method: "POST",
                body: JSON.stringify({ url, kind: "video" }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                setSuccess(true);
                onProofUploaded?.();
                setUrl("");
            } else {
                alert("Failed to upload proof");
            }
        } catch (e) {
            console.error(e);
            alert("Error submitting proof");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="stack-4">
            <h3 className="h5">Upload Proof</h3>
            {success && (
                <div className="badge badge-green">
                    Proof submitted! You can submit more if needed.
                </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
                <input
                    className="input"
                    placeholder="Paste video URL (YouTube, Streamable...)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                />
                <button
                    className="btn btn-secondary"
                    disabled={loading || !url}
                    onClick={submit}
                >
                    {loading ? "Submitting..." : "Submit Proof"}
                </button>
            </div>
            <div className="text-sm muted">
                Please ensure the video shows the full trade process including chat and
                inventory.
            </div>
        </div>
    );
}

function ProofList({
    proofs,
    orderId,
    isBuyer,
    onUpdate,
}: {
    proofs: any[];
    orderId: string;
    isBuyer: boolean;
    onUpdate: () => void;
}) {
    if (!proofs.length) {
        return (
            <div className="muted" style={{ fontSize: "0.85rem" }}>
                No proofs uploaded yet.
            </div>
        );
    }

    async function acceptProof(proofId: string) {
        const res = await fetch(`/api/orders/${orderId}/proof/accept`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ proofId }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            alert(data.error || "Failed to accept proof");
            return;
        }
        onUpdate();
    }

    return (
        <div className="stack-6">
            <div className="kicker">Uploaded proofs</div>
            <div className="stack-6">
                {proofs.map((proof) => (
                    <div key={proof.id} className="surface" style={{ padding: 12, borderRadius: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                            <div className="stack-4">
                                <strong>{proof.kind}</strong>
                                <a className="muted" href={proof.url} target="_blank" rel="noreferrer">
                                    View proof
                                </a>
                            </div>
                            <span className={`badge ${proof.status === "ACCEPTED" ? "badge-good" : proof.status === "REJECTED" ? "badge-warn" : "badge-blue"}`}>
                                {proof.status}
                            </span>
                        </div>
                        {isBuyer && proof.status === "PENDING" && (
                            <button className="btn btn-secondary" type="button" onClick={() => acceptProof(proof.id)}>
                                Accept proof
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function TradeChat({ orderId, userId }: { orderId: string; userId: string }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/orders/${orderId}/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [orderId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    async function sendMessage() {
        if (!newMessage.trim() || sending) return;
        setSending(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newMessage }),
            });
            if (res.ok) {
                setNewMessage("");
                fetchMessages();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="stack-14 trade-chat-container">
            <div className="chat-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="kicker">Live Discussion</span>
                <span className="badge badge-blue">Online</span>
            </div>

            <div
                ref={scrollRef}
                style={{
                    height: 400,
                    overflowY: "auto",
                    padding: "20px",
                    background: "var(--surface-muted)",
                    borderRadius: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    border: '1px solid var(--border)'
                }}
                className="custom-scrollbar"
            >
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', opacity: 0.5, marginTop: 150 }}>
                        No messages yet. Start the conversation!
                    </div>
                )}
                {messages.map((m) => {
                    const isMe = m.senderId === userId;
                    return (
                        <div key={m.id} style={{
                            alignSelf: isMe ? "flex-end" : "flex-start",
                            maxWidth: "80%",
                        }}>
                            <div style={{
                                padding: "10px 16px",
                                borderRadius: isMe ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                                background: isMe ? "var(--primary)" : "var(--surface)",
                                color: isMe ? "white" : "var(--text)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                border: isMe ? "none" : "1px solid var(--border)",
                                fontSize: "0.95rem",
                                lineHeight: "1.4"
                            }}>
                                {m.content}
                            </div>
                            <div style={{
                                fontSize: "0.7rem",
                                color: "var(--text-muted)",
                                marginTop: 4,
                                textAlign: isMe ? "right" : "left",
                                padding: "0 4px"
                            }}>
                                {isMe ? "You" : m.sender?.username} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ position: 'relative', marginTop: 12 }}>
                <input
                    className="input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    disabled={sending}
                    style={{
                        paddingRight: 100,
                        borderRadius: 30,
                        height: 54,
                        background: 'var(--surface)',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                />
                <button
                    onClick={sendMessage}
                    className="btn btn-primary"
                    disabled={sending || !newMessage.trim()}
                    style={{
                        position: 'absolute',
                        right: 6,
                        top: 6,
                        bottom: 6,
                        borderRadius: 24,
                        padding: '0 24px'
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

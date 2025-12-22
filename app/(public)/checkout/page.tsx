"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const sp = useSearchParams();
  const listingId = sp.get("listingId");
  const [status, setStatus] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");

  async function createOrder() {
    setStatus("Creating order…");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ listingId, quantity: 1 }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "Failed");
      return;
    }
    setOrderId(data.orderId);
    setStatus("Escrow funded (dev mode if no Stripe keys). Go to Orders.");
  }

  useEffect(() => {
    if (listingId) createOrder();
  }, [listingId]);

  return (
    <div className="card">
      <h1 style={{marginTop:0}}>Checkout</h1>
      <div className="small">Agreement: you understand escrow + dispute policy.</div>
      <div style={{marginTop:10}} className="pill">Creating escrow order automatically…</div>
      <div style={{marginTop:10}} className="small">{status}</div>
      {orderId && <div style={{marginTop:10}} className="pill">Order: <b>{orderId}</b></div>}
      <div style={{marginTop:12}}>
        <a className="btn" href="/market/orders">Go to Orders</a>
      </div>
    </div>
  );
}

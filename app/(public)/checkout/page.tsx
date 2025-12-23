"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const sp = useSearchParams();
  const listingId = sp.get("listingId");
  const [status, setStatus] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [listing, setListing] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponId, setCouponId] = useState<string>("");

  async function createOrder() {
    setStatus("Creating order…");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ listingId, quantity: 1, couponId: couponId || undefined }),
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
    async function loadData() {
      if (!listingId) return;
      const [listingRes, walletRes] = await Promise.all([
        fetch(`/api/listings/${listingId}`),
        fetch("/api/wallet"),
      ]);
      if (listingRes.ok) {
        const data = await listingRes.json();
        setListing(data.listing);
      }
      if (walletRes.ok) {
        const data = await walletRes.json();
        setWallet(data.wallet);
        setCoupons(data.coupons || []);
      }
    }
    loadData();
  }, [listingId]);

  const subtotalCents = listing ? listing.priceCents : 0;
  const selectedCoupon = coupons.find((coupon) => coupon.id === couponId);
  const couponDiscount = selectedCoupon ? Math.round(subtotalCents * (selectedCoupon.valuePercent / 100)) : 0;
  const lifetimeRate = (wallet?.lifetimeDiscountBps ?? 0) / 1000;
  const lifetimeDiscount = Math.round((subtotalCents - couponDiscount) * lifetimeRate);
  const discountCap = Math.round(subtotalCents * 0.3);
  const totalDiscount = Math.min(couponDiscount + lifetimeDiscount, discountCap);
  const totalCents = Math.max(subtotalCents - totalDiscount, 0);

  return (
    <div className="card">
      <h1 style={{marginTop:0}}>Checkout</h1>
      <div className="small">Agreement: you understand escrow + dispute policy.</div>
      {listing ? (
        <div className="stack-8" style={{ marginTop: 12 }}>
          <div className="surface" style={{ padding: 12, borderRadius: 12 }}>
            <div className="stack-4">
              <strong>{listing.title}</strong>
              <div className="muted">Seller: {listing.seller?.username}</div>
              <div className="muted">Price: €{(listing.priceCents / 100).toFixed(2)}</div>
            </div>
          </div>

          <div className="surface" style={{ padding: 12, borderRadius: 12 }}>
            <div className="stack-6">
              <strong>Apply coupon</strong>
              <select
                className="input"
                value={couponId}
                onChange={(event) => setCouponId(event.target.value)}
              >
                <option value="">No coupon</option>
                {coupons.map((coupon) => (
                  <option key={coupon.id} value={coupon.id}>
                    {coupon.valuePercent}% off one item
                  </option>
                ))}
              </select>
              <div className="muted">Lifetime discount: {(wallet?.lifetimeDiscountBps ?? 0) / 10}%</div>
            </div>
          </div>

          <div className="surface" style={{ padding: 12, borderRadius: 12 }}>
            <div className="stack-4">
              <div>Subtotal: €{(subtotalCents / 100).toFixed(2)}</div>
              <div>Discounts: -€{(totalDiscount / 100).toFixed(2)}</div>
              <strong>Total: €{(totalCents / 100).toFixed(2)}</strong>
            </div>
          </div>

          <button className="btn btn-primary" type="button" onClick={createOrder}>
            Place order
          </button>
          <div className="small">{status}</div>
          {orderId && (
            <div className="pill">
              Order: <b>{orderId}</b>
            </div>
          )}
          <a className="btn" href="/market/orders">Go to Orders</a>
        </div>
      ) : (
        <div className="pill" style={{ marginTop: 10 }}>Loading checkout…</div>
      )}
    </div>
  );
}

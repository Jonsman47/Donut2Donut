"use client";

import { useEffect, useState } from "react";

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [convertPoints, setConvertPoints] = useState(100);
  const [message, setMessage] = useState<string | null>(null);
  const [referral, setReferral] = useState<any>(null);
  const [referralStatus, setReferralStatus] = useState<string | null>(null);

  async function loadWallet() {
    const res = await fetch("/api/wallet");
    if (!res.ok) return;
    const data = await res.json();
    setWallet(data.wallet);
    setCoupons(data.coupons || []);
  }

  async function loadReferral() {
    try {
      const res = await fetch("/api/referrals");
      if (!res.ok) return;
      const data = await res.json();
      setReferral(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadWallet();
    loadReferral();
  }, []);

  async function handleConvert() {
    setMessage(null);
    const res = await fetch("/api/wallet/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points: convertPoints }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error || "Unable to convert points");
      return;
    }
    setMessage("Conversion complete!");
    await loadWallet();
  }

  async function copyReferralLink() {
    if (!referral?.referralLink) return;
    try {
      await navigator.clipboard.writeText(referral.referralLink);
      setReferralStatus("Referral link copied!");
    } catch (err) {
      console.error(err);
      setReferralStatus("Unable to copy link. Try manually copying it.");
    }
  }

  return (
    <div className="container section">
      <div className="stack-14" style={{ maxWidth: 720 }}>
        <div className="stack-6">
          <h1 className="h2" style={{ margin: 0 }}>
            Wallet
          </h1>
          <div className="muted">Manage points, credits, and coupons.</div>
        </div>

        <div className="grid-2" style={{ gap: 12 }}>
          <div id="points" className="surface" style={{ padding: 18, borderRadius: 18 }}>
            <div className="stack-6">
              <strong>Points balance</strong>
              <div className="h2" style={{ margin: 0 }}>
                {wallet?.pointsBalance ?? 0}
              </div>
              <div className="muted">Lifetime earned: {wallet?.lifetimePointsEarned ?? 0}</div>
            </div>
          </div>
          <div id="credits" className="surface" style={{ padding: 18, borderRadius: 18 }}>
            <div className="stack-6">
              <strong>Credit balance</strong>
              <div className="h2" style={{ margin: 0 }}>
                ${((wallet?.creditBalanceCents ?? 0) / 100).toFixed(2)}
              </div>
              <div className="muted">
                Lifetime discount: {(wallet?.lifetimeDiscountBps ?? 0) / 10}%
              </div>
            </div>
          </div>
        </div>

        <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
          <div className="stack-8">
            <strong>Referral rewards</strong>
            <div className="muted">
              Share your link to earn 10 points when someone signs up, plus 3% from their purchases. Owners keep
              7% (or 3.5% if the buyer is VIP).
            </div>
            <div className="stack-6" style={{ wordBreak: "break-word" }}>
              <div className="muted" style={{ fontSize: 12 }}>Your code</div>
              <div className="surface" style={{ padding: 10, borderRadius: 10 }}>
                {referral?.referralCode ?? "Loading..."}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>Referral link</div>
              <div className="surface" style={{ padding: 10, borderRadius: 10 }}>
                {referral?.referralLink ?? "Loading..."}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-secondary" type="button" onClick={copyReferralLink} disabled={!referral?.referralLink}>
                Copy link
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  if (referral?.referralLink) {
                    window.open(referral.referralLink, "_blank");
                  }
                }}
                disabled={!referral?.referralLink}
              >
                Open link
              </button>
            </div>
            {referralStatus && <div className="muted">{referralStatus}</div>}
          </div>
        </div>

        <div id="transactions" className="surface" style={{ padding: 18, borderRadius: 18 }}>
          <div className="stack-6">
            <strong>Transactions history</strong>
            <div className="muted">Transaction history will appear here.</div>
          </div>
        </div>

        <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
          <div className="stack-8">
            <strong>Convert points to credit</strong>
            <div className="muted">100 points = $1 credit.</div>
            <input
              className="input"
              type="number"
              min={100}
              step={100}
              value={convertPoints}
              onChange={(event) => setConvertPoints(Number(event.target.value))}
            />
            <button className="btn btn-secondary" type="button" onClick={handleConvert}>
              Convert
            </button>
            {message && <div className="muted">{message}</div>}
          </div>
        </div>

        <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
          <div className="stack-8">
            <strong>Available coupons</strong>
            {coupons.length === 0 && <div className="muted">No coupons yet.</div>}
            {coupons.map((coupon) => (
              <div key={coupon.id} className="surface" style={{ padding: 12, borderRadius: 12 }}>
                <div className="stack-4">
                  <strong>{coupon.valuePercent}% off one item</strong>
                  <div className="muted">Earned {new Date(coupon.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

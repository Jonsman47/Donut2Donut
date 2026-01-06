"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

const REWARD_LABELS: Record<string, string> = {
  points: "Points",
  discount: "10% coupon",
  lifetime_discount: "Lifetime discount",
};

export default function WheelPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const [canSpin, setCanSpin] = useState(false);
  const [spinStatus, setSpinStatus] = useState<string>("Checking...");
  const [spinning, setSpinning] = useState(false);
  const [reward, setReward] = useState<any>(null);

  const loadStatus = useCallback(async () => {
    const res = await fetch("/api/wheel", { credentials: "same-origin" });
    if (!res.ok) {
      setSpinStatus("Sign in to spin.");
      return;
    }
    const data = await res.json();
    setCanSpin(data.canSpin);
    setSpinStatus(data.canSpin ? "Free spin available" : "Next spin tomorrow");
  }, []);

  useEffect(() => {
    if (status === "authenticated" && userId) {
      loadStatus();
      return;
    }
    if (status === "unauthenticated") {
      setCanSpin(false);
      setSpinStatus("Sign in to spin.");
    }
  }, [loadStatus, status, userId]);

  async function spin() {
    if (status !== "authenticated") {
      setSpinStatus("Sign in to spin.");
      return;
    }
    setSpinning(true);
    setReward(null);
    const res = await fetch("/api/wheel", { method: "POST", credentials: "same-origin" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSpinStatus(data.error || "Unable to spin");
      setSpinning(false);
      return;
    }
    setReward(data.reward);
    setSpinStatus("Spin complete!");
    setCanSpin(false);
    setSpinning(false);
  }

  return (
    <div className="container section">
      <div className="stack-14" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="stack-6" style={{ textAlign: "center" }}>
          <h1 className="h2" style={{ margin: 0 }}>
            Daily Wheel
          </h1>
          <div className="muted">Spin once per day to earn points or discounts.</div>
        </div>

        <div
          className="surface"
          style={{
            padding: 24,
            borderRadius: 20,
            textAlign: "center",
            border: "1px solid rgba(120,170,255,0.2)",
          }}
        >
          <div className="stack-10">
            <div className="badge badge-blue" style={{ alignSelf: "center" }}>
              {spinStatus}
            </div>
            <div
              style={{
                height: 160,
                borderRadius: 16,
                background: "linear-gradient(135deg, rgba(120,170,255,0.2), rgba(120,220,255,0.1))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
              }}
            >
              {spinning ? "🎡" : "🍩"}
            </div>
            <button
              className="btn btn-primary"
              type="button"
              onClick={spin}
              disabled={!canSpin || spinning}
            >
              {spinning ? "Spinning..." : "Spin the wheel"}
            </button>
            {status === "unauthenticated" && (
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => signIn(undefined, { callbackUrl: "/wheel" })}
              >
                Sign in to spin
              </button>
            )}
            {reward && (
              <div className="surface" style={{ padding: 16, borderRadius: 16 }}>
                <strong>You won:</strong> {REWARD_LABELS[reward.type]}
                {reward.type === "points" && ` (+${reward.value} points)`}
                {reward.type === "discount" && " (10% off 1 item)"}
                {reward.type === "lifetime_discount" && " (+0.1%)"}
              </div>
            )}
          </div>
        </div>

        <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
          <div className="stack-6">
            <strong>Rewards & odds</strong>
            <ul className="muted" style={{ margin: 0 }}>
              <li>+1 point (50%)</li>
              <li>+3 points (25%)</li>
              <li>+5 points (10%)</li>
              <li>+10 points (5%)</li>
              <li>10% off one item (3.33%)</li>
              <li>+25 points (3.33%)</li>
              <li>+0.1% lifetime discount (3.33%)</li>
              <li>+250 points (0.01%)</li>
            </ul>
          </div>
        </div>

        <Link className="btn btn-secondary" href="/wallet">
          Go to wallet
        </Link>
      </div>
    </div>
  );
}

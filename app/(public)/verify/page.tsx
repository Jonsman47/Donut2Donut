"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

type VerifyStatus = {
  discordConnected: boolean;
  profileComplete: boolean;
  tosAccepted: boolean;
  setupComplete: boolean;
};

export default function VerifyPage() {
  const { status } = useSession();
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setVerifyStatus(null);
      return;
    }
    let active = true;
    async function loadStatus() {
      try {
        const res = await fetch("/api/verify/status");
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setVerifyStatus({
          discordConnected: Boolean(data.discordConnected),
          profileComplete: Boolean(data.profileComplete),
          tosAccepted: Boolean(data.tosAccepted),
          setupComplete: Boolean(data.setupComplete),
        });
      } catch (e) {
        console.error(e);
      }
    }
    loadStatus();
    return () => {
      active = false;
    };
  }, [status]);

  const showFinishSetup =
    verifyStatus?.discordConnected && !verifyStatus?.setupComplete;

  return (
    <div className="container section">
      <div className="stack-14" style={{ maxWidth: 880, margin: "0 auto" }}>
        <div className="stack-6">
          <h1 className="h2" style={{ margin: 0 }}>
            Verification checklist
          </h1>
          <div className="muted">
            Connect Discord, complete your profile, and accept the TOS before selling.
          </div>
        </div>

        {status === "unauthenticated" && (
          <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
            <div className="stack-6">
              <strong>Sign in to start verification</strong>
              <div className="muted">
                You need an account before connecting Discord or finishing setup.
              </div>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => signIn(undefined, { callbackUrl: "/verify" })}
              >
                Sign in
              </button>
            </div>
          </div>
        )}

        {status === "authenticated" && verifyStatus && (
          <div className="stack-12">
            <div
              className="surface"
              style={{
                padding: 18,
                borderRadius: 18,
                display: "grid",
                gap: 10,
              }}
            >
              <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>
                Stepper
              </div>
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
                {[
                  { label: "Connect Discord", done: verifyStatus.discordConnected },
                  { label: "Complete profile", done: verifyStatus.profileComplete },
                  { label: "Accept TOS", done: verifyStatus.tosAccepted },
                  { label: "Ready to sell", done: verifyStatus.setupComplete },
                ].map((step) => (
                  <div
                    key={step.label}
                    className="surface"
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <span className="muted">{step.label}</span>
                    <span>{step.done ? "✅" : "⬜️"}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid-2" style={{ gap: 12 }}>
              <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
                <div className="stack-6">
                  <strong>Discord</strong>
                  <div className="muted">
                    Status: {verifyStatus.discordConnected ? "✅ Connected" : "❌ Not connected"}
                  </div>
                  {!verifyStatus.discordConnected ? (
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => signIn("discord", { callbackUrl: "/verify" })}
                    >
                      Connect
                    </button>
                  ) : (
                    <button className="btn btn-secondary" type="button" disabled>
                      Connected
                    </button>
                  )}
                </div>
              </div>

              <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
                <div className="stack-6">
                  <strong>Profile setup</strong>
                  <div className="muted">
                    Status: {verifyStatus.profileComplete ? "✅ Complete" : "❌ Incomplete"}
                  </div>
                  <div className="muted">Email, Minecraft username, and real name.</div>
                  <Link className="btn btn-secondary" href="/verify/setup">
                    Edit setup
                  </Link>
                </div>
              </div>

              <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
                <div className="stack-6">
                  <strong>Terms of Service</strong>
                  <div className="muted">
                    Status: {verifyStatus.tosAccepted ? "✅ Accepted" : "❌ Not accepted"}
                  </div>
                  <div className="muted">Required before you can sell.</div>
                  <Link className="btn btn-secondary" href="/tos">
                    Read TOS
                  </Link>
                </div>
              </div>

              <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
                <div className="stack-6">
                  <strong>Ready to sell</strong>
                  <div className="muted">
                    {verifyStatus.setupComplete ? "✅ You can sell" : "❌ You cannot sell yet"}
                  </div>
                </div>
              </div>
            </div>

            {showFinishSetup && (
              <div className="surface surface-strong" style={{ padding: 18, borderRadius: 18 }}>
                <div className="stack-6">
                  <strong>Finish setting up your account</strong>
                  <div className="muted">
                    Complete your profile details and accept the TOS to start selling.
                  </div>
                  <Link className="btn btn-secondary" href="/verify/setup">
                    Finish setup
                  </Link>
                </div>
              </div>
            )}

            <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
              <div className="stack-6">
                <strong>Your status</strong>
                <div className="muted">
                  Discord: {verifyStatus.discordConnected ? "Connected" : "Not connected"} · Profile:{" "}
                  {verifyStatus.profileComplete ? "Complete" : "Incomplete"} · TOS:{" "}
                  {verifyStatus.tosAccepted ? "Accepted" : "Pending"}
                </div>
                <div className="muted">
                  {verifyStatus.setupComplete ? "✅ You can sell" : "❌ You cannot sell yet"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

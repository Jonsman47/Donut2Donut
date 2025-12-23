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
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
                <div className="stack-6">
                  <strong>Step 1 · Connect Discord</strong>
                  <div className="muted">
                    Status: {verifyStatus.discordConnected ? "✅ Connected" : "❌ Not connected"}
                  </div>
                  {!verifyStatus.discordConnected && (
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => signIn("discord", { callbackUrl: "/verify" })}
                    >
                      Connect Discord
                    </button>
                  )}
                </div>
              </div>

              <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
                <div className="stack-6">
                  <strong>Step 2 · Complete profile</strong>
                  <div className="muted">
                    Status: {verifyStatus.profileComplete ? "✅ Complete" : "❌ Incomplete"}
                  </div>
                  <div className="muted">Email, Minecraft username, and real name.</div>
                </div>
              </div>

              <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
                <div className="stack-6">
                  <strong>Step 3 · Accept TOS</strong>
                  <div className="muted">
                    Status: {verifyStatus.tosAccepted ? "✅ Accepted" : "❌ Not accepted"}
                  </div>
                  <div className="muted">Required before you can sell.</div>
                </div>
              </div>

              <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
                <div className="stack-6">
                  <strong>Step 4 · Ready to sell</strong>
                  <div className="muted">
                    {verifyStatus.setupComplete ? "✅ All set!" : "⏳ Finish setup to unlock selling."}
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
                <Link className="btn btn-ghost" href="/verify/setup">
                  Edit setup
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

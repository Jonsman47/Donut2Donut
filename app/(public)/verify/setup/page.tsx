"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const MC_USERNAME_REGEX = /^[a-zA-Z0-9_]{3,16}$/;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function VerifySetupPage() {
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [mcUsername, setMcUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [tosAccepted, setTosAccepted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [discordConnected, setDiscordConnected] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    async function loadSetup() {
      try {
        const res = await fetch("/api/verify/status");
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setEmail(data.email ?? "");
        setMcUsername(data.mcUsername ?? "");
        setRealName(data.realName ?? "");
        setTosAccepted(Boolean(data.tosAccepted));
        setDiscordConnected(Boolean(data.discordConnected));
      } catch (e) {
        console.error(e);
      }
    }
    loadSetup();
    return () => {
      active = false;
    };
  }, [status]);

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (email && !isValidEmail(email)) {
      errors.push("Enter a valid email address.");
    }
    if (mcUsername && !MC_USERNAME_REGEX.test(mcUsername)) {
      errors.push("Minecraft username must be 3-16 characters (letters, numbers, underscore).");
    }
    if (realName && realName.trim().length < 2) {
      errors.push("Real name must be at least 2 characters.");
    }
    return errors;
  }, [email, mcUsername, realName]);

  async function handleSubmit() {
    setMessage(null);
    if (!discordConnected) {
      setMessage("Connect Discord before finishing setup.");
      return;
    }
    if (validation.length) {
      setMessage(validation[0]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/verify/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          mcUsername: mcUsername.trim(),
          realName: realName.trim(),
          tosAccepted,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Unable to save setup.");
        return;
      }

      if (data.setupComplete) {
        setMessage("Setup complete! You can now create listings.");
      } else {
        setMessage("Saved. Finish all fields and accept the TOS to unlock selling.");
      }
    } catch (e) {
      console.error(e);
      setMessage("Server error while saving setup.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "unauthenticated") {
    return (
      <div className="container section">
        <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
          <div className="stack-6">
            <strong>Sign in required</strong>
            <div className="muted">Sign in to finish setting up your account.</div>
            <Link className="btn btn-secondary" href="/login">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="stack-14" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="stack-6">
          <h1 className="h2" style={{ margin: 0 }}>
            Finish setting up your account
          </h1>
          <div className="muted">
            These details are private and only visible to you and staff.
          </div>
        </div>

        <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
          <div className="stack-10">
            {!discordConnected && (
              <div className="surface" style={{ padding: 12, borderRadius: 12 }}>
                <div className="stack-4">
                  <strong>Discord not connected</strong>
                  <div className="muted">
                    Connect Discord first, then finish setup.
                  </div>
                  <Link className="btn btn-secondary" href="/verify">
                    Connect Discord
                  </Link>
                </div>
              </div>
            )}
            <div className="stack-4">
              <label className="muted" htmlFor="verify-email">
                Email (confidential)
              </label>
              <input
                id="verify-email"
                className="input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
              <div className="small muted">Why we ask: contact you about payouts and disputes.</div>
            </div>

            <div className="stack-4">
              <label className="muted" htmlFor="verify-mc">
                Minecraft username (confidential)
              </label>
              <input
                id="verify-mc"
                className="input"
                value={mcUsername}
                onChange={(event) => setMcUsername(event.target.value)}
                placeholder="PlayerName"
              />
              <div className="small muted">Why we ask: match listings to in-game delivery.</div>
            </div>

            <div className="stack-4">
              <label className="muted" htmlFor="verify-name">
                Real name (confidential)
              </label>
              <input
                id="verify-name"
                className="input"
                value={realName}
                onChange={(event) => setRealName(event.target.value)}
                placeholder="Your real name"
              />
              <div className="small muted">Why we ask: payout compliance and fraud prevention.</div>
            </div>

            <div className="stack-4">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={tosAccepted}
                  onChange={(event) => setTosAccepted(event.target.checked)}
                />
                <span>
                  I agree to the <Link href="/rules">Terms of Service</Link>.
                </span>
              </label>
              <div className="small muted">Why we ask: required to keep the marketplace safe.</div>
            </div>

            <button
              className="btn btn-primary"
              type="button"
              onClick={handleSubmit}
              disabled={loading || !discordConnected}
            >
              {loading ? "Saving..." : "Save setup"}
            </button>
            {message && <div className="muted">{message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

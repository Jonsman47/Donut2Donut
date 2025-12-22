"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function VerifyPage() {
  const { status } = useSession();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function gen() {
    setLoading(true);
    setMsg("");
    try {
      const r = await fetch("/api/discord-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Failed");
      setCode(data.code);
    } catch (e: any) {
      setMsg(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") gen();
  }, [status]);

  if (status === "loading") {
    return (
      <div className="container section">
        <div className="p">Loading...</div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="container section">
        <div className="card" style={{ padding: 24, maxWidth: 520 }}>
          <div className="stack-12">
            <div className="h2">Login required</div>
            <div className="p">
              You must log in with Discord to generate a verification code.
            </div>
            <button className="btn btn-primary" onClick={() => signIn("discord", { callbackUrl: "/verify" })}>
              Continue with Discord
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="card" style={{ padding: 24, maxWidth: 620 }}>
        <div className="stack-16">
          <div className="stack-8">
            <div className="h2">Discord verification</div>
            <div className="p">
              Copy this code and run <span className="badge">/verify CODE</span> in your Discord server.
              Code expires quickly.
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div className="kicker">One-time code</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 1.5 }}>
              {code || "..."}
            </div>
          </div>

          <button className="btn btn-ghost" onClick={gen} disabled={loading}>
            {loading ? "Generating..." : "Generate new code"}
          </button>

          {msg ? <div className="p">{msg}</div> : null}
        </div>
      </div>
    </div>
  );
}

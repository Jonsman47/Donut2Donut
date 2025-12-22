"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const showDev = useMemo(() => {
    return process.env.NEXT_PUBLIC_DEV_LOGIN_ENABLED === "1";
  }, []);

  return (
    <div className="container section" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ padding: 28, maxWidth: 420, width: "100%" }}>
        <div className="stack-16">
          <div>
            <div className="h2" style={{ marginBottom: 4 }}>
              Sign in
            </div>
            <div className="p" style={{ fontSize: 14 }}>
              Continue with Discord to access Donut2Donut.
            </div>
          </div>

          {error ? (
            <div
              className="p"
              style={{
                fontSize: 13,
                color: "#b91c1c",
                backgroundColor: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              Something went wrong during sign in. Try again.
            </div>
          ) : null}

          <button className="btn btn-primary btn-wide" onClick={() => signIn("discord", { callbackUrl: "/" })}>
            Continue with Discord
          </button>

          {showDev ? (
            <div className="stack-12">
              <div className="kicker">Dev only</div>
              <input
                className="input"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                className="input"
                placeholder="email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="btn btn-secondary btn-wide"
                onClick={() =>
                  signIn("credentials", {
                    username,
                    email,
                    callbackUrl: "/",
                  })
                }
              >
                Dev login
              </button>
            </div>
          ) : null}

          <div className="p" style={{ fontSize: 11, textAlign: "center" }}>
            By continuing, you agree to the usage terms.
          </div>
        </div>
      </div>
    </div>
  );
}

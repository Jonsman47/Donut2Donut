"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const showDev = useMemo(() => {
    // show dev login UI only if you set NEXT_PUBLIC_DEV_LOGIN_ENABLED=1
    return process.env.NEXT_PUBLIC_DEV_LOGIN_ENABLED === "1";
  }, []);

  return (
    <div className="container section">
      <div className="surface surface-strong glass border-grad" style={{ padding: 18 }}>
        <div className="stack-10">
          <div className="h2">Login</div>
          <div className="p">Log in to access seller features and verification.</div>

          <button
            className="btn btn-primary"
            onClick={() => signIn("discord", { callbackUrl: "/verify" })}
          >
            Continue with Discord
          </button>

          {showDev ? (
            <div className="surface" style={{ padding: 14 }}>
              <div className="p" style={{ marginBottom: 10 }}>
                Dev login (local only)
              </div>

              <div className="stack-10">
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
                  className="btn"
                  onClick={() =>
                    signIn("credentials", {
                      username,
                      email,
                      callbackUrl: "/verify",
                    })
                  }
                >
                  Dev login
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
  
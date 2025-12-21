"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  // Permet de lire les paramètres dans l'URL (tout ce qui est après le ?)
  const searchParams = useSearchParams();
  // On récupère la valeur du paramètre "error" (ex: /login?error=discord)
  const error = searchParams.get("error");

  // Champs pour le dev login
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // On affiche le bloc "Dev login" seulement si NEXT_PUBLIC_DEV_LOGIN_ENABLED=1
  const showDev = useMemo(() => {
    return process.env.NEXT_PUBLIC_DEV_LOGIN_ENABLED === "1";
  }, []);

  return (
    <div className="container section">
      <div className="surface surface-strong glass border-grad" style={{ padding: 18 }}>
        <div className="stack-10">
          <div className="h2">Login</div>
          <div className="p">Log in to access seller features and verification.</div>

          {error ? (
            <div className="p" style={{ color: "red" }}>
              Error: {error}
            </div>
          ) : null}

          <button
            className="btn btn-primary"
            onClick={() => signIn("discord", { callbackUrl: "/" })}
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

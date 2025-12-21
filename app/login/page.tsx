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
      <div
        className="surface surface-strong glass border-grad"
        style={{ padding: 24, maxWidth: 420, width: "100%" }}
      >
        <div className="stack-10">
          {/* Titre */}
          <div>
            <div className="h2" style={{ marginBottom: 4 }}>
              Connexion
            </div>
            <div className="p" style={{ fontSize: 14, color: "#8b8b8b" }}>
              Connecte-toi avec Discord pour accéder au site.
            </div>
          </div>

          {/* Erreur éventuelle */}
          {error ? (
            <div
              className="p"
              style={{
                fontSize: 13,
                color: "#b91c1c",
                backgroundColor: "#FEE2E2",
                border: "1px solid #FCA5A5",
                borderRadius: 6,
                padding: "6px 10px",
              }}
            >
              Une erreur est survenue pendant la connexion. Réessaie.
            </div>
          ) : null}

          {/* Bouton Discord */}
          <button
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onClick={() => signIn("discord", { callbackUrl: "/" })}
          >
            <span>Continuer avec Discord</span>
          </button>

          {/* Séparateur */}
          {showDev ? (
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                marginTop: 8,
                paddingTop: 8,
                fontSize: 11,
                color: "#999",
              }}
            >
              Dev uniquement (local)
            </div>
          ) : null}

          {/* Bloc dev login */}
          {showDev ? (
            <div className="stack-10">
              <input
                className="input"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                className="input"
                placeholder="email (optionnel)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="btn"
                style={{ width: "100%" }}
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

          {/* Texte bas de page */}
          <div
            className="p"
            style={{
              fontSize: 11,
              color: "#9ca3af",
              textAlign: "center",
              marginTop: 4,
            }}
          >
            En continuant, tu acceptes les conditions d&apos;utilisation.
          </div>
        </div>
      </div>
    </div>
  );
}

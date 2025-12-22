"use client";

import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";

export function SessionDebug() {
  const { data: session, status } = useSession();

  return (
    <div
      style={{
        marginTop: 20,
        padding: 10,
        borderRadius: 6,
        background: "rgba(0,0,0,0.6)",
        color: "white",
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Session debug</div>

      <div>Status: {status}</div>

      {status === "authenticated" && (
        <pre style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
          {JSON.stringify(session, null, 2)}
        </pre>
      )}

      {status === "unauthenticated" && (
        <div style={{ marginTop: 8 }}>Pas connecté</div>
      )}

      {/* Boutons de login de test */}
      <div
        style={{
          marginTop: 10,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {/* Compte acheteur */}
        <button
          style={{
            padding: "6px 10px",
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(15,23,42,0.9)",
            color: "white",
            cursor: "pointer",
            fontSize: 12,
          }}
          onClick={() =>
            signIn("credentials", {
              redirect: false,
              username: "buyer-demo", // nom EXACT dans ta DB
              // ajoute ici password si ton provider en a besoin
            })
          }
        >
          Se connecter en buyer-demo
        </button>

        {/* Compte vendeur */}
        <button
          style={{
            padding: "6px 10px",
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(15,23,42,0.9)",
            color: "white",
            cursor: "pointer",
            fontSize: 12,
          }}
          onClick={() =>
            signIn("credentials", {
              redirect: false,
              username: "seller-demo", // nom EXACT dans ta DB
              // ajoute ici password si ton provider en a besoin
            })
          }
        >
          Se connecter en seller-demo
        </button>

        {/* Déconnexion */}
        <button
          style={{
            padding: "6px 10px",
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(127,29,29,0.9)",
            color: "white",
            cursor: "pointer",
            fontSize: 12,
          }}
          onClick={() => signOut({ redirect: false })}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

"use client";

import { useSession } from "next-auth/react";

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
    </div>
  );
}

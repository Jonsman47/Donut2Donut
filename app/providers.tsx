"use client";

import { useEffect, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";

function ReferralManager() {
  const { status } = useSession();
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const code = url.searchParams.get("ref") || url.searchParams.get("code");
    if (code) {
      window.localStorage.setItem("d2d_referral_code", code);
      document.cookie = `d2d_referral_code=${code}; path=/; max-age=${60 * 60 * 24 * 30}`;
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (attempted) return;
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("d2d_referral_code");
    if (!stored) return;

    setAttempted(true);
    (async () => {
      try {
        const res = await fetch("/api/referrals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: stored }),
        });
        if (res.ok || res.status === 409) {
          window.localStorage.removeItem("d2d_referral_code");
          document.cookie = "d2d_referral_code=; Max-Age=0; path=/";
        } else {
          setAttempted(false);
        }
      } catch (err) {
        console.error("Failed to apply referral", err);
        setAttempted(false);
      }
    })();
  }, [attempted, status]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReferralManager />
      {children}
    </SessionProvider>
  );
}

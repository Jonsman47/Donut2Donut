"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/market", label: "Market" },
  { href: "/orders", label: "Orders" },
  { href: "/seller", label: "Seller" },
  { href: "/rules", label: "Rules" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-inner">
        <Link href="/" className="nav-logo">
          <span>Donut2Donut</span>
        </Link>

        <nav className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          {status === "loading" && (
            <button className="btn btn-ghost" disabled>
              Loading
            </button>
          )}
          {status === "unauthenticated" && (
            <button
              className="btn btn-ghost"
              onClick={() => signIn(undefined, { callbackUrl: "/" })}
            >
              Sign in
            </button>
          )}
          {status === "authenticated" && (
            <button
              className="btn btn-ghost"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </button>
          )}
          <span className="badge badge-good">Escrow On</span>
        </div>
      </div>
    </header>
  );
}

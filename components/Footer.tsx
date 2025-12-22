import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-links">
          <Link href="/market">Market</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/seller">Seller</Link>
          <Link href="/rules">Rules</Link>
        </div>
        <span>© {new Date().getFullYear()} Donut2Donut. Escrow-first marketplace.</span>
      </div>
    </footer>
  );
}

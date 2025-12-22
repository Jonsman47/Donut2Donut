import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="stack-6">
          <strong>Donut2Donut</strong>
          <span className="muted">Escrow-first trading for DonutSMP.</span>
        </div>
        <div className="footer-links">
          <Link className="nav-link" href="/market">
            Market
          </Link>
          <Link className="nav-link" href="/market/orders">
            Orders
          </Link>
          <Link className="nav-link" href="/rules">
            Rules
          </Link>
          <Link className="nav-link" href="/verify">
            Verify
          </Link>
        </div>
        <span className="muted">© {new Date().getFullYear()} Donut2Donut</span>
      </div>
    </footer>
  );
}

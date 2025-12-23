import Link from "next/link";
import HeroVideoBG from "@/components/HeroVideoBG";

export default function Hero() {
  return (
    <section className="section hero-section">
      <HeroVideoBG />
      <div className="container hero-content">
        <div className="hero-panel">
          <span className="kicker">Donut2Donut</span>
          <h1 className="h1">Donut Markets, escrow-first trades.</h1>
          <p className="p">
            Trade high-value items with escrow locked in, proof on delivery, and
            fast dispute handling.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary" href="/market">
              Start trading
            </Link>
            <Link className="btn btn-secondary" href="/rules">
              How escrow works
            </Link>
          </div>
          <div className="hero-pills">
            <span className="pill pill-primary">Escrow on</span>
            <span className="pill pill-secondary">Proof required</span>
            <span className="pill pill-muted">48h disputes</span>
          </div>
        </div>
      </div>
    </section>
  );
}

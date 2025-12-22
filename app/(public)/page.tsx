import Image from "next/image";
import Link from "next/link";
import { pickDonutImage } from "../../lib/donut-images";

export default function Home() {
  const heroImage = pickDonutImage(0);
  const accentImage = pickDonutImage(1);

  return (
    <div>
      <section className="section">
        <div className="container">
          <div className="hero">
            <div className="hero-grid" style={{ padding: "36px" }}>
              <div className="stack-20">
                <span className="kicker">Donut2Donut</span>
                <h1 className="h1">Trust-first trading for DonutSMP.</h1>
                <p className="p">
                  Escrow-backed listings with clear proof and fast resolution.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link className="btn btn-primary" href="/market">
                    Get started
                  </Link>
                  <Link className="btn btn-secondary" href="/rules">
                    Learn more
                  </Link>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span className="badge badge-primary">Escrow default</span>
                  <span className="badge">Verified sellers</span>
                  <span className="badge badge-accent">Dispute support</span>
                </div>
              </div>

              <div className="hero-visual">
                <Image
                  src={heroImage}
                  alt="Donut marketplace"
                  width={520}
                  height={420}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight section-muted">
        <div className="container">
          <div className="grid-3">
            {[
              {
                title: "Escrow by default",
                text: "Funds stay protected until delivery is confirmed.",
              },
              {
                title: "Proof-first delivery",
                text: "Clear evidence requirements reduce disputes.",
              },
              {
                title: "Transparent trust",
                text: "Verified profiles and visible reputation signals.",
              },
            ].map((card) => (
              <div key={card.title} className="card card-hover" style={{ padding: "24px" }}>
                <div className="stack-12">
                  <div className="h3">{card.title}</div>
                  <p className="p">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="social-strip">
            <div className="stack-6">
              <span className="kicker">Security</span>
              <div className="h3">Escrow coverage</div>
              <span className="p">100% protected funds</span>
            </div>
            <div className="stack-6">
              <span className="kicker">Speed</span>
              <div className="h3">Fast resolution</div>
              <span className="p">Clear dispute steps</span>
            </div>
            <div className="stack-6">
              <span className="kicker">Trust</span>
              <div className="h3">Verified sellers</div>
              <span className="p">Transparent profiles</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="card" style={{ padding: "36px" }}>
            <div className="grid-2" style={{ alignItems: "center" }}>
              <div className="stack-16">
                <span className="kicker">Get started</span>
                <div className="h2">Start trading with confidence.</div>
                <p className="p">
                  Post listings or browse the market with escrow protection.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link className="btn btn-primary" href="/market">
                    Open market
                  </Link>
                  <Link className="btn btn-secondary" href="/seller">
                    Become a seller
                  </Link>
                </div>
              </div>
              <div className="card-media">
                <Image
                  src={accentImage}
                  alt="Donut product"
                  width={480}
                  height={360}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

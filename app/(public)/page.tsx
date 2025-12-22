import Image from "next/image";
import Link from "next/link";
import { getDonutImage } from "@/lib/donut-images";

export default function Home() {
  return (
    <div>
      <section className="container section">
        <div className="hero fade-up">
          <div className="grid-2" style={{ alignItems: "center" }}>
            <div className="stack-10">
              <span className="kicker">Donut2Donut</span>
              <h1 className="h1">Trust-first trades for DonutSMP.</h1>
              <p className="p">
                Escrow by default, clear proofs, and a simple dispute flow built
                for fast, safe exchanges.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link className="btn btn-primary" href="/market">
                  Get started
                </Link>
                <Link className="btn btn-secondary" href="/rules">
                  Learn more
                </Link>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="badge badge-blue">Escrow on</span>
                <span className="badge">Proof required</span>
                <span className="badge">48h disputes</span>
              </div>
            </div>

            <div className="hero-image">
              <Image
                src={getDonutImage(2)}
                alt="Donut2Donut hero"
                width={900}
                height={700}
                style={{ width: "100%", height: "auto" }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container section-sm">
        <div className="grid-3">
          {[
            {
              title: "Escrow by default",
              copy: "Funds stay locked until delivery is confirmed.",
            },
            {
              title: "Proof-based delivery",
              copy: "Evidence-first workflows reduce disputes fast.",
            },
            {
              title: "Transparent reputations",
              copy: "Trust scores, reviews, and verified profiles.",
            },
          ].map((feature) => (
            <div key={feature.title} className="card card-hover" style={{ padding: 22 }}>
              <div className="stack-8">
                <span className="badge badge-blue">Feature</span>
                <h3 className="h3">{feature.title}</h3>
                <p className="p">{feature.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container section-sm">
        <div
          className="surface surface-strong"
          style={{ padding: 20, borderRadius: 20 }}
        >
          <div className="grid-3" style={{ textAlign: "center" }}>
            {[
              { label: "Active sellers", value: "1.2k" },
              { label: "Escrowed trades", value: "98%" },
              { label: "Avg dispute time", value: "< 24h" },
            ].map((stat) => (
              <div key={stat.label} className="stack-4">
                <div style={{ fontWeight: 700, fontSize: "1.4rem" }}>{stat.value}</div>
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="grid-2" style={{ alignItems: "center" }}>
          <div className="stack-8">
            <span className="kicker">How it works</span>
            <h2 className="h2">A simple, safe trading flow.</h2>
            <p className="p">
              Browse listings, pay securely, and exchange in-game with proof. If
              anything goes wrong, disputes are resolved with evidence.
            </p>
            <Link className="btn btn-primary" href="/market">
              Explore listings
            </Link>
          </div>
          <div className="grid-2">
            {[
              "Request & accept",
              "Escrowed payment",
              "Delivery + proof",
              "Confirmation or dispute",
            ].map((step, index) => (
              <div key={step} className="card" style={{ padding: 18 }}>
                <div className="stack-6">
                  <span className="badge badge-blue">0{index + 1}</span>
                  <div style={{ fontWeight: 600 }}>{step}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="surface surface-strong" style={{ padding: 32 }}>
          <div className="grid-2" style={{ alignItems: "center" }}>
            <div className="stack-8">
              <h2 className="h2">Ready to trade with confidence?</h2>
              <p className="p">
                Create a listing or browse verified sellers with escrow on by
                default.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/market">
                Browse market
              </Link>
              <Link className="btn btn-secondary" href="/seller/you">
                Become a seller
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

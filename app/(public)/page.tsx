"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div style={{ paddingTop: 86 }}>
      <section className="container section-tight">
        {/* HERO */}
        <div className="hero surface-strong border-grad glass fade-up">
          <div
            className="hero-inner"
            style={{
              display: "grid",
              gridTemplateColumns: "7fr 5fr",
              gap: 16,
              alignItems: "start",
            }}
          >
            <div className="crystal-glow" />

            {/* LEFT */}
            <div className="stack-10" style={{ minWidth: 0 }}>
              <div className="kicker">Donut2Donut • escrow-first marketplace</div>

              <h1
                className="h1"
                style={{
                  fontSize: "clamp(2.8rem, 5.0vw, 4.1rem)",
                  lineHeight: 1.02,
                  fontWeight: 950,
                  letterSpacing: "-0.035em",
                  maxWidth: 860,
                }}
              >
                Secure trading for DonutSMP.
              </h1>

              <p className="p" style={{ maxWidth: 720 }}>
                Escrow by default, proof-based delivery, and a structured dispute flow.
                Built for fast decisions and clean trust.
              </p>

              {/* SEARCH + CTAs */}
              <div className="surface glass" style={{ padding: 12 }}>
                <div className="stack-10">
                  <input
                    className="input"
                    placeholder="Search listings, sellers, services…"
                    aria-label="Search marketplace"
                  />

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <Link className="btn btn-primary" href="/market">
                      Browse market
                    </Link>
                    <Link className="btn btn-ghost" href="/market">
                      Create listing
                    </Link>

                    <span className="badge badge-good ring-glow">Escrow enabled</span>
                    <span className="badge badge-blue">Verified profiles</span>
                    <span className="badge">Audit logs</span>
                  </div>
                </div>
              </div>

              {/* TRUST GRID */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <div className="card card-hover">
                  <div style={{ padding: 14 }} className="stack-8">
                    <span className="badge badge-blue">Escrow</span>
                    <div className="h3">Funds held until confirmation</div>
                    <p className="p">
                      Payment stays locked during delivery. Release happens after confirmation or resolution.
                    </p>
                  </div>
                </div>

                <div className="card card-hover">
                  <div style={{ padding: 14 }} className="stack-8">
                    <span className="badge badge-blue">Proof</span>
                    <div className="h3">Proof-based delivery</div>
                    <p className="p">
                      Listings can require screenshots, timestamps, or server logs to reduce disputes.
                    </p>
                  </div>
                </div>

                <div className="card card-hover">
                  <div style={{ padding: 14 }} className="stack-8">
                    <span className="badge badge-blue">Trust</span>
                    <div className="h3">Reputation you can read</div>
                    <p className="p">
                      Verified sellers, delivery rate, dispute history, and review volume on every profile.
                    </p>
                  </div>
                </div>

                <div className="card card-hover">
                  <div style={{ padding: 14 }} className="stack-8">
                    <span className="badge badge-blue">Disputes</span>
                    <div className="h3">Structured dispute flow</div>
                    <p className="p">
                      Clear evidence, timelines, and outcomes. No messy back-and-forth across DMs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="stack-10" style={{ minWidth: 0 }}>
              <div className="surface glass border-grad" style={{ padding: 14 }}>
                <div className="stack-10">
                  <div className="kicker">Marketplace standard</div>
                  <div className="h2">Designed for trust-first decisions.</div>
                  <p className="p">
                    Consistent UI, clear seller signals, and an escrow flow that prevents common trading failures.
                  </p>

                  <div className="sep" />

                  <div className="stack-8">
                    <span className="badge badge-blue">Core guarantees</span>

                    <div className="surface" style={{ padding: 12 }}>
                      <div className="stack-4">
                        <div style={{ fontWeight: 900, color: "var(--txt0)" }}>Escrow default</div>
                        <div className="muted" style={{ fontSize: ".85rem" }}>
                          Funds are held until delivery is confirmed or resolved.
                        </div>
                      </div>
                    </div>

                    <div className="surface" style={{ padding: 12 }}>
                      <div className="stack-4">
                        <div style={{ fontWeight: 900, color: "var(--txt0)" }}>Evidence-first disputes</div>
                        <div className="muted" style={{ fontSize: ".85rem" }}>
                          Proof requirements and audit logs support fast resolution.
                        </div>
                      </div>
                    </div>

                    <div className="surface" style={{ padding: 12 }}>
                      <div className="stack-4">
                        <div style={{ fontWeight: 900, color: "var(--txt0)" }}>Verified identities</div>
                        <div className="muted" style={{ fontSize: ".85rem" }}>
                          Verified sellers and transparent trust signals on every listing.
                        </div>
                      </div>
                    </div>

                    <Link className="btn btn-primary btn-wide" href="/market">
                      Open market
                    </Link>
                  </div>
                </div>
              </div>

              <div className="surface glass" style={{ padding: 14 }}>
                <div className="stack-8">
                  <span className="badge">Flow</span>
                  <div className="muted" style={{ fontSize: ".9rem" }}>
                    Buyer pays → escrow holds → seller delivers + proof → buyer confirms → payout.
                  </div>
                </div>
              </div>
            </div>

            <style jsx>{`
              @media (max-width: 980px) {
                .hero-inner {
                  grid-template-columns: 1fr !important;
                }
              }
            `}</style>
          </div>
        </div>

        {/* HOW IT WORKS (THIS was dark — now wrapped in section-glow) */}
        <div className="section-tight">
          <div className="section-glow">
            <div className="stack-10">
              <div className="kicker">How it works</div>
              <h2 className="h2">Escrow workflow</h2>
              <p className="p" style={{ maxWidth: 780 }}>
                A simple, consistent process that reduces fraud and speeds up delivery confirmation.
              </p>

              <div className="grid-cards">
                <div className="card card-hover">
                  <div style={{ padding: 14 }} className="stack-8">
                    <span className="badge badge-blue">01</span>
                    <div className="h3">Payment is held in escrow</div>
                    <p className="p">Funds are locked while the seller completes delivery.</p>
                  </div>
                </div>

                <div className="card card-hover">
                  <div style={{ padding: 14 }} className="stack-8">
                    <span className="badge badge-blue">02</span>
                    <div className="h3">Seller delivers and submits proof</div>
                    <p className="p">
                      Proof requirements depend on the listing (screenshots, logs, timestamps).
                    </p>
                  </div>
                </div>

                <div className="card card-hover">
                  <div style={{ padding: 14 }} className="stack-8">
                    <span className="badge badge-blue">03</span>
                    <div className="h3">Confirmation or dispute resolution</div>
                    <p className="p">Buyer confirms delivery, or a dispute is resolved using evidence and logs.</p>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link className="btn btn-primary" href="/market">
                  Browse listings
                </Link>
                <Link className="btn btn-ghost" href="/market">
                  Create listing
                </Link>
                <span className="badge badge-good">Escrow enabled</span>
                <span className="badge">Audit logs</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

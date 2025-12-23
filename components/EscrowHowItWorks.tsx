import Image from "next/image";
import Link from "next/link";

const steps = [
  {
    title: "Order created",
    body: "Buyer pays → escrow locks instantly.",
    image: "/featured/spawner.webp",
  },
  {
    title: "Seller delivers",
    body: "Timer starts + proof is required.",
    image: "/featured/elytra.webp",
  },
  {
    title: "Buyer confirms",
    body: "One click releases escrow safely.",
    image: "/featured/sword.gif",
  },
  {
    title: "Auto-resolve",
    body: "Disputes use evidence + mod review.",
    image: "/featured/mace.png",
  },
];

const rules = [
  "Proof required for high-value trades",
  "Disputes open for 48h",
  "Escrow auto-releases after confirmation window",
];

export default function EscrowHowItWorks() {
  return (
    <section className="section escrow-section">
      <div className="container">
        <div className="section-header">
          <span className="kicker">How escrow works</span>
          <h2 className="h2">A safer flow for every trade.</h2>
          <p className="p">
            Every listing follows the same verified steps to keep both sides
            protected.
          </p>
        </div>
        <div className="escrow-steps">
          {steps.map((step, index) => (
            <div key={step.title} className="escrow-card glass-card">
              <div className="escrow-card-top">
                <span className="escrow-number">0{index + 1}</span>
                <span className="escrow-icon" aria-hidden="true" />
              </div>
              <div className="escrow-card-content">
                <h3 className="h3">{step.title}</h3>
                <p className="p">{step.body}</p>
              </div>
              <div className="escrow-card-image" aria-hidden="true">
                <Image src={step.image} alt="" width={160} height={160} />
              </div>
            </div>
          ))}
        </div>
        <div className="escrow-chips">
          {rules.map((rule) => (
            <span key={rule} className="pill pill-muted">
              {rule}
            </span>
          ))}
        </div>
        <div className="escrow-cta">
          <Link className="btn btn-secondary" href="/rules">
            Read escrow rules
          </Link>
        </div>
      </div>
    </section>
  );
}

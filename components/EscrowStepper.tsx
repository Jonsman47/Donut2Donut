import Link from "next/link";

const steps = [
  {
    title: "Order created",
    body: "Buyer pays → escrow locks funds instantly.",
  },
  {
    title: "Seller delivers",
    body: "Timer starts and proof is required.",
  },
  {
    title: "Buyer confirms",
    body: "One click releases escrow safely.",
  },
  {
    title: "Auto-resolve",
    body: "Disputes use evidence + mod review.",
  },
];

const rules = [
  "Proof required for high-value items",
  "Disputes open for 48h",
  "Escrow auto-releases after confirmation window",
];

export default function EscrowStepper() {
  return (
    <section className="container section">
      <div className="section-header">
        <span className="kicker">How escrow works</span>
        <h2 className="h2">Escrow workflow, clearer and faster.</h2>
        <p className="p">
          Every trade follows the same verified flow to keep buyers and sellers
          protected.
        </p>
      </div>
      <div className="card escrow-stepper">
        <div className="escrow-bar">
          {steps.map((step, index) => (
            <div key={step.title} className="escrow-node">
              <span className="pill pill-secondary">0{index + 1}</span>
            </div>
          ))}
        </div>
        <div className="grid-4 escrow-steps">
          {steps.map((step, index) => (
            <div key={step.title} className="escrow-step">
              <div className="stack-6">
                <div className="escrow-title">
                  0{index + 1}. {step.title}
                </div>
                <p className="p">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="escrow-rules">
        {rules.map((rule) => (
          <span key={rule} className="pill pill-muted">
            {rule}
          </span>
        ))}
      </div>
      <div className="escrow-cta">
        <Link className="btn btn-secondary" href="/rules">
          Full escrow rules
        </Link>
      </div>
    </section>
  );
}

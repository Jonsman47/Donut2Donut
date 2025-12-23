import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="section final-cta">
      <div className="container">
        <div className="final-cta-card glass-card">
          <div className="stack-10">
            <h2 className="h2">Ready to trade safely?</h2>
            <p className="p">Start a secure trade in under a minute.</p>
          </div>
          <Link className="btn btn-primary" href="/market">
            Get started
          </Link>
        </div>
      </div>
    </section>
  );
}

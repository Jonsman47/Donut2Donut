import Link from "next/link";

type Step =
  | "Created"
  | "Payment in escrow"
  | "Seller delivered proof"
  | "Buyer confirmed"
  | "Completed"
  | "Disputed";

const DEMO_ORDER = {
  id: "ord_92K1",
  title: "Rare DonutSMP kit bundle",
  priceLabel: "€19.99",
  seller: "demo_seller",
  buyer: "you",
  status: "Payment in escrow" as Step,
  steps: [
    { k: "Created", done: true, note: "Order placed successfully." },
    { k: "Payment in escrow", done: true, note: "Funds secured. Seller notified." },
    { k: "Seller delivered proof", done: false, note: "Waiting for seller proof." },
    { k: "Buyer confirmed", done: false, note: "Confirm delivery or open dispute." },
    { k: "Completed", done: false, note: "Funds released to seller." },
  ],
  disputeWindow: "48h",
};

export default async function OrderPage() {
  const o = DEMO_ORDER; // UI-only, swap later

  return (
    <div className="order">
      <section className="head">
        <div>
          <h1 className="title">Order {o.id}</h1>
          <p className="sub">
            Escrow protects both sides. Confirm delivery or dispute if something’s off.
          </p>
        </div>

        <div className="actions">
          <Link className="btn btn-soft" href="/orders">Back to orders</Link>
          <Link className="btn btn-primary" href={`/listing/1`}>View listing</Link>
        </div>
      </section>

      <section className="grid">
        {/* LEFT */}
        <div className="left">
          <div className="card">
            <div className="row">
              <div className="k">Item</div>
              <div className="v">{o.title}</div>
            </div>
            <div className="row">
              <div className="k">Seller</div>
              <div className="v">{o.seller}</div>
            </div>
            <div className="row">
              <div className="k">Buyer</div>
              <div className="v">{o.buyer}</div>
            </div>
            <div className="row">
              <div className="k">Dispute window</div>
              <div className="v">{o.disputeWindow}</div>
            </div>
          </div>

          <div className="card">
            <h2 className="h">Timeline</h2>

            <div className="timeline">
              {o.steps.map((s, i) => (
                <div key={i} className={`step ${s.done ? "done" : ""}`}>
                  <div className="dot" />
                  <div className="step-body">
                    <div className="step-title">{s.k}</div>
                    <div className="step-note">{s.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="h">Actions</h2>
            <div className="action-row">
              <button className="btn btn-primary">Confirm delivery</button>
              <button className="btn btn-warn">Open dispute</button>
            </div>
            <p className="muted">
              Confirm only if you received exactly what was listed.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <aside className="right">
          <div className="buy-card">
            <div className="price">{o.priceLabel}</div>
            <div className="pill on">Escrow ON</div>

            <div className="info">
              Funds are locked until confirmation.
              Seller is paid only after delivery is verified.
            </div>

            <div className="icons">
              <span>🔒 Secure</span>
              <span>🧾 Proof</span>
              <span>⚖️ Dispute</span>
            </div>
          </div>
        </aside>
      </section>

      <style jsx>{`
        .order{ display:flex; flex-direction:column; gap: 14px; }

        .head{
          display:flex; align-items:flex-end; justify-content:space-between; gap: 12px;
        }
        .title{ margin:0; font-size: 28px; font-weight: 950; }
        .sub{ margin: 6px 0 0; color: rgba(234,241,255,.72); font-size: 14px; }

        .actions{ display:flex; gap: 10px; flex-wrap: wrap; }

        .btn{
          border-radius: 16px; padding: 12px 14px; font-weight: 900; font-size: 13px;
          border: 1px solid rgba(120,170,255,.16); background: rgba(10,16,32,.44);
          color: rgba(234,241,255,.92); cursor:pointer; text-decoration:none;
        }
        .btn-primary{
          background: linear-gradient(180deg, rgba(120,220,255,.22), rgba(120,170,255,.12));
          border-color: rgba(120,220,255,.18);
        }
        .btn-soft{ background: rgba(120,170,255,.08); }
        .btn-warn{
          background: rgba(255,190,120,.08);
          border-color: rgba(255,190,120,.18);
        }

        .grid{
          display:grid; grid-template-columns: 1.4fr .8fr; gap: 14px;
        }

        .left{ display:flex; flex-direction:column; gap: 12px; }

        .card{
          border-radius: 22px; padding: 14px;
          background: rgba(10,16,32,.38);
          border: 1px solid rgba(120,170,255,.12);
          box-shadow: 0 16px 60px rgba(0,0,0,.26);
        }

        .row{
          display:flex; justify-content:space-between; padding: 8px 0;
          border-bottom: 1px solid rgba(120,170,255,.08);
        }
        .k{ color: rgba(234,241,255,.68); font-weight: 900; font-size: 12px; }
        .v{ font-weight: 950; }

        .h{ margin:0 0 8px; font-size: 16px; font-weight: 950; }

        .timeline{ display:flex; flex-direction:column; gap: 10px; margin-top: 8px; }
        .step{ display:flex; gap: 10px; }
        .step.done .dot{ background: rgba(120,220,255,.40); }
        .dot{
          width: 12px; height: 12px; border-radius: 999px;
          background: rgba(120,170,255,.18);
          margin-top: 4px; flex: 0 0 auto;
        }
        .step-title{ font-weight: 950; font-size: 13px; }
        .step-note{ color: rgba(234,241,255,.70); font-size: 12px; }

        .action-row{ display:flex; gap: 10px; flex-wrap: wrap; }
        .muted{ margin-top: 8px; color: rgba(234,241,255,.68); font-size: 12px; }

        .right{ position: sticky; top: 90px; height: fit-content; }

        .buy-card{
          border-radius: 24px; padding: 16px;
          background: linear-gradient(180deg, rgba(14,22,40,.62), rgba(14,22,40,.46));
          border: 1px solid rgba(120,170,255,.18);
          box-shadow: 0 24px 100px rgba(0,0,0,.40);
          display:flex; flex-direction:column; gap: 12px;
        }
        .price{ font-size: 26px; font-weight: 950; }
        .pill{
          padding: 7px 10px; border-radius: 999px; font-weight: 900; font-size: 12px;
          border: 1px solid rgba(120,170,255,.14); background: rgba(10,16,32,.32);
          width: fit-content;
        }
        .on{ background: rgba(120,220,255,.10); }
        .info{ font-size: 12px; color: rgba(234,241,255,.70); line-height: 1.4; }
        .icons{ display:flex; justify-content:space-between; font-size: 12px; color: rgba(234,241,255,.70); }

        @media (max-width: 900px){
          .grid{ grid-template-columns: 1fr; }
          .right{ position: static; }
        }
      `}</style>
    </div>
  );
}

"use client";

import Link from "next/link";

const RULE_SECTIONS = [
  {
    title: "Escrow is always ON",
    items: [
      "Buyer pays → funds are locked.",
      "Seller gets paid only after delivery is confirmed.",
      "If the buyer doesn’t confirm, they can dispute within 48h.",
    ],
  },
  {
    title: "Proof is required to get paid",
    items: [
      "Seller must upload proof that matches the listing rules.",
      "No proof = no release.",
      "Edited/fake proof = instant penalties.",
    ],
  },
  {
    title: "Listings must be clear",
    items: [
      "Write exactly what the buyer receives.",
      "No vague promises, no “trust me”.",
      "If it’s not written, it doesn’t count in a dispute.",
    ],
  },
  {
    title: "Disputes (48h)",
    items: [
      "Dispute must be opened within 48 hours of delivery mark/proof.",
      "Staff reviews evidence: listing text + proof + chat/logs.",
      "If seller broke rules → refund. If buyer lies → seller gets paid.",
    ],
  },
  {
    title: "No scams / no chargeback abuse",
    items: [
      "Attempting to scam = ban + funds locked.",
      "Chargeback abuse = permanent ban + evidence logged.",
      "We keep activity logs for review when disputes happen.",
    ],
  },
  {
    title: "Trust levels",
    items: [
      "Trust % increases with successful completed orders.",
      "Verified badge requires staff verification.",
      "Top sellers are ranked higher and get extra visibility.",
    ],
  },
];

export default function RulesPage() {
  return (
    <div className="rules">
      <section className="head">
        <div>
          <h1 className="title">Marketplace rules</h1>
          <p className="sub">
            Clear, simple, enforceable. No corporate essay.
          </p>
        </div>

        <div className="actions">
          <Link className="btn btn-soft" href="/market">
            Browse Market
          </Link>
          <Link className="btn btn-primary" href="/seller/new">
            Create Listing
          </Link>
        </div>
      </section>

      <section className="banner">
        <div className="banner-card">
          <div className="banner-top">
            <div className="dot" />
            <div>
              <div className="banner-title">Main rule</div>
              <div className="banner-sub">
                Seller gets paid after delivery is confirmed — that’s the whole point.
              </div>
            </div>
          </div>

          <div className="pills">
            <span className="pill on">Escrow ON</span>
            <span className="pill dim">Proof required</span>
            <span className="pill dim">Dispute 48h</span>
            <span className="pill dim">Logs kept</span>
          </div>
        </div>
      </section>

      <section className="grid">
        {RULE_SECTIONS.map((sec) => (
          <div key={sec.title} className="card">
            <h2 className="h">{sec.title}</h2>
            <ul className="list">
              {sec.items.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="footerNote">
        <div className="noteCard">
          <div className="noteTitle">If you’re unsure</div>
          <div className="noteText">
            Write the listing clearer. Set proof rules. Keep chat/logs. You’ll be fine.
          </div>

          <div className="noteActions">
            <Link className="btn btn-primary" href="/seller/new">
              Make a listing
            </Link>
            <Link className="btn btn-ghost" href="/orders">
              Track orders
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .rules{ display:flex; flex-direction:column; gap: 14px; }

        .head{
          display:flex;
          align-items:flex-end;
          justify-content:space-between;
          gap: 12px;
        }
        .title{ margin:0; font-size: 28px; font-weight: 950; letter-spacing: -.4px; }
        .sub{ margin: 6px 0 0; color: rgba(234,241,255,.72); font-size: 14px; }

        .actions{
          display:flex; gap: 10px; flex-wrap: wrap; justify-content:flex-end;
        }

        .btn{
          text-decoration:none;
          border-radius: 16px;
          padding: 12px 14px;
          font-weight: 900;
          font-size: 13px;
          border: 1px solid rgba(120,170,255,.16);
          display:inline-flex;
          align-items:center;
          justify-content:center;
          transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
          user-select:none;
          color: rgba(234,241,255,.92);
          background: rgba(10,16,32,.44);
        }
        .btn:hover{ transform: translateY(-1px); }
        .btn-primary{
          background: linear-gradient(180deg, rgba(120,220,255,.22), rgba(120,170,255,.12));
          border-color: rgba(120,220,255,.18);
          box-shadow: 0 18px 70px rgba(0,0,0,.30);
        }
        .btn-ghost{ background: rgba(10,16,32,.44); }
        .btn-soft{ background: rgba(120,170,255,.08); }

        .banner-card{
          border-radius: 24px;
          border: 1px solid rgba(120,170,255,.14);
          background:
            radial-gradient(900px 420px at 20% 20%, rgba(120,220,255,.12), transparent 60%),
            linear-gradient(180deg, rgba(14,22,40,.56), rgba(14,22,40,.44));
          box-shadow: 0 22px 90px rgba(0,0,0,.36);
          padding: 16px 16px;
          display:flex;
          flex-direction:column;
          gap: 12px;
        }

        .banner-top{ display:flex; gap: 12px; align-items:flex-start; }
        .dot{
          width: 12px; height: 12px; border-radius: 999px;
          background: rgba(120,220,255,.22);
          box-shadow: 0 0 30px rgba(120,220,255,.14);
          margin-top: 6px;
          flex: 0 0 auto;
        }
        .banner-title{ font-weight: 950; font-size: 14px; }
        .banner-sub{ margin-top: 4px; color: rgba(234,241,255,.70); font-size: 13px; }

        .pills{ display:flex; gap: 8px; flex-wrap: wrap; }
        .pill{
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid rgba(120,170,255,.14);
          font-weight: 900;
          font-size: 12px;
          background: rgba(10,16,32,.32);
        }
        .on{ background: rgba(120,220,255,.10); }
        .dim{ opacity: .86; }

        .grid{
          display:grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .card{
          border-radius: 22px;
          padding: 14px;
          background: rgba(10,16,32,.38);
          border: 1px solid rgba(120,170,255,.12);
          box-shadow: 0 16px 60px rgba(0,0,0,.26);
        }

        .h{ margin:0 0 8px; font-size: 16px; font-weight: 950; }
        .list{
          margin:0;
          padding-left: 18px;
          display:flex;
          flex-direction:column;
          gap: 8px;
          color: rgba(234,241,255,.74);
          font-weight: 750;
          font-size: 13px;
          line-height: 1.35;
        }

        .noteCard{
          border-radius: 24px;
          border: 1px solid rgba(120,170,255,.14);
          background:
            radial-gradient(900px 420px at 20% 20%, rgba(120,220,255,.12), transparent 60%),
            linear-gradient(180deg, rgba(14,22,40,.56), rgba(14,22,40,.44));
          box-shadow: 0 22px 90px rgba(0,0,0,.36);
          padding: 16px 16px;
        }

        .noteTitle{ font-weight: 950; font-size: 14px; }
        .noteText{ margin-top: 6px; color: rgba(234,241,255,.70); font-size: 13px; }
        .noteActions{ margin-top: 12px; display:flex; gap: 10px; flex-wrap: wrap; justify-content:flex-end; }

        @media (max-width: 980px){
          .grid{ grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

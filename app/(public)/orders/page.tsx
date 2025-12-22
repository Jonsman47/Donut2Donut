"use client";

import Link from "next/link";

type OrderStatus = "Pending" | "In Escrow" | "Delivered" | "Disputed" | "Completed";

type OrderRow = {
  id: string;
  title: string;
  priceLabel: string;
  seller: string;
  status: OrderStatus;
  updated: string;
};

const UI_ONLY_ORDERS: OrderRow[] = [
  {
    id: "ord_92K1",
    title: "Rare DonutSMP kit bundle",
    priceLabel: "€19.99",
    seller: "demo_seller",
    status: "In Escrow",
    updated: "Today",
  },
  {
    id: "ord_41Q7",
    title: "PvP coaching (60 minutes)",
    priceLabel: "€12.00",
    seller: "coach_kai",
    status: "Pending",
    updated: "Yesterday",
  },
  {
    id: "ord_18Z2",
    title: "Overlay + HUD pack (HD)",
    priceLabel: "€7.50",
    seller: "edit_lab",
    status: "Delivered",
    updated: "2 days ago",
  },
];

function statusTone(status: OrderStatus) {
  if (status === "In Escrow") return "tone-blue";
  if (status === "Pending") return "tone-dim";
  if (status === "Delivered") return "tone-ok";
  if (status === "Disputed") return "tone-warn";
  return "tone-ok";
}

export default function OrdersPage() {
  const orders = UI_ONLY_ORDERS; // later: swap to real data source

  return (
    <div className="orders">
      <section className="head">
        <div>
          <h1 className="title">Orders</h1>
          <p className="sub">
            Track escrow, proof, delivery, and disputes in one place.
          </p>
        </div>

        <div className="actions">
          <Link className="btn btn-soft" href="/market">
            Browse Market
          </Link>
          <Link className="btn btn-primary" href="/seller">
            Create Listing
          </Link>
        </div>
      </section>

      {/* SUMMARY */}
      <section className="summary">
        <div className="sum-card">
          <div className="k">Active</div>
          <div className="v">{orders.length}</div>
          <div className="m">Orders you’re currently tracking.</div>
        </div>
        <div className="sum-card">
          <div className="k">Escrow</div>
          <div className="v">ON</div>
          <div className="m">Funds held until confirmation.</div>
        </div>
        <div className="sum-card">
          <div className="k">Dispute window</div>
          <div className="v">48h</div>
          <div className="m">Open dispute if something’s off.</div>
        </div>
      </section>

      {/* TABLE */}
      <section className="table-wrap">
        <div className="table-head">
          <div className="th">Order</div>
          <div className="th hide-sm">Seller</div>
          <div className="th">Status</div>
          <div className="th hide-sm">Updated</div>
          <div className="th right">Total</div>
        </div>

        {orders.map((o) => (
          <Link key={o.id} href={`/orders/${o.id}`} className="row">
            <div className="cell">
              <div className="order-title">{o.title}</div>
              <div className="order-id">{o.id}</div>
            </div>

            <div className="cell hide-sm">
              <span className="seller">{o.seller}</span>
            </div>

            <div className="cell">
              <span className={`status ${statusTone(o.status)}`}>{o.status}</span>
            </div>

            <div className="cell hide-sm">
              <span className="muted">{o.updated}</span>
            </div>

            <div className="cell right">
              <span className="price">{o.priceLabel}</span>
            </div>
          </Link>
        ))}
      </section>

      {/* EMPTY STATE (keep this for later real backend) */}
      <section className="empty">
        <div className="empty-card">
          <div className="empty-top">
            <div className="dot" />
            <div>
              <div className="empty-title">Real orders will show here</div>
              <div className="empty-sub">
                When backend is live, this page becomes your order timeline.
              </div>
            </div>
          </div>

          <div className="empty-actions">
            <Link className="btn btn-primary" href="/market">
              Find something to buy
            </Link>
            <Link className="btn btn-ghost" href="/seller">
              Start selling
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .orders{
          display:flex;
          flex-direction:column;
          gap: 14px;
        }

        .head{
          display:flex;
          align-items:flex-end;
          justify-content:space-between;
          gap: 12px;
        }

        .title{
          margin:0;
          font-size: 28px;
          font-weight: 950;
          letter-spacing: -.4px;
        }

        .sub{
          margin: 6px 0 0;
          color: rgba(234,241,255,.72);
          font-size: 14px;
        }

        .actions{
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content:flex-end;
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
        }
        .btn:hover{ transform: translateY(-1px); }
        .btn-primary{
          background: linear-gradient(180deg, rgba(120,220,255,.22), rgba(120,170,255,.12));
          box-shadow:
            0 18px 70px rgba(0,0,0,.30),
            0 0 0 1px rgba(120,220,255,.10) inset;
          border-color: rgba(120,220,255,.18);
        }
        .btn-ghost{ background: rgba(10,16,32,.44); }
        .btn-soft{ background: rgba(120,170,255,.08); }

        .summary{
          display:grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
        .sum-card{
          border-radius: 20px;
          padding: 12px 12px;
          background: rgba(10,16,32,.38);
          border: 1px solid rgba(120,170,255,.12);
          box-shadow: 0 16px 60px rgba(0,0,0,.24);
        }
        .k{
          color: rgba(234,241,255,.68);
          font-weight: 900;
          font-size: 12px;
        }
        .v{
          margin-top: 6px;
          font-weight: 950;
          font-size: 18px;
        }
        .m{
          margin-top: 6px;
          color: rgba(234,241,255,.70);
          font-size: 12px;
          line-height: 1.35;
        }

        .table-wrap{
          border-radius: 22px;
          overflow:hidden;
          background: rgba(10,16,32,.34);
          border: 1px solid rgba(120,170,255,.12);
          box-shadow: 0 18px 70px rgba(0,0,0,.26);
        }

        .table-head{
          display:grid;
          grid-template-columns: 2.2fr 1.2fr 1.2fr 1fr .9fr;
          gap: 10px;
          padding: 12px 12px;
          background: rgba(14,22,40,.62);
          border-bottom: 1px solid rgba(120,170,255,.10);
        }

        .th{
          font-weight: 950;
          font-size: 12px;
          color: rgba(234,241,255,.78);
          letter-spacing: .2px;
          text-transform: uppercase;
        }

        .row{
          text-decoration:none;
          color: inherit;
          display:grid;
          grid-template-columns: 2.2fr 1.2fr 1.2fr 1fr .9fr;
          gap: 10px;
          padding: 12px 12px;
          border-bottom: 1px solid rgba(120,170,255,.08);
          transition: background .12s ease, transform .12s ease;
        }

        .row:hover{
          background: rgba(120,170,255,.06);
          transform: translateY(-1px);
        }

        .cell{
          display:flex;
          align-items:center;
          gap: 10px;
          min-width: 0;
        }

        .order-title{
          font-weight: 950;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .order-id{
          margin-top: 4px;
          font-size: 12px;
          color: rgba(234,241,255,.62);
          font-weight: 850;
        }

        .seller{
          font-weight: 900;
          color: rgba(234,241,255,.84);
        }

        .muted{
          color: rgba(234,241,255,.68);
          font-weight: 850;
          font-size: 12px;
        }

        .status{
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(120,170,255,.14);
          background: rgba(10,16,32,.34);
          font-weight: 950;
          font-size: 12px;
          white-space: nowrap;
        }

        .tone-blue{
          border-color: rgba(120,220,255,.22);
          background: rgba(120,220,255,.10);
        }
        .tone-ok{
          border-color: rgba(140,255,210,.16);
          background: rgba(140,255,210,.06);
        }
        .tone-warn{
          border-color: rgba(255,190,120,.18);
          background: rgba(255,190,120,.06);
        }
        .tone-dim{
          opacity: .86;
        }

        .price{
          font-weight: 950;
          font-size: 13px;
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(120,220,255,.18);
          background: rgba(120,220,255,.08);
        }

        .right{ justify-content:flex-end; }

        .empty{
          padding-top: 6px;
        }

        .empty-card{
          border-radius: 24px;
          border: 1px solid rgba(120,170,255,.14);
          background:
            radial-gradient(900px 420px at 20% 20%, rgba(120,220,255,.12), transparent 60%),
            linear-gradient(180deg, rgba(14,22,40,.56), rgba(14,22,40,.44));
          box-shadow: 0 22px 90px rgba(0,0,0,.36);
          padding: 16px 16px;
          display:flex;
          flex-direction:column;
          gap: 14px;
        }

        .empty-top{
          display:flex;
          gap: 12px;
          align-items:flex-start;
        }

        .dot{
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: rgba(120,220,255,.22);
          box-shadow: 0 0 30px rgba(120,220,255,.14);
          margin-top: 6px;
          flex: 0 0 auto;
        }

        .empty-title{
          font-weight: 950;
          font-size: 14px;
        }

        .empty-sub{
          margin-top: 4px;
          color: rgba(234,241,255,.70);
          font-size: 13px;
          line-height: 1.35;
        }

        .empty-actions{
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content:flex-end;
        }

        @media (max-width: 900px){
          .summary{ grid-template-columns: 1fr; }
          .table-head, .row{
            grid-template-columns: 2fr 1.2fr .9fr;
          }
          .hide-sm{ display:none; }
        }
      `}</style>
    </div>
  );
}

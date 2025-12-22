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
  if (status === "In Escrow") return "badge-blue";
  if (status === "Pending") return "badge";
  if (status === "Delivered") return "badge-good";
  if (status === "Disputed") return "badge-warn";
  return "badge-good";
}

export default function OrdersPage() {
  const orders = UI_ONLY_ORDERS;

  return (
    <div>
      <section className="container section">
        <div className="stack-18">
          <div className="surface surface-strong" style={{ padding: 24 }}>
            <div className="grid-2" style={{ alignItems: "center" }}>
              <div className="stack-8">
                <span className="kicker">Orders</span>
                <h1 className="h2">Track your trades</h1>
                <p className="p">
                  Monitor escrow, proof, delivery, and dispute timelines in one
                  place.
                </p>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link className="btn btn-secondary" href="/market">
                  Browse market
                </Link>
                <Link className="btn btn-primary" href="/seller">
                  Create listing
                </Link>
              </div>
            </div>
          </div>

          <div className="grid-3">
            <div className="surface" style={{ padding: 18 }}>
              <div className="stack-6">
                <span className="kicker">Active</span>
                <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>
                  {orders.length}
                </div>
                <p className="p">Orders you’re currently tracking.</p>
              </div>
            </div>
            <div className="surface" style={{ padding: 18 }}>
              <div className="stack-6">
                <span className="kicker">Escrow</span>
                <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>On</div>
                <p className="p">Funds stay locked until confirmation.</p>
              </div>
            </div>
            <div className="surface" style={{ padding: 18 }}>
              <div className="stack-6">
                <span className="kicker">Dispute window</span>
                <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>48h</div>
                <p className="p">Open a dispute if something feels off.</p>
              </div>
            </div>
          </div>

          <div className="surface" style={{ padding: 18 }}>
            <div className="stack-10">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.4fr 1.2fr 1.1fr 1fr",
                  gap: 12,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                }}
              >
                <span>Order</span>
                <span>Seller</span>
                <span>Status</span>
                <span style={{ textAlign: "right" }}>Total</span>
              </div>
              <div className="sep" />
              <div className="stack-6">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="surface"
                    style={{
                      padding: 14,
                      display: "grid",
                      gridTemplateColumns: "2.4fr 1.2fr 1.1fr 1fr",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div className="stack-4">
                      <span style={{ fontWeight: 600 }}>{order.title}</span>
                      <span className="muted" style={{ fontSize: "0.8rem" }}>
                        {order.id} • {order.updated}
                      </span>
                    </div>
                    <span className="muted">{order.seller}</span>
                    <span className={`badge ${statusTone(order.status)}`}>
                      {order.status}
                    </span>
                    <span style={{ textAlign: "right", fontWeight: 600 }}>
                      {order.priceLabel}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="surface" style={{ padding: 18 }}>
            <div className="stack-8">
              <span className="kicker">Coming soon</span>
              <p className="p">
                Real orders will appear here once the backend timeline is live.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link className="btn btn-primary" href="/market">
                  Find something to buy
                </Link>
                <Link className="btn btn-ghost" href="/seller">
                  Start selling
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

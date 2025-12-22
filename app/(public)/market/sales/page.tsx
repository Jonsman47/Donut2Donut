import OrderList from "@/components/OrderList";

export default function MarketSalesPage() {
  return (
    <section className="container section">
      <div className="stack-16">
        <div className="stack-6">
          <span className="kicker">Sales</span>
          <h1 className="h2">Orders on your listings</h1>
          <p className="p">Accept or fulfill orders placed on your listings.</p>
        </div>
        <OrderList role="seller" />
      </div>
    </section>
  );
}

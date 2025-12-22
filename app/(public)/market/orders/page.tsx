import OrderList from "@/components/OrderList";

export default function MarketOrdersPage() {
  return (
    <section className="container section">
      <div className="stack-16">
        <div className="stack-6">
          <span className="kicker">Orders</span>
          <h1 className="h2">Your orders</h1>
          <p className="p">Track your purchases, see statuses, and keep in touch with sellers.</p>
        </div>
        <OrderList role="buyer" />
      </div>
    </section>
  );
}

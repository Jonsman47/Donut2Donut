import OrderDetails from "@/components/OrderDetails";

export default function MarketOrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  return (
    <section className="container section">
      <div className="stack-16">
        <div className="stack-6">
          <span className="kicker">Order details</span>
          <h1 className="h2">Track your order</h1>
        </div>
        <OrderDetails orderId={params.orderId} />
      </div>
    </section>
  );
}

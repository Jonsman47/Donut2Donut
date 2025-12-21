import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function SellerOrders() {
  const session = await getServerSession(authOptions);
  const uid = (session as any)?.uid as string | undefined;
  if (!uid) return <div className="card">Login first.</div>;

  const orders = await db.order.findMany({
    where: { sellerId: uid },
    orderBy: { createdAt: "desc" },
    include: { listing: true, buyer: true, deliveryProofs: true },
    take: 50,
  });

  return (
    <div className="card">
      <h1 style={{marginTop:0}}>Orders (seller)</h1>
      <div className="small">MVP: accept within 24h, submit proof, schedule trades.</div>
      <div style={{display:"grid", gap:10, marginTop:12}}>
        {orders.map(o => (
          <div key={o.id} className="card" style={{background:"#0b0b0b"}}>
            <b>{o.listing.title}</b>
            <div className="small">Buyer: @{o.buyer.username} • Status: {o.status}</div>
            <div className="small">Safe trade code: <b>{o.safeTradeCode}</b></div>
            <div className="small">Proofs: {o.deliveryProofs.length}</div>
          </div>
        ))}
        {orders.length === 0 && <div className="small">No orders yet.</div>}
      </div>
    </div>
  );
}

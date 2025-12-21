import Link from "next/link";
import { db } from "@/lib/db";
import { eur } from "@/lib/policies";

type SP = { searchParams: Record<string, string | string[] | undefined> };

export default async function Cart({ searchParams }: SP) {
  const add = typeof searchParams.add === "string" ? searchParams.add : "";
  const ids = add ? [add] : [];
  const items = ids.length ? await db.listing.findMany({ where: { id: { in: ids } } }) : [];

  return (
    <div className="card">
      <h1 style={{marginTop:0}}>Cart</h1>
      {items.length === 0 ? (
        <div className="small">Your cart is empty. Add a listing first.</div>
      ) : (
        <div style={{display:"grid", gap:10}}>
          {items.map(i => (
            <div key={i.id} className="card" style={{background:"#0b0b0b"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}>
                <div style={{fontWeight:800}}>{i.title}</div>
                <div className="pill">{eur(i.priceCents)} €</div>
              </div>
              <div className="small">{i.deliveryType}</div>
              <div style={{marginTop:10}}>
                <Link className="btn" href={`/checkout?listingId=${i.id}`}>Checkout</Link>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{marginTop:12}}>
        <Link className="btn2" href="/market">Browse more</Link>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { eur } from "@/lib/policies";

export default async function SellerListings() {
  const session = await getServerSession(authOptions);
  const uid = (session as any)?.uid as string | undefined;
  if (!uid) return <div className="card">Login first.</div>;

  const listings = await db.listing.findMany({ where: { sellerId: uid }, orderBy: { createdAt: "desc" }, include: { category: true } });

  return (
    <div className="card">
      <h1 style={{marginTop:0}}>Your listings</h1>
      <div className="small">MVP: create listings via seed or direct DB. Next step: wizard form.</div>
      <div style={{marginTop:12, display:"grid", gap:10}}>
        {listings.map(l => (
          <div key={l.id} className="card" style={{background:"#0b0b0b"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}>
              <div><b>{l.title}</b> <span className="small">({l.category.name})</span></div>
              <div className="pill">{eur(l.priceCents)} €</div>
            </div>
            <div className="small">{l.deliveryType} • escrow {l.escrowOnly ? "ON" : "OFF"} • active {l.active ? "YES" : "NO"}</div>
            <div className="small">ID: {l.id}</div>
            <div style={{marginTop:10}}>
              <Link className="btn2" href={`/listing/${l.id}`}>View</Link>
            </div>
          </div>
        ))}
        {listings.length === 0 && <div className="small">No listings yet.</div>}
      </div>
    </div>
  );
}

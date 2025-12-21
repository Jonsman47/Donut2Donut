import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const uid = (session as any)?.uid as string | undefined;
  if (!uid) return <div className="card">Login first.</div>;

  const user = await db.user.findUnique({ where: { id: uid }, include: { sellerProfile: true } });

  return (
    <div style={{display:"grid", gap:12}}>
      <div className="card">
        <h1 style={{marginTop:0}}>Seller dashboard</h1>
        <div className="small">Create listings, manage orders, analytics, coupons.</div>
        <div style={{display:"flex", gap:10, flexWrap:"wrap", marginTop:12}}>
          <Link className="btn2" href="/dashboard/listings">Listings</Link>
          <Link className="btn2" href="/dashboard/orders">Orders</Link>
          <Link className="btn2" href="/dashboard/analytics">Analytics</Link>
          <Link className="btn2" href="/dashboard/coupons">Coupons</Link>
          <Link className="btn2" href="/dashboard/settings">Settings</Link>
        </div>
      </div>

      {!user?.sellerProfile ? (
        <div className="card">
          <b>You are not a seller yet.</b>
          <div className="small">Run seed to create a demo seller, or create a SellerProfile row for your user.</div>
        </div>
      ) : (
        <div className="card">
          <div className="small">Trust {user.sellerProfile.trustLevel}/5 • Listing limit {user.sellerProfile.listingLimit} • Max price {(user.sellerProfile.maxPriceCents/100).toFixed(2)}€</div>
        </div>
      )}
    </div>
  );
}

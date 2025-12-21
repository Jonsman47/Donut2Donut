"use client";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getListingById } from "@/lib/demo";

type PageProps = {
  params: { id: string };
};

export default async function ListingPage({ params }: PageProps) {
  const listing = await getListingById(params.id);
  if (!listing) return notFound();

  return (
    <div className="listing-page">
      {/* MAIN GRID */}
      <section className="listing-grid">
        {/* LEFT */}
        <div className="listing-left">
          <div className="media-card">
            <div className="media">
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                width={1400}
                height={900}
                className="media-img"
                priority
              />
            </div>
          </div>

          <div className="card">
            <h1 className="title">{listing.title}</h1>
            <p className="muted">
              Payment is held in escrow. Seller must upload proof. You confirm or dispute.
            </p>

            <div className="headline-row">
              <span className="pill on">Escrow ON</span>
              <span className="pill dim">Dispute: 48h</span>
              <span className="pill dim">{listing.delivery}</span>
              {listing.tags?.[0] ? <span className="pill dim">{listing.tags[0]}</span> : null}
            </div>
          </div>

          <div className="card">
            <h2 className="h">What you receive</h2>
            <ul className="list">
              <li>Exactly what’s listed (no bait swaps)</li>
              <li>Delivery via agreed method</li>
              <li>Proof uploaded by seller</li>
              <li>Dispute window if something’s off</li>
            </ul>
          </div>

          <div className="card">
            <h2 className="h">Delivery & rules</h2>

            <div className="kv">
              <span>Delivery</span>
              <strong>{listing.delivery}</strong>
            </div>

            <div className="kv">
              <span>Seller proof required</span>
              <strong>Yes</strong>
            </div>

            <div className="kv">
              <span>Escrow release</span>
              <strong>After confirmation</strong>
            </div>

            <div className="kv">
              <span>Dispute window</span>
              <strong>48 hours</strong>
            </div>
          </div>

          <div className="card">
            <h2 className="h">Seller</h2>

            <div className="seller-card">
              <div className="avatar" />
              <div className="seller-meta">
                <div className="seller-name">{listing.sellerName}</div>
                <div className="seller-sub">
                  {listing.trustPercent}% trust • {listing.reviewCount} reviews
                </div>
              </div>

              {listing.sellerVerified ? (
                <span className="badge verify">Verified</span>
              ) : (
                <span className="badge dimBadge">Standard</span>
              )}
            </div>

            <div className="seller-grid">
              <div className="seller-stat">
                <div className="k">Trust</div>
                <div className="v">{listing.trustPercent}%</div>
              </div>
              <div className="seller-stat">
                <div className="k">Reviews</div>
                <div className="v">{listing.reviewCount}</div>
              </div>
              <div className="seller-stat">
                <div className="k">Delivery</div>
                <div className="v">{listing.delivery}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="h">Reviews (demo)</h2>
            <div className="review">
              <div className="r-top">
                <strong>buyer_neo</strong>
                <span className="r-pill">Verified purchase</span>
              </div>
              <p className="r-text">
                Clean delivery. Proof was instant. Felt safe.
              </p>
            </div>
            <div className="review">
              <div className="r-top">
                <strong>skullbyte</strong>
                <span className="r-pill">Fast</span>
              </div>
              <p className="r-text">
                Got it quick. Would buy again.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <aside className="listing-right">
          <div className="buy-card">
            <div className="price">{listing.priceLabel}</div>

            <div className="qty">
              <button aria-label="Decrease quantity">-</button>
              <input aria-label="Quantity" defaultValue={1} />
              <button aria-label="Increase quantity">+</button>
            </div>

            <button className="buy-btn">Buy now</button>

            <div className="safe">
              <span className="pill on">Escrow ON</span>
              <span className="pill dim">Dispute 48h</span>
              <span className="pill dim">Proof required</span>
            </div>

            <div className="icons">
              <span>🔒 Secure</span>
              <span>⚡ Fast</span>
              <span>🛡️ Protected</span>
            </div>

            <div className="note">
              Seller gets paid after delivery is confirmed. If something’s off, dispute within 48h.
            </div>
          </div>
        </aside>
      </section>

      {/* MOBILE STICKY BUY */}
      <div className="mobile-buy">
        <div className="mobile-price">{listing.priceLabel}</div>
        <button className="mobile-btn">Buy now</button>
      </div>

      <style jsx>{`
        .listing-page{
          display:flex;
          flex-direction:column;
          gap: 16px;
        }

        .listing-grid{
          display:grid;
          grid-template-columns: 1.4fr .8fr;
          gap: 14px;
        }

        .listing-left{
          display:flex;
          flex-direction:column;
          gap: 12px;
        }

        .media-card{
          border-radius: 24px;
          overflow:hidden;
          border: 1px solid rgba(120,170,255,.14);
          background: rgba(14,22,40,.54);
          box-shadow: 0 24px 90px rgba(0,0,0,.38);
        }

        .media{
          height: 320px;
          overflow:hidden;
        }

        .media-img{
          width:100%;
          height:100%;
          object-fit:cover;
          filter: blur(1px) saturate(1.05);
          transform: scale(1.06);
        }

        .card{
          border-radius: 22px;
          padding: 14px;
          background: rgba(10,16,32,.38);
          border: 1px solid rgba(120,170,255,.12);
          box-shadow: 0 16px 60px rgba(0,0,0,.26);
        }

        .title{
          margin:0;
          font-size: 22px;
          font-weight: 950;
        }

        .muted{
          color: rgba(234,241,255,.70);
          margin-top: 6px;
          font-size: 14px;
        }

        .headline-row{
          display:flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .h{
          margin:0 0 8px;
          font-size: 16px;
          font-weight: 950;
        }

        .list{
          padding-left: 18px;
          margin:0;
          display:flex;
          flex-direction:column;
          gap: 6px;
        }

        .kv{
          display:flex;
          justify-content:space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(120,170,255,.08);
        }

        .seller-card{
          display:flex;
          align-items:center;
          gap: 10px;
        }

        .avatar{
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 30%, rgba(120,220,255,.24), rgba(10,16,32,.6));
          border: 1px solid rgba(120,170,255,.18);
        }

        .seller-name{
          font-weight: 950;
        }

        .seller-sub{
          font-size: 12px;
          color: rgba(234,241,255,.70);
        }

        .badge{
          margin-left:auto;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(120,170,255,.16);
          font-weight: 900;
          font-size: 12px;
          background: rgba(10,16,32,.34);
        }

        .verify{
          background: rgba(120,220,255,.10);
        }

        .dimBadge{
          opacity: .85;
        }

        .seller-grid{
          display:grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 8px;
          margin-top: 12px;
        }

        .seller-stat{
          border-radius: 18px;
          padding: 10px 10px;
          border: 1px solid rgba(120,170,255,.10);
          background: rgba(10,16,32,.28);
        }
        .k{
          font-size: 12px;
          color: rgba(234,241,255,.68);
          font-weight: 850;
        }
        .v{
          margin-top: 4px;
          font-weight: 950;
          font-size: 14px;
        }

        .review{
          border-radius: 18px;
          padding: 12px 12px;
          border: 1px solid rgba(120,170,255,.10);
          background: rgba(10,16,32,.28);
          margin-top: 8px;
        }
        .r-top{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap: 10px;
        }
        .r-pill{
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          border: 1px solid rgba(120,170,255,.12);
          background: rgba(120,170,255,.08);
        }
        .r-text{
          margin: 8px 0 0;
          color: rgba(234,241,255,.72);
          font-size: 13px;
          line-height: 1.4;
        }

        .listing-right{
          position: sticky;
          top: 90px;
          height: fit-content;
        }

        .buy-card{
          border-radius: 24px;
          padding: 16px;
          background: linear-gradient(180deg, rgba(14,22,40,.62), rgba(14,22,40,.46));
          border: 1px solid rgba(120,170,255,.18);
          box-shadow: 0 24px 100px rgba(0,0,0,.40);
          display:flex;
          flex-direction:column;
          gap: 12px;
        }

        .price{
          font-size: 26px;
          font-weight: 950;
        }

        .qty{
          display:flex;
          gap: 8px;
          align-items:center;
        }

        .qty button{
          width: 34px;
          height: 34px;
          border-radius: 12px;
          border: 1px solid rgba(120,170,255,.16);
          background: rgba(10,16,32,.44);
          color: #eaf1ff;
          font-weight: 900;
          cursor:pointer;
        }

        .qty input{
          width: 56px;
          text-align:center;
          border-radius: 12px;
          border: 1px solid rgba(120,170,255,.16);
          background: rgba(10,16,32,.44);
          color:#eaf1ff;
          font-weight: 900;
          padding: 10px 0;
        }

        .buy-btn{
          padding: 14px;
          border-radius: 18px;
          font-weight: 950;
          border: 1px solid rgba(120,220,255,.22);
          background: linear-gradient(180deg, rgba(120,220,255,.26), rgba(120,170,255,.14));
          box-shadow: 0 18px 70px rgba(0,0,0,.30);
          cursor:pointer;
        }

        .safe{
          display:flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pill{
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid rgba(120,170,255,.14);
          font-weight: 900;
          font-size: 12px;
        }

        .on{
          background: rgba(120,220,255,.10);
        }

        .dim{
          background: rgba(10,16,32,.32);
          color: rgba(234,241,255,.70);
        }

        .icons{
          display:flex;
          justify-content:space-between;
          font-size: 12px;
          color: rgba(234,241,255,.70);
        }

        .note{
          font-size: 12px;
          color: rgba(234,241,255,.68);
          line-height: 1.4;
          border-top: 1px solid rgba(120,170,255,.10);
          padding-top: 10px;
        }

        .mobile-buy{
          display:none;
        }

        @media (max-width: 900px){
          .listing-grid{
            grid-template-columns: 1fr;
          }
          .listing-right{
            position: static;
          }
        }

        @media (max-width: 520px){
          .mobile-buy{
            position: sticky;
            bottom: 0;
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap: 10px;
            padding: 12px;
            background: rgba(10,16,32,.88);
            border-top: 1px solid rgba(120,170,255,.18);
          }
          .mobile-btn{
            padding: 12px 16px;
            border-radius: 14px;
            font-weight: 950;
            border: 1px solid rgba(120,220,255,.22);
            background: linear-gradient(180deg, rgba(120,220,255,.26), rgba(120,170,255,.14));
            cursor:pointer;
          }
        }
      `}</style>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { getListingById, type Listing } from "@/lib/demo";
import { ListingActions } from "./ListingActions";
import { getDonutImage } from "@/lib/donut-images";

type PageProps = {
  params: { id: string };
};

type TradeStage =
  | "REQUEST"
  | "ACCEPT"
  | "PAY"
  | "INGAME"
  | "PROOFS"
  | "COMPLETE"
  | "DISPUTE";

function getTradeStage(_listing: Listing): TradeStage {
  return "REQUEST";
}

export default async function ListingPage({ params }: PageProps) {
  const listing = await getListingById(params.id);

  if (!listing) {
    return (
      <div>
        <section className="container section">
          <div className="surface surface-strong" style={{ padding: 32 }}>
            <div className="stack-10">
              <h1 className="h2">Listing unavailable</h1>
              <p className="p">
                This listing may have been removed or is no longer active.
              </p>
              <Link className="btn btn-primary" href="/market">
                Back to market
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const stage = getTradeStage(listing);

  return (
    <div>
      <section className="container section">
        <div className="grid-2" style={{ alignItems: "start" }}>
          <div className="stack-14">
            <div className="surface surface-strong" style={{ padding: 18 }}>
              <div className="hero-image" style={{ marginBottom: 16 }}>
                <Image
                  src={listing.imageUrl || getDonutImage(1)}
                  alt={listing.title}
                  width={1400}
                  height={900}
                  style={{ width: "100%", height: 280, objectFit: "cover" }}
                  priority
                />
              </div>
              {listing.imageUrls && listing.imageUrls.length > 1 && (
                <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
                  {listing.imageUrls.map((url, index) => (
                    <Image
                      key={`${url}-${index}`}
                      src={url || getDonutImage(1)}
                      alt={`${listing.title} ${index + 1}`}
                      width={220}
                      height={140}
                      style={{
                        width: 160,
                        height: 110,
                        objectFit: "cover",
                        borderRadius: 10,
                      }}
                    />
                  ))}
                </div>
              )}
              <div className="stack-8">
                <span className="kicker">Listing</span>
                <h1 className="h2">{listing.title}</h1>
                <p className="p">
                  Escrow is required for every trade. Proof submission keeps
                  both parties safe and fast.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge badge-good">Escrow on</span>
                  <span className="badge">Delivery: {listing.delivery}</span>
                  <span className={`badge ${listing.listingType === "ONE_TIME" ? "badge-warn" : "badge-blue"}`}>
                    {listing.listingType === "ONE_TIME" ? "One-time Sale" : "Unlimited Stock"}
                  </span>
                  <span className="badge badge-blue">Proof required</span>
                </div>
              </div>
            </div>

            <div className="surface" style={{ padding: 18 }}>
              <div className="stack-10">
                <span className="kicker">Trade flow</span>
                <h2 className="h3">How this trade is handled</h2>
                <div className="stack-8">
                  <TradeStep
                    step="Step 1"
                    title="Request & acceptance"
                    active={stage === "REQUEST"}
                    description="Buyer requests the listing and the seller approves the trade."
                  />
                  <TradeStep
                    step="Step 2"
                    title="Escrow payment"
                    active={stage === "ACCEPT" || stage === "PAY"}
                    description="Funds are held safely in escrow until delivery is confirmed."
                  />
                  <TradeStep
                    step="Step 3"
                    title="In-game delivery"
                    active={stage === "INGAME"}
                    description="Both players meet in-game and exchange items or services."
                  />
                  <TradeStep
                    step="Step 4"
                    title="Proof & release"
                    active={stage === "PROOFS" || stage === "COMPLETE"}
                    description="Proof is uploaded and escrow releases to the seller."
                  />
                  <TradeStep
                    step="Dispute"
                    title="Evidence-based resolution"
                    active={stage === "DISPUTE"}
                    description="If there is an issue, evidence is reviewed within 48h."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="stack-14">
            <div className="surface surface-strong" style={{ padding: 18 }}>
              <div className="stack-10">
                <span className="kicker">Seller</span>
                <div className="stack-6">
                  <div style={{ fontWeight: 600 }}>{listing.sellerName}</div>
                  <span className="muted">
                    {listing.trustPercent}% trust • {listing.reviewCount} reviews
                  </span>
                </div>
                <div className="grid-3">
                  <StatBox label="Trust" value={`${listing.trustPercent}%`} />
                  <StatBox label="Reviews" value={`${listing.reviewCount}`} />
                  <StatBox label="Delivery" value={listing.delivery} />
                </div>
              </div>
            </div>

            <div className="surface" style={{ padding: 18 }}>
              <div className="stack-10">
                <span className="kicker">Pricing</span>
                <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>
                  {listing.priceLabel}
                </div>
                <span className="muted">Escrow protected checkout.</span>
                <ListingActions listingId={listing.id} sellerId={listing.sellerId} />
              </div>
            </div>

            <div className="surface" style={{ padding: 18 }}>
              <div className="stack-6">
                <span className="kicker">Protection</span>
                <p className="p">
                  Every order includes escrow, proof submission, and dispute
                  resolution support.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge badge-blue">Escrow</span>
                  <span className="badge">Audit logs</span>
                  <span className="badge">Disputes 48h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TradeStep({
  step,
  title,
  description,
  active,
}: {
  step: string;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div
      className="surface"
      style={{
        padding: 14,
        borderColor: active ? "rgba(29, 78, 216, 0.3)" : undefined,
        background: active ? "rgba(29, 78, 216, 0.06)" : undefined,
      }}
    >
      <div className="stack-4">
        <span className="badge badge-blue">{step}</span>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <span className="muted" style={{ fontSize: "0.85rem" }}>
          {description}
        </span>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface" style={{ padding: 12 }}>
      <div className="stack-4">
        <span className="muted" style={{ fontSize: "0.75rem" }}>
          {label}
        </span>
        <span style={{ fontWeight: 600 }}>{value}</span>
      </div>
    </div>
  );
}

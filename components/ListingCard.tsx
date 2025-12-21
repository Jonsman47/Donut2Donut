"use client";

import Link from "next/link";
import Image from "next/image";

type Props = {
  href: string;
  title: string;
  imageUrl: string;
  priceLabel: string;
  sellerName: string;
  sellerVerified?: boolean;
  trustPercent?: number;
  reviewCount?: number;
  delivery?: string;
  escrowOn?: boolean;
};

export default function ListingCard({
  href,
  title,
  imageUrl,
  priceLabel,
  sellerName,
  sellerVerified = false,
  trustPercent = 0,
  reviewCount = 0,
  delivery = "Instant",
  escrowOn = true,
}: Props) {
  const trustTone =
    trustPercent >= 85 ? "badge-good" : trustPercent >= 65 ? "badge-blue" : "badge-warn";

  return (
    <Link href={href} className="card card-hover" style={{ textDecoration: "none" }}>
      {/* IMAGE */}
      <div className="card-img" style={{ position: "relative" }}>
        <Image
          src={imageUrl}
          alt={title}
          width={900}
          height={600}
          style={{ width: "100%", height: 190, objectFit: "cover" }}
          priority={false}
        />

        {/* premium overlay gradient */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* top chips */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <span className={`badge ${trustTone}`} style={{ boxShadow: "var(--shGlow)" }}>
            Trust {trustPercent}%
          </span>

          {escrowOn ? (
            <span className="badge badge-good ring-glow">Escrow</span>
          ) : (
            <span className="badge badge-warn">No escrow</span>
          )}
        </div>

        {/* bottom price pop */}
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            className="glass"
            style={{
              padding: "8px 10px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(10,16,36,0.62)",
              boxShadow: "var(--shPop)",
              fontWeight: 950,
              letterSpacing: "-0.02em",
            }}
          >
            {priceLabel}
          </span>

          <span className="badge">{delivery}</span>
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding: 16 }} className="stack-10">
        <div className="stack-6">
          <div
            style={{
              fontWeight: 900,
              letterSpacing: "-0.015em",
              lineHeight: 1.15,
              fontSize: "1.02rem",
            }}
          >
            {title}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span className="muted" style={{ fontSize: ".86rem" }}>
              by <span style={{ color: "var(--txt1)", fontWeight: 780 }}>{sellerName}</span>
            </span>

            {sellerVerified && <span className="badge badge-blue">Verified</span>}

            <span className="badge">
              {reviewCount} reviews
            </span>
          </div>
        </div>

        {/* bottom action hint */}
        <div
          className="surface glass"
          style={{
            padding: 10,
            borderRadius: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <span className="muted" style={{ fontSize: ".86rem" }}>
            View listing
          </span>
          <span className="badge badge-blue">Open</span>
        </div>
      </div>
    </Link>
  );
}

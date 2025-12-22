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
    trustPercent >= 85
      ? "badge-good"
      : trustPercent >= 65
        ? "badge-primary"
        : "badge-warn";

  return (
    <Link href={href} className="card card-hover" style={{ textDecoration: "none" }}>
      <div className="card-media" style={{ position: "relative" }}>
        <Image
          src={imageUrl}
          alt={title}
          width={900}
          height={600}
          style={{ width: "100%", height: 190, objectFit: "cover" }}
          priority={false}
        />

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
          <span className={`badge ${trustTone}`}>Trust {trustPercent}%</span>
          {escrowOn ? (
            <span className="badge badge-good">Escrow</span>
          ) : (
            <span className="badge badge-warn">No escrow</span>
          )}
        </div>
      </div>

      <div className="card-body stack-12">
        <div className="stack-8">
          <div className="h3" style={{ fontWeight: 600 }}>
            {title}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span className="p" style={{ fontSize: ".88rem" }}>
              by <span style={{ fontWeight: 600 }}>{sellerName}</span>
            </span>

            {sellerVerified && <span className="badge badge-primary">Verified</span>}

            <span className="badge">{reviewCount} reviews</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span className="badge">{delivery}</span>
          <span style={{ fontWeight: 600 }}>{priceLabel}</span>
        </div>
      </div>
    </Link>
  );
}

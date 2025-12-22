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
  messageHref?: string;
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
  messageHref,
}: Props) {
  const trustTone =
    trustPercent >= 85
      ? "badge-good"
      : trustPercent >= 65
      ? "badge-blue"
      : "badge-warn";

  return (
    <div className="stack-6">
      <Link href={href} className="card card-hover" style={{ overflow: "hidden" }}>
        <div className="card-img" style={{ position: "relative" }}>
          <Image
            src={imageUrl}
            alt={title}
            width={900}
            height={600}
            style={{ width: "100%", height: 200, objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(15,23,42,0) 20%, rgba(15,23,42,0.35) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "16px 16px auto 16px",
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
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

        <div className="stack-10" style={{ padding: 18 }}>
          <div className="stack-6">
            <div style={{ fontWeight: 600, fontSize: "1rem" }}>{title}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="muted" style={{ fontSize: "0.85rem" }}>
                by <strong>{sellerName}</strong>
              </span>
              {sellerVerified && <span className="badge badge-blue">Verified</span>}
              <span className="badge">{reviewCount} reviews</span>
            </div>
          </div>

          <div
            className="surface"
            style={{
              padding: 12,
              borderRadius: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 600 }}>{priceLabel}</span>
            <span className="badge">{delivery}</span>
          </div>
        </div>
      </Link>
      {messageHref && (
        <Link className="btn btn-secondary" href={messageHref}>
          Message seller
        </Link>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getDemoListings } from "../../../lib/demo";

type ListingType = "item" | "service";
type Tab = "sales" | "buys";

function parsePrice(label: string) {
  const n = Number(String(label).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function MarketPage() {
  const [tab, setTab] = useState<Tab>("sales");
  const [query, setQuery] = useState("");
  const [balance] = useState(0);

  const [listingType, setListingType] = useState<ListingType>("item");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number | "">("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [myListings, setMyListings] = useState<any[]>([]);

  const otherListings = useMemo(() => getDemoListings(), []);

  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setImages(newFiles);
    setImagePreviews(newPreviews);
  }

  function handleCreateListing() {
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    if (listingType === "item" && (!quantity || quantity <= 0)) {
      setError("Quantity must be greater than 0 for items.");
      return;
    }
    if (price === "" || price <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    const id = `local-${Date.now()}`;
    const priceLabel = `${price.toFixed(2)} €`;

    const newListing = {
      id,
      title:
        listingType === "item"
          ? `${quantity}x ${title.trim()}`
          : title.trim(),
      description: description.trim(),
      priceLabel,
      sellerName: "You",
      trustPercent: 100,
      reviewCount: 0,
      imageUrl: "/donut3.png",
      type: listingType === "item" ? "item" : "service",
      quantity: listingType === "item" ? quantity : undefined,
      imagesCount: images.length,
    };

    setMyListings((prev) => [...prev, newListing]);

    setTitle("");
    setDescription("");
    setQuantity(1);
    setPrice("");
    setImages([]);
    setImagePreviews([]);
  }

  const filteredSales = useMemo(() => {
    const q = query.trim().toLowerCase();
    return myListings
      .slice()
      .sort((a, b) => parsePrice(a.priceLabel) - parsePrice(b.priceLabel))
      .filter((l) =>
        `${l.title} ${l.priceLabel}`.toLowerCase().includes(q)
      );
  }, [myListings, query]);

  const filteredBuys = useMemo(() => {
    const q = query.trim().toLowerCase();
    return otherListings
      .slice()
      .sort((a: any, b: any) => parsePrice(a.priceLabel) - parsePrice(b.priceLabel))
      .filter((l: any) =>
        `${l.title} ${l.sellerName} ${l.priceLabel}`
          .toLowerCase()
          .includes(q)
      );
  }, [otherListings, query]);

  const listToShow = tab === "sales" ? filteredSales : filteredBuys;

  return (
    <div style={{ paddingTop: 86 }}>
      <section className="container section-tight">
        <div className="stack-10">
          {/* Top bar: title + balance */}
          <div
            className="surface-strong glass border-grad"
            style={{ padding: 16, display: "flex", justifyContent: "space-between", gap: 16 }}
          >
            <div className="stack-8" style={{ flex: 1, minWidth: 0 }}>
              <div className="kicker">Donut2Donut • Escrow market</div>
              <h1 className="h1">DonutSMP marketplace</h1>
              <p className="p" style={{ maxWidth: 620 }}>
                Sell DonutSMP items or services and browse what other players
                offer, with an escrow‑first flow.
              </p>

              <div className="surface glass" style={{ padding: 10 }}>
                <input
                  className="input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search in the current tab…"
                />
                <div
                  style={{
                    marginTop: 6,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "#9ca3af",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    Current tab: {tab === "sales" ? "My listings" : "Buys"}
                  </span>
                  <span>Escrow • Proofs • 48h disputes</span>
                </div>
              </div>
            </div>

            <div
              className="surface glass"
              style={{
                padding: 10,
                minWidth: 150,
                textAlign: "right",
                alignSelf: "flex-start",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.08,
                  color: "#9ca3af",
                }}
              >
                Sold
              </div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>
                {balance.toFixed(2)} €
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="surface glass" style={{ padding: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className={tab === "sales" ? "btn btn-soft" : "btn btn-ghost"}
                onClick={() => setTab("sales")}
              >
                My listings
              </button>
              <button
                type="button"
                className={tab === "buys" ? "btn btn-soft" : "btn btn-ghost"}
                onClick={() => setTab("buys")}
              >
                Buys
              </button>
            </div>
          </div>

          {/* Create listing form (only on My listings tab) */}
          {tab === "sales" && (
            <div className="surface glass" style={{ padding: 16 }}>
              <div className="stack-8">
                <div className="kicker">New listing</div>
                <h2 className="h2">Create a sale</h2>

                {error && (
                  <div
                    className="p"
                    style={{
                      fontSize: 13,
                      color: "#b91c1c",
                      backgroundColor: "#FEE2E2",
                      border: "1px solid #FCA5A5",
                      borderRadius: 6,
                      padding: "6px 10px",
                    }}
                  >
                    {error}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className={
                      listingType === "item" ? "btn btn-soft" : "btn btn-ghost"
                    }
                    onClick={() => setListingType("item")}
                  >
                    Items
                  </button>
                  <button
                    type="button"
                    className={
                      listingType === "service" ? "btn btn-soft" : "btn btn-ghost"
                    }
                    onClick={() => setListingType("service")}
                  >
                    Service
                  </button>
                </div>

                <input
                  className="input"
                  placeholder={
                    listingType === "item"
                      ? "Ex: 64x Diamond Block"
                      : "Ex: Base building service"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                  className="input"
                  rows={4}
                  placeholder="Describe what you sell and any conditions."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: "vertical" }}
                />

                {listingType === "item" && (
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Number(e.target.value) || 1))
                    }
                    placeholder="Quantity"
                    style={{ maxWidth: 160 }}
                  />
                )}

                <input
                  className="input"
                  type="number"
                  min={0}
                  step={0.01}
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value === "" ? "" : Number(e.target.value) || 0
                    )
                  }
                  placeholder="Price in €"
                  style={{ maxWidth: 200 }}
                />

                <div className="stack-4">
                  <label className="p" style={{ fontSize: 13 }}>
                    Screenshots (optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImagesChange}
                  />
                  {imagePreviews.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      {imagePreviews.map((src, idx) => (
                        <img
                          key={idx}
                          src={src}
                          alt={`preview-${idx}`}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateListing}
                >
                  Publish listing
                </button>
              </div>
            </div>
          )}

          {/* Listings list */}
          <div className="surface glass" style={{ padding: 12 }}>
            <div className="stack-6">
              <div className="kicker">
                {tab === "sales" ? "My listings" : "Others' listings"}
              </div>
              {listToShow.length === 0 ? (
                <div className="p" style={{ fontSize: 13, color: "#9ca3af" }}>
                  Nothing to show yet.
                </div>
              ) : (
                <div className="grid-cards">
                  {listToShow.map((l: any) => (
                    <Link
                      key={l.id}
                      href={`/listing/${l.id}`}
                      className="card card-hover"
                    >
                      <div
                        style={{
                          height: 140,
                          backgroundImage: `url(${l.imageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          borderTopLeftRadius: 16,
                          borderTopRightRadius: 16,
                        }}
                      />
                      <div style={{ padding: 12 }} className="stack-6">
                        <div
                          style={{
                            fontWeight: 900,
                            fontSize: 14,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {l.title}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 13,
                          }}
                        >
                          <span>{l.priceLabel}</span>
                          <span>{l.sellerName}</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            fontSize: 11,
                            color: "#9ca3af",
                          }}
                        >
                          <span>{l.trustPercent}% trust</span>
                          <span>• {l.reviewCount} reviews</span>
                        </div>
                        {l.type === "item" && l.quantity && (
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 11,
                              color: "#9ca3af",
                            }}
                          >
                            Quantity: {l.quantity}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

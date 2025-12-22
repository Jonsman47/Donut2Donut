"use client";

import { useState } from "react";
import Link from "next/link";
import items from "../../../lib/mc-items.json";

type ListingType = "item" | "service";
type Tab = "sales" | "buys";

type Listing = {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  sellerName: string;
  trustPercent: number;
  reviewCount: number;
  imageUrl: string;
  type: ListingType;
  quantity?: number;
  imagesCount: number;
};

function parsePrice(label: string) {
  const n = Number(String(label).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function MarketPage() {
  const [tab, setTab] = useState<Tab>("sales");
  const [query, setQuery] = useState("");

  const [listingType, setListingType] = useState<ListingType>("item");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number | "">("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Recherche dans les items du sélecteur ---
  const [itemSearch, setItemSearch] = useState("");          // texte tapé
  const [showDropdown, setShowDropdown] = useState(false);   // afficher/cacher la liste
  const allItems = items.values as string[];
  const filteredItems = allItems.filter((name) =>
    name.toLowerCase().includes(itemSearch.toLowerCase())
  );

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

  function handleCreateOrUpdateListing() {
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
    if (!editingId && images.length === 0) {
      setError("At least one screenshot is required.");
      return;
    }

    const priceLabel = `${price.toFixed(2)} €`;

    const coverUrl =
      imagePreviews[0] ??
      (editingId
        ? myListings.find((l) => l.id === editingId)?.imageUrl ?? "/donut3.png"
        : "/donut3.png");

    if (editingId) {
      setMyListings((prev) =>
        prev.map((l) =>
          l.id === editingId
            ? {
                ...l,
                title:
                  listingType === "item"
                    ? `${quantity}x ${title.trim()}`
                    : title.trim(),
                description: description.trim(),
                priceLabel,
                imageUrl: coverUrl,
                type: listingType,
                quantity: listingType === "item" ? quantity : undefined,
              }
            : l
        )
      );
    } else {
      const id = `local-${Date.now()}`;

      const newListing: Listing = {
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
        imageUrl: coverUrl,
        type: listingType,
        quantity: listingType === "item" ? quantity : undefined,
        imagesCount: images.length,
      };

      setMyListings((prev) => [...prev, newListing]);
    }

    resetForm();
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setQuantity(1);
    setPrice("");
    setImages([]);
    setImagePreviews([]);
    setListingType("item");
    setError(null);
    setItemSearch("");
    setShowDropdown(false);
  }

  function handleEditClick(listing: Listing) {
    setEditingId(listing.id);

    let baseTitle = listing.title;
    let qty = 1;
    if (listing.type === "item") {
      const match = listing.title.match(/^(\d+)x\s+(.*)$/);
      if (match) {
        qty = Number(match[1]) || 1;
        baseTitle = match[2];
      }
    }

    setListingType(listing.type);
    setTitle(baseTitle);
    setItemSearch(baseTitle); // remplir le champ de recherche avec le titre actuel
    setDescription(listing.description);
    setQuantity(listing.quantity ?? qty);
    const numericPrice = parsePrice(listing.priceLabel);
    setPrice(Number.isFinite(numericPrice) ? numericPrice : "");
    setImages([]);
    setImagePreviews([]);
    setError(null);
  }

  const filteredSales = myListings
    .slice()
    .sort((a, b) => parsePrice(a.priceLabel) - parsePrice(b.priceLabel))
    .filter((l) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const haystack = `${l.title} ${l.description} ${l.priceLabel}`.toLowerCase();
      return haystack.includes(q);
    });

  const filteredBuys: Listing[] = [];

  const listToShow = tab === "sales" ? filteredSales : filteredBuys;

  return (
    <div style={{ paddingTop: 86 }}>
      <section className="container section-tight">
        <div className="stack-10">
          {/* HEADER */}
          <div className="surface-strong glass border-grad" style={{ padding: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <div className="stack-8" style={{ flex: 1, minWidth: 0 }}>
                <div className="kicker">Donut2Donut • Escrow marketplace</div>
                <h1 className="h1" style={{ marginBottom: 4 }}>
                  DonutSMP trading hub
                </h1>
                <p className="p" style={{ maxWidth: 640 }}>
                  Create listings for items or services and trade through an
                  escrow‑first flow with proofs and disputes.
                </p>

                <div
                  className="surface glass"
                  style={{ padding: 10, marginTop: 10 }}
                >
                  <div className="stack-6">
                    <input
                      className="input"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={
                        tab === "sales"
                          ? "Search in your listings…"
                          : "Search in available listings…"
                      }
                    />
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        display: "flex",
                        justifyContent: "space-between",
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
              </div>
            </div>
          </div>

          {/* TABS */}
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

          {/* CREATE / EDIT PANEL */}
          {tab === "sales" && (
            <div className="surface glass" style={{ padding: 18 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
                  gap: 16,
                }}
              >
                <div className="stack-8">
                  <div className="kicker">
                    {editingId ? "Edit listing" : "New listing"}
                  </div>
                  <h2 className="h2">
                    {editingId ? "Update your sale" : "Create a sale"}
                  </h2>

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
                        listingType === "service"
                          ? "btn btn-soft"
                          : "btn btn-ghost"
                      }
                      onClick={() => setListingType("service")}
                    >
                      Service
                    </button>
                  </div>

                  {/* Title: selector for items, text for services */}
                  {listingType === "item" ? (
                    <div className="stack-4" style={{ position: "relative" }}>
                      <input
                        className="input"
                        placeholder="Select an item…"
                        value={itemSearch || title}
                        onChange={(e) => {
                          setItemSearch(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => {
                          setShowDropdown(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowDropdown(false), 120);
                        }}
                      />

                      {showDropdown && filteredItems.length > 0 && (
                        <div className="dropdown-panel">
                          {filteredItems.map((name) => (
                            <button
                              key={name}
                              type="button"
                              className="dropdown-item"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setTitle(name);
                                setItemSearch(name);
                                setShowDropdown(false);
                              }}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      className="input"
                      placeholder="Ex: Base building service"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  )}

                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Describe what you sell, how delivery works, and any requirements."
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

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleCreateOrUpdateListing}
                    >
                      {editingId ? "Save changes" : "Publish listing"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={resetForm}
                      >
                        Cancel edit
                      </button>
                    )}
                  </div>
                </div>

                {/* PREVIEW + IMAGES */}
                <div className="stack-8">
                  <div className="kicker">Preview</div>
                  <div className="card card-hover">
                    <div
                      style={{
                        height: 140,
                        backgroundImage: `url(${
                          imagePreviews[0] ??
                          (editingId
                            ? myListings.find((l) => l.id === editingId)?.imageUrl ??
                              "/donut3.png"
                            : "/donut3.png")
                        })`,
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
                        {title || "Listing title"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 13,
                        }}
                      >
                        <span>
                          {price === "" ? "0.00 €" : `${price.toFixed(2)} €`}
                        </span>
                        <span>You</span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#d1d5db",
                          maxHeight: 60,
                          overflow: "hidden",
                        }}
                      >
                        {description || "Short description of your listing."}
                      </div>
                      {listingType === "item" && (
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 11,
                            color: "#9ca3af",
                          }}
                        >
                          Quantity: {quantity}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="stack-4">
                    <label className="p" style={{ fontSize: 13 }}>
                      Screenshots {editingId ? "(optional when editing)" : "(required)"}
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
                              width: 72,
                              height: 72,
                              objectFit: "cover",
                              borderRadius: 6,
                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LISTINGS LIST */}
          <div className="surface glass" style={{ padding: 12 }}>
            <div className="stack-6">
              <div className="kicker">
                {tab === "sales" ? "My listings" : "Listings from other players"}
              </div>
              {listToShow.length === 0 ? (
                <div className="p" style={{ fontSize: 13, color: "#9ca3af" }}>
                  {tab === "sales"
                    ? "You have not created any listing yet."
                    : "No listings available to buy yet."}
                </div>
              ) : (
                <div className="grid-cards">
                  {listToShow.map((l) => (
                    <div key={l.id} className="card card-hover">
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

                        {tab === "sales" && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              marginTop: 6,
                            }}
                          >
                            <button
                              type="button"
                              className="btn btn-ghost"
                              style={{ fontSize: 12, paddingInline: 10 }}
                              onClick={() => handleEditClick(l)}
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
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

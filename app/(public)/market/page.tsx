"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ListingCard from "@/components/ListingCard";
import { getDonutGallery, getDonutImage } from "@/lib/donut-images";

type ListingType = "item" | "service";

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
  sellerId: string;
  delivery: string;
  escrowOn: boolean;
};

function parsePrice(label: string) {
  const n = Number(String(label).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const gallery = getDonutGallery();

export default function MarketPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id;

  const [tab, setTab] = useState<"sales" | "buys">("sales");
  const [query, setQuery] = useState("");

  const [listingType, setListingType] = useState<ListingType>("item");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number | "">("");
  const [coverUrl, setCoverUrl] = useState(gallery[0] ?? getDonutImage(0));
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    async function loadListings() {
      try {
        const res = await fetch("/api/listings");
        const data = await res.json();

        const mapped: Listing[] = (data.listings ?? []).map((l: any, index: number) => ({
          id: l.id,
          title: l.title,
          description: l.description,
          priceLabel: (l.priceCents / 100).toFixed(2) + " €",
          sellerName: l.seller?.username ?? "Unknown",
          trustPercent: l.seller?.sellerProfile?.trustScore ?? 0,
          reviewCount: 0,
          imageUrl: l.images?.[0]?.url ?? getDonutImage(index),
          type: l.deliveryType === "SERVICE" ? "service" : "item",
          quantity: l.stock ?? undefined,
          imagesCount: l.images?.length ?? 0,
          sellerId: l.seller?.id ?? "",
          delivery: l.deliveryType === "SERVICE" ? "Service" : "In-game trade",
          escrowOn: l.escrowOnly ?? true,
        }));

        setAllListings(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingListings(false);
      }
    }

    loadListings();
  }, [userId, session]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setQuantity(1);
    setPrice("");
    setListingType("item");
    setCoverUrl(gallery[0] ?? getDonutImage(0));
    setError(null);
  }

  async function handleCreateOrUpdateListing() {
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

    const priceLabel = `${price.toFixed(2)} €`;

    if (editingId) {
      setAllListings((prev) =>
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
      resetForm();
      return;
    }

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:
            listingType === "item"
              ? `${quantity}x ${title.trim()}`
              : title.trim(),
          description: description.trim(),
          whatYouGet: description.trim(),
          priceCents: Math.round((price as number) * 100),
          stock: listingType === "item" ? quantity : null,
          deliveryType: listingType === "item" ? "INGAME_TRADE" : "SERVICE",
          imageUrl: coverUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create listing.");
        return;
      }

      const data = await res.json();

      setAllListings((prev) => [
        {
          id: data.listing.id,
          title: data.listing.title,
          description: data.listing.description,
          priceLabel: (data.listing.priceCents / 100).toFixed(2) + " €",
          sellerName: session?.user?.name ?? "You",
          trustPercent: 0,
          reviewCount: 0,
          imageUrl: coverUrl,
          type: listingType,
          quantity: listingType === "item" ? quantity : undefined,
          imagesCount: data.listing.images?.length ?? 0,
          sellerId: userId ?? "",
          delivery: listingType === "service" ? "Service" : "In-game trade",
          escrowOn: true,
        },
        ...prev,
      ]);
      resetForm();
    } catch (e) {
      console.error(e);
      setError("Server error while creating listing.");
    }
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
    setDescription(listing.description);
    setQuantity(listing.quantity ?? qty);
    const numericPrice = parsePrice(listing.priceLabel);
    setPrice(Number.isFinite(numericPrice) ? numericPrice : "");
    setCoverUrl(listing.imageUrl || getDonutImage(0));
    setError(null);
  }

  async function handleDelete(listingId: string) {
    const ok = confirm("Tu es sûr de vouloir supprimer cette annonce ?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert((data as any).error || "Erreur lors de la suppression de l'annonce.");
        return;
      }

      setAllListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch (e) {
      console.error(e);
      alert("Server error while deleting listing.");
    }
  }

  const myListings = allListings.filter((l) => l.sellerId === userId);
  const otherListings = allListings.filter((l) => l.sellerId !== userId);

  const filteredListings = (tab === "sales" ? myListings : otherListings)
    .slice()
    .sort((a, b) => parsePrice(a.priceLabel) - parsePrice(b.priceLabel))
    .filter((l) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const haystack = `${l.title} ${l.description} ${l.priceLabel}`.toLowerCase();
      return haystack.includes(q);
    });

  return (
    <div>
      <section className="container section">
        <div className="stack-18">
          <div className="surface surface-strong" style={{ padding: 24 }}>
            <div className="grid-2" style={{ alignItems: "center" }}>
              <div className="stack-8">
                <span className="kicker">Marketplace</span>
                <h1 className="h2">DonutSMP trading hub</h1>
                <p className="p">
                  Browse verified listings or create your own. Escrow and proofs are
                  always on by default.
                </p>
              </div>
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
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  Escrow • Proofs • 48h disputes
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className={tab === "sales" ? "btn btn-primary" : "btn btn-ghost"}
              onClick={() => setTab("sales")}
            >
              My listings
            </button>
            <button
              type="button"
              className={tab === "buys" ? "btn btn-primary" : "btn btn-ghost"}
              onClick={() => setTab("buys")}
            >
              Available listings
            </button>
          </div>

          {tab === "sales" && (
            <div className="surface" style={{ padding: 24 }}>
              <div className="grid-2">
                <div className="stack-10">
                  <div className="stack-4">
                    <span className="kicker">{editingId ? "Edit" : "Create"}</span>
                    <h2 className="h2">
                      {editingId ? "Update listing" : "Create a listing"}
                    </h2>
                    <p className="p">
                      Add a clear title, set your price, and choose a cover image.
                    </p>
                  </div>

                  {status === "unauthenticated" && (
                    <div className="badge badge-warn" style={{ width: "fit-content" }}>
                      Sign in to create listings.
                    </div>
                  )}

                  {error && (
                    <div className="badge badge-warn" style={{ width: "fit-content" }}>
                      {error}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className={listingType === "item" ? "btn btn-soft" : "btn btn-ghost"}
                      onClick={() => setListingType("item")}
                    >
                      Item
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

                  <div className="stack-6">
                    <label className="muted" htmlFor="title">
                      Title
                    </label>
                    <input
                      id="title"
                      className="input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Rare kit bundle, PvP coaching..."
                    />
                  </div>

                  <div className="stack-6">
                    <label className="muted" htmlFor="description">
                      Description
                    </label>
                    <textarea
                      id="description"
                      className="input"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Short description of the listing"
                      rows={4}
                    />
                  </div>

                  <div className="grid-2">
                    {listingType === "item" && (
                      <div className="stack-6">
                        <label className="muted" htmlFor="quantity">
                          Quantity
                        </label>
                      <input
                        id="quantity"
                        className="input"
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(e.target.value === "" ? 0 : Number(e.target.value))
                        }
                      />
                    </div>
                  )}
                  <div className="stack-6">
                      <label className="muted" htmlFor="price">
                        Price (€)
                      </label>
                      <input
                        id="price"
                        className="input"
                        type="number"
                        min={0}
                        step="0.01"
                        value={price}
                        onChange={(e) =>
                          setPrice(e.target.value === "" ? "" : Number(e.target.value))
                        }
                      />
                    </div>
                  </div>

                  <div className="stack-6">
                    <span className="muted">Cover image</span>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {gallery.map((img) => (
                        <button
                          key={img}
                          type="button"
                          onClick={() => setCoverUrl(img)}
                          className={
                            coverUrl === img ? "btn btn-soft" : "btn btn-ghost"
                          }
                          style={{ padding: "6px 10px" }}
                        >
                          <span className="badge badge-blue">Select</span>
                          <span>{img.replace("/", "")}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={handleCreateOrUpdateListing}
                      disabled={status !== "authenticated"}
                    >
                      {editingId ? "Save changes" : "Create listing"}
                    </button>
                    {editingId && (
                      <button className="btn btn-ghost" type="button" onClick={resetForm}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="stack-10">
                  <div className="surface" style={{ padding: 18 }}>
                    <div className="stack-6">
                      <span className="kicker">Preview</span>
                      <ListingCard
                        href="#"
                        title={
                          listingType === "item"
                            ? `${quantity}x ${title || "New listing"}`
                            : title || "New listing"
                        }
                        imageUrl={coverUrl}
                        priceLabel={
                          price && price !== "" ? `${Number(price).toFixed(2)} €` : "0.00 €"
                        }
                        sellerName={session?.user?.name ?? "You"}
                        sellerVerified
                        trustPercent={88}
                        reviewCount={12}
                        delivery={listingType === "service" ? "Service" : "In-game trade"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="stack-10">
            <div className="stack-6">
              <h2 className="h2">
                {tab === "sales" ? "Your listings" : "Available listings"}
              </h2>
              <p className="p">
                {tab === "sales"
                  ? "Manage your active listings and keep them updated."
                  : "Browse verified listings ready for escrow."}
              </p>
            </div>

            {loadingListings && <div className="muted">Loading listings…</div>}

            {!loadingListings && filteredListings.length === 0 && (
              <div className="surface" style={{ padding: 18 }}>
                <div className="stack-6">
                  <span className="kicker">No listings</span>
                  <p className="p">
                    {tab === "sales"
                      ? "Create your first listing to get started."
                      : "Check back soon for new listings."}
                  </p>
                </div>
              </div>
            )}

            <div className="grid-3">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="stack-6">
                  <ListingCard
                    href={`/listing/${listing.id}`}
                    title={listing.title}
                    imageUrl={listing.imageUrl}
                    priceLabel={listing.priceLabel}
                    sellerName={listing.sellerName}
                    sellerVerified={listing.trustPercent >= 80}
                    trustPercent={listing.trustPercent}
                    reviewCount={listing.reviewCount}
                    delivery={listing.delivery}
                    escrowOn={listing.escrowOn}
                  />
                  {tab === "sales" && listing.sellerId === userId && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        className="btn btn-soft"
                        type="button"
                        onClick={() => handleEditClick(listing)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={() => handleDelete(listing.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

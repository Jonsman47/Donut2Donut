"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  trustBadge?: string;
  reviewCount: number;
  imageUrl: string;
  type: ListingType;
  quantity?: number;
  imagesCount: number;
  sellerId: string;
  delivery: string;
  escrowOn: boolean;
  listingType: "ONE_TIME" | "STOCK";
  createdAt?: string;
};

function parsePrice(label: string) {
  const n = Number(String(label).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const gallery = getDonutGallery();

export default function MarketPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id;

  const [tab, setTab] = useState<"sales" | "buys">("buys");
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | ListingType>("all");
  const [escrowFilter, setEscrowFilter] = useState<"all" | "on" | "off">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc" | "trust">("newest");

  const [listingType, setListingType] = useState<ListingType>("item");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number | "">("");
  const [coverUrl, setCoverUrl] = useState(gallery[0] ?? getDonutImage(0));

  // Optional custom cover (URL or uploaded file as base64)
  const [customImageUrl, setCustomImageUrl] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  const [counts, setCounts] = useState<{
    pendingSales: number;
    activeOrders: number;
  } | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<{
    setupComplete: boolean;
    profileComplete: boolean;
    tosAccepted: boolean;
    discordConnected: boolean;
  } | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    async function fetchCounts() {
      try {
        const res = await fetch(`/api/unread-counts?t=${Date.now()}`);
        if (res.ok) setCounts(await res.json());
      } catch (e) {
        console.error(e);
      }
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, 5000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") {
      setVerifyStatus(null);
      return;
    }
    let active = true;
    async function loadVerifyStatus() {
      try {
        const res = await fetch("/api/verify/status");
        if (!res.ok) return;
        const data = await res.json();
        if (active) {
          setVerifyStatus({
            setupComplete: Boolean(data.setupComplete),
            profileComplete: Boolean(data.profileComplete),
            tosAccepted: Boolean(data.tosAccepted),
            discordConnected: Boolean(data.discordConnected),
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadVerifyStatus();
    return () => {
      active = false;
    };
  }, [status]);

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
          trustPercent: l.trustPercent ?? 0,
          trustBadge: l.trustBadge ?? "New/Unrated",
          reviewCount: l.reviewCount ?? 0,
          imageUrl: l.images?.[0]?.url ?? getDonutImage(index),
          type: l.deliveryType === "SERVICE" ? "service" : "item",
          quantity: l.stock ?? undefined,
          imagesCount: l.images?.length ?? 0,
          sellerId: l.seller?.id ?? "",
          delivery: l.deliveryType === "SERVICE" ? "Service" : "In-game trade",
          escrowOn: l.escrowOnly ?? true,
          listingType: l.listingType ?? "STOCK",
          createdAt: l.createdAt,
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
    setIsOneTime(true);
    setTitle("");
    setDescription("");
    setQuantity(1);
    setPrice("");
    setListingType("item");
    setCoverUrl(gallery[0] ?? getDonutImage(0));
    setCustomImageUrl("");
    setError(null);
  }

  function handleCustomImageUrl(value: string) {
    setCustomImageUrl(value);
    if (value.trim()) setCoverUrl(value.trim());
  }

  function handleImageFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result) {
        setCustomImageUrl("");
        setCoverUrl(result);
      }
    };
    reader.readAsDataURL(file);
  }

  const [isOneTime, setIsOneTime] = useState(true);

  async function handleCreateOrUpdateListing() {
    setError(null);

    if (verifyStatus && !verifyStatus.setupComplete) {
      setError("Finish setup to sell. Visit /verify to complete your profile.");
      return;
    }
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

    const priceLabel = `${Number(price).toFixed(2)} €`;

    if (editingId) {
      try {
        const res = await fetch(`/api/listings/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: listingType === "item" ? `${quantity}x ${title.trim()}` : title.trim(),
            description: description.trim(),
            whatYouGet: description.trim(),
            priceCents: Math.round(Number(price) * 100),
            stock: listingType === "item" ? quantity : null,
            deliveryType: listingType === "item" ? "INGAME_TRADE" : "SERVICE",
            imageUrl: coverUrl,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError((data as any).error || "Failed to update listing.");
          return;
        }

        const data = await res.json();
        setAllListings((prev) =>
          prev.map((l) =>
            l.id === editingId
              ? {
                ...l,
                title: data.listing.title,
                description: data.listing.description,
                priceLabel: (data.listing.priceCents / 100).toFixed(2) + " €",
                imageUrl: data.listing.images?.[0]?.url ?? coverUrl,
                type: data.listing.deliveryType === "SERVICE" ? "service" : "item",
                quantity: data.listing.stock ?? undefined,
                delivery: data.listing.deliveryType === "SERVICE" ? "Service" : "In-game trade",
                escrowOn: data.listing.escrowOnly ?? true,
              }
              : l
          )
        );
        resetForm();
        return;
      } catch (e) {
        console.error(e);
        setError("Server error while updating listing.");
        return;
      }
    }

    // Create via API
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: listingType === "item" ? `${quantity}x ${title.trim()}` : title.trim(),
          description: description.trim(),
          whatYouGet: description.trim(),
          priceCents: Math.round(Number(price) * 100),
          stock: listingType === "item" ? quantity : null,
          deliveryType: listingType === "item" ? "INGAME_TRADE" : "SERVICE",
          imageUrl: coverUrl,
          listingType: isOneTime ? "ONE_TIME" : "STOCK",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as any).error || "Failed to create listing.");
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
          trustBadge: "New/Unrated",
          reviewCount: 0,
          imageUrl: coverUrl,
          type: listingType,
          quantity: listingType === "item" ? quantity : undefined,
          imagesCount: data.listing.images?.length ?? 0,
          sellerId: userId ?? "",
          delivery: listingType === "service" ? "Service" : "In-game trade",
          escrowOn: true,
          listingType: isOneTime ? "ONE_TIME" : "STOCK",
          createdAt: data.listing.createdAt ?? new Date().toISOString(),
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
    setCustomImageUrl("");
    setError(null);
  }

  async function handleDelete(listingId: string) {
    const ok = confirm("Are you sure you want to delete this listing?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert((data as any).error || "Error deleting listing.");
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
    .filter((l) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const haystack = `${l.title} ${l.description} ${l.priceLabel}`.toLowerCase();
      return haystack.includes(q);
    })
    .filter((l) => (filterType === "all" ? true : l.type === filterType))
    .filter((l) => {
      if (escrowFilter === "all") return true;
      return escrowFilter === "on" ? l.escrowOn : !l.escrowOn;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      }
      if (sortBy === "price-asc") return parsePrice(a.priceLabel) - parsePrice(b.priceLabel);
      if (sortBy === "price-desc") return parsePrice(b.priceLabel) - parsePrice(a.priceLabel);
      if (sortBy === "trust") return b.trustPercent - a.trustPercent;
      return 0;
    });

  const setupBlocked = status === "authenticated" && !!verifyStatus && !verifyStatus.setupComplete;

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
                  Browse verified listings or create your own. Escrow and proofs are always on by
                  default.
                </p>
              </div>
              <div className="stack-6">
                <input
                  className="input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tab === "sales" ? "Search in your listings…" : "Search in available listings…"}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <select
                    className="input"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                  >
                    <option value="all">All types</option>
                    <option value="item">Item</option>
                    <option value="service">Service</option>
                  </select>
                  <select
                    className="input"
                    value={escrowFilter}
                    onChange={(e) => setEscrowFilter(e.target.value as typeof escrowFilter)}
                  >
                    <option value="all">Escrow: all</option>
                    <option value="on">Escrow on</option>
                    <option value="off">Escrow off</option>
                  </select>
                  <select
                    className="input"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  >
                    <option value="newest">Sort: newest</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                    <option value="trust">Trust</option>
                  </select>
                </div>
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
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              My listings (Sales)
              {!!counts?.pendingSales && counts.pendingSales > 0 && (
                <span className="badge badge-warn">{counts.pendingSales}</span>
              )}
            </button>
            <button
              type="button"
              className={tab === "buys" ? "btn btn-primary" : "btn btn-ghost"}
              onClick={() => setTab("buys")}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              Available listings (Orders)
              {!!counts?.activeOrders && counts.activeOrders > 0 && (
                <span className="badge badge-warn">{counts.activeOrders}</span>
              )}
            </button>
          </div>

          {tab === "sales" && (
            <div className="surface" style={{ padding: 24 }}>
              <div className="grid-2">
                <div className="stack-10">
                  <div className="stack-4">
                    <span className="kicker">{editingId ? "Edit" : "Create"}</span>
                    <h2 className="h2">{editingId ? "Update listing" : "Create a listing"}</h2>
                    <p className="p">Add a clear title, set your price, and choose a cover image.</p>
                  </div>

                  {status === "unauthenticated" && (
                    <div className="badge badge-warn" style={{ width: "fit-content" }}>
                      Sign in to create listings.
                    </div>
                  )}

                  {setupBlocked && (
                    <div className="surface surface-strong" style={{ padding: 12, borderRadius: 12 }}>
                      <div className="stack-4">
                        <strong>Finish setup to sell</strong>
                        <div className="muted">
                          Complete your verification checklist before creating listings.
                        </div>
                        <Link className="btn btn-secondary" href="/verify">
                          Finish setup
                        </Link>
                      </div>
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
                      className={listingType === "service" ? "btn btn-soft" : "btn btn-ghost"}
                      onClick={() => setListingType("service")}
                    >
                      Service
                    </button>
                  </div>

                  <div className="stack-6">
                    <label className="muted">Listing persistence</label>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        type="button"
                        className={isOneTime ? "btn btn-soft" : "btn btn-ghost"}
                        onClick={() => setIsOneTime(true)}
                      >
                        🔂 One-Time Sale
                      </button>
                      <button
                        type="button"
                        className={!isOneTime ? "btn btn-soft" : "btn btn-ghost"}
                        onClick={() => setIsOneTime(false)}
                      >
                        📦 Infinite Stock
                      </button>
                    </div>
                    <p className="text-sm muted">
                      {isOneTime
                        ? "Listing will be automatically removed after the trade is completed."
                        : "Listing stays active for multiple buyers."}
                    </p>
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
                          onChange={(e) => setQuantity(e.target.value === "" ? 0 : Number(e.target.value))}
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
                        onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="stack-6">
                    <span className="muted">Cover image</span>

                    <div className="grid-2">
                      <div className="stack-6">
                        <label className="muted" htmlFor="image-url">
                          Image URL
                        </label>
                        <input
                          id="image-url"
                          className="input"
                          value={customImageUrl}
                          onChange={(e) => handleCustomImageUrl(e.target.value)}
                          placeholder="https://.../image.png"
                        />
                      </div>
                      <div className="stack-6">
                        <label className="muted" htmlFor="image-file">
                          Upload image
                        </label>
                        <input
                          id="image-file"
                          className="input"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={handleCreateOrUpdateListing}
                      disabled={status !== "authenticated" || setupBlocked}
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
                        title={listingType === "item" ? `${quantity}x ${title || "New listing"}` : title || "New listing"}
                        imageUrl={coverUrl}
                        priceLabel={price !== "" ? `${Number(price).toFixed(2)} €` : "0.00 €"}
                        sellerName={session?.user?.name ?? "You"}
                        sellerVerified
                        trustPercent={88}
                        trustBadge="Trusted"
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
              <h2 className="h2">{tab === "sales" ? "Your listings" : "Available listings"}</h2>
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
                    {tab === "sales" ? "Create your first listing to get started." : "Check back soon for new listings."}
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
                    trustBadge={listing.trustBadge}
                    reviewCount={listing.reviewCount}
                    delivery={listing.delivery}
                    escrowOn={listing.escrowOn}
                    listingType={listing.listingType}
                  />

                  {tab === "sales" && listing.sellerId === userId && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button className="btn btn-soft" type="button" onClick={() => handleEditClick(listing)}>
                        Edit
                      </button>
                      <button className="btn btn-ghost" type="button" onClick={() => handleDelete(listing.id)}>
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

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  sellerId: string;
};

function parsePrice(label: string) {
  const n = Number(String(label).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function MarketPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

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

  const [editingId, setEditingId] = useState<string | null>(null);

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  const [itemSearch, setItemSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const allItems = items.values as string[];
  const filteredItems = allItems.filter((name) =>
    name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  // Charger toutes les annonces quand la session change
  useEffect(() => {
    async function loadListings() {
      try {
        const res = await fetch("/api/listings");
        const data = await res.json();

        const mapped: Listing[] = data.listings.map((l: any) => ({
          id: l.id,
          title: l.title,
          description: l.description,
          priceLabel: (l.priceCents / 100).toFixed(2) + " €",
          sellerName: l.seller?.username ?? "Unknown",
          trustPercent: l.seller?.sellerProfile?.trustScore ?? 0,
          reviewCount: 0,
          imageUrl: l.images && l.images.length > 0 ? l.images[0].url : "/donut3.png",
          type: l.deliveryType === "SERVICE" ? "service" : "item",
          quantity: l.stock ?? undefined,
          imagesCount: l.images?.length ?? 0,
          sellerId: l.seller?.id ?? "",
        }));

        setAllListings(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingListings(false);
      }
    }

    loadListings();
  }, [userId, session]); // Re-load quand l'user change

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
    if (!editingId && images.length === 0) {
      setError("At least one screenshot is required.");
      return;
    }

    const priceLabel = `${price.toFixed(2)} €`;

    const coverUrl = imagePreviews[0] ?? "/donut3.png";

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
    } else {
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
            imagesCount: images.length,
            sellerId: userId ?? "",
          },
          ...prev,
        ]);
      } catch (e) {
        console.error(e);
        setError("Server error while creating listing.");
        return;
      }
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
    setItemSearch(baseTitle);
    setDescription(listing.description);
    setQuantity(listing.quantity ?? qty);
    const numericPrice = parsePrice(listing.priceLabel);
    setPrice(Number.isFinite(numericPrice) ? numericPrice : "");
    setImages([]);
    setImagePreviews([]);
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
        alert(
          (data as any).error || "Erreur lors de la suppression de l'annonce."
        );
        return;
      }

      setAllListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch (e) {
      console.error(e);
      alert("Server error while deleting listing.");
    }
  }

  // Filtrer : "My listings" = celles du user connecté, "Buys" = celles des autres
  const myListings = allListings.filter((l) => l.sellerId === userId);
  const otherListings = allListings.filter((l) => l.sellerId !== userId);

  const filteredSales = (tab === "sales" ? myListings : otherListings)
    .slice()
    .sort((a, b) => parsePrice(a.priceLabel) - parsePrice(b.priceLabel))
    .filter((l) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const haystack = `${l.title} ${l.description} ${l.priceLabel}`.toLowerCase();
      return haystack.includes(q);
    });

  const listToShow = filteredSales;

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
                        Current tab: {tab === "sales" ? "My listings" : "Available listings"}
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
                Available listings
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

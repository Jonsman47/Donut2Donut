"use client";

import { useMemo, useState } from "react";
import ListingCard from "../../../components/ListingCard";
import { getDemoListings } from "../../../lib/demo";

type Filter = "All" | "Items" | "Currency" | "Services";

function parsePrice(label: string) {
  const n = Number(String(label).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function MarketPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState("Featured");
  const [isLoading, setIsLoading] = useState(false);

  const listings = useMemo(() => getDemoListings(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let out = listings.filter((l: any) => {
      const hay = `${l.title} ${l.sellerName} ${l.priceLabel}`.toLowerCase();
      const matchesQuery = q.length === 0 || hay.includes(q);

      const type = String((l as any).type ?? "").toLowerCase();
      const matchesFilter =
        filter === "All" ||
        (filter === "Items" && (type.includes("item") || type === "")) ||
        (filter === "Currency" && type.includes("currency")) ||
        (filter === "Services" && type.includes("service"));

      return matchesQuery && matchesFilter;
    });

    switch (sort) {
      case "Price: Low":
        out = out.slice().sort(
          (a: any, b: any) => parsePrice(a.priceLabel) - parsePrice(b.priceLabel)
        );
        break;
      case "Price: High":
        out = out.slice().sort(
          (a: any, b: any) => parsePrice(b.priceLabel) - parsePrice(a.priceLabel)
        );
        break;
      case "Trust: High":
        out = out.slice().sort(
          (a: any, b: any) => (b.trustPercent ?? 0) - (a.trustPercent ?? 0)
        );
        break;
      default:
        break;
    }

    return out;
  }, [listings, query, filter, sort]);

  function fakeRefresh() {
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 450);
  }

  return (
    <div>
      <section className="section-tight">
        <div className="container stack-20">
          <div className="card" style={{ padding: 24 }}>
            <div className="stack-16">
              <div className="stack-8">
                <span className="kicker">Donut2Donut marketplace</span>
                <h1 className="h1">Browse listings with escrow protection.</h1>
                <p className="p" style={{ maxWidth: 720 }}>
                  Clear proof requirements and structured disputes, built for real trades.
                </p>
              </div>

              <div className="stack-12">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 10,
                  }}
                >
                  <input
                    className="input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search items, services, sellers…"
                  />
                  <button className="btn btn-primary" onClick={fakeRefresh}>
                    Search
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(["All", "Items", "Currency", "Services"] as Filter[]).map(
                      (f) => (
                        <button
                          key={f}
                          onClick={() => {
                            setFilter(f);
                            fakeRefresh();
                          }}
                          className={f === filter ? "btn btn-soft" : "btn btn-ghost"}
                          style={{ height: 36, paddingInline: 14, borderRadius: 999 }}
                        >
                          {f}
                        </button>
                      )
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="badge badge-good">Escrow On</span>
                    <select
                      className="input select"
                      value={sort}
                      onChange={(e) => {
                        setSort(e.target.value);
                        fakeRefresh();
                      }}
                      style={{ width: 200 }}
                    >
                      <option>Featured</option>
                      <option>Price: Low</option>
                      <option>Price: High</option>
                      <option>Trust: High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="badge badge-primary">{filtered.length} results</span>
                <span className="badge">Proof required</span>
                <span className="badge">Disputes</span>
                <span className="badge badge-primary">Verified sellers</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid-cards">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="skel" style={{ height: 180 }} />
                  <div className="card-body stack-8">
                    <div className="skel" style={{ height: 14, width: "70%" }} />
                    <div className="skel" style={{ height: 14, width: "50%" }} />
                    <div className="skel" style={{ height: 32 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-cards">
              {filtered.map((l: any) => (
                <ListingCard
                  key={l.id}
                  href={`/listing/${l.id}`}
                  title={l.title}
                  imageUrl={l.imageUrl}
                  priceLabel={l.priceLabel}
                  sellerName={l.sellerName}
                  sellerVerified={l.sellerVerified}
                  trustPercent={l.trustPercent}
                  reviewCount={l.reviewCount}
                  delivery={l.delivery}
                  escrowOn={l.escrowOn}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

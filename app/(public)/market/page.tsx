"use client";

import { useMemo, useState } from "react";
import ListingCard from "../../../components/ListingCard";
import { getDemoListings } from "../../../lib/demo";

type Filter = "All" | "Items" | "Currency" | "Services";
type Sort = "Featured" | "Price: Low" | "Price: High" | "Trust: High";

function parsePrice(label: string) {
  const n = Number(String(label).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function MarketPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<Sort>("Featured");
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
    <div style={{ paddingTop: 86 }}>
      <section className="container section-tight">
        <div className="stack-10">
          {/* HEADER */}
          <div className="surface-strong glass border-grad" style={{ padding: 14 }}>
            <div className="stack-8">
              <div className="stack-4">
                <div className="kicker">Donut2Donut • marketplace</div>

                {/* BIG FIXED TITLE */}
                <h1
                  className="h1"
                  style={{
                    fontSize: "clamp(2.8rem, 5.2vw, 4.2rem)",
                    lineHeight: 1.02,
                    fontWeight: 950,
                    letterSpacing: "-0.035em",
                  }}
                >
                  A DonutSMP marketplace
                  <br />
                  that actually feels safe.
                </h1>

                <p className="p" style={{ maxWidth: 760 }}>
                  Escrow by default. Proof-based delivery. Disputes with receipts.
                  This is real-money UX — just for DonutSMP.
                </p>
              </div>

              {/* SEARCH */}
              <div className="surface glass" style={{ padding: 10 }}>
                <div className="stack-8">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 8,
                    }}
                  >
                    <input
                      className="input"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search items, services, sellers…"
                    />
                    <button
                      className="btn btn-primary"
                      onClick={fakeRefresh}
                      style={{ paddingInline: 16 }}
                    >
                      Search
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(["All", "Items", "Currency", "Services"] as Filter[]).map(
                        (f) => (
                          <button
                            key={f}
                            onClick={() => {
                              setFilter(f);
                              fakeRefresh();
                            }}
                            className={
                              f === filter ? "btn btn-soft" : "btn btn-ghost"
                            }
                            style={{
                              height: 36,
                              paddingInline: 12,
                              borderRadius: 999,
                              fontWeight: 850,
                              boxShadow:
                                f === filter ? "var(--shGlow)" : undefined,
                            }}
                          >
                            {f}
                          </button>
                        )
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="badge badge-good ring-glow">
                        Escrow ON
                      </span>
                      <select
                        className="input select"
                        value={sort}
                        onChange={(e) => {
                          setSort(e.target.value as Sort);
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
              </div>

              {/* STATS */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="badge badge-blue">{filtered.length} results</span>
                <span className="badge">Proof required</span>
                <span className="badge">Disputes</span>
                <span className="badge badge-blue">Verified sellers</span>
              </div>
            </div>
          </div>

          {/* GRID */}
          {isLoading ? (
            <div className="grid-cards">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="skel" style={{ height: 180 }} />
                  <div style={{ padding: 14 }} className="stack-8">
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

import Image from "next/image";

const trades = [
  {
    title: "Elytras / Movement",
    badge: "Escrow on",
    meta: "Starting at 14D",
    image: "/featured/elytra.webp",
  },
  {
    title: "Spawners / Farms",
    badge: "Escrow on",
    meta: "Popular",
    image: "/featured/spawner.webp",
  },
  {
    title: "Maces / PvP",
    badge: "Escrow on",
    meta: "Starting at 9D",
    image: "/featured/mace.png",
  },
  {
    title: "God Swords / Enchants",
    badge: "Escrow on",
    meta: "Hot listings",
    image: "/featured/sword.gif",
  },
];

export default function FeaturedTrades() {
  return (
    <section className="container section">
      <div className="section-header">
        <span className="kicker">Featured trades</span>
        <h2 className="h2">Browse what's moving fast right now.</h2>
        <p className="p">
          High-demand categories with escrow on by default.
        </p>
      </div>
      <div className="grid-4 featured-grid">
        {trades.map((trade) => (
          <div key={trade.title} className="card featured-card">
            <div className="card-img featured-image">
              <Image
                src={trade.image}
                alt={trade.title}
                width={160}
                height={160}
              />
            </div>
            <div className="stack-6">
              <div className="featured-title">{trade.title}</div>
              <div className="featured-meta">
                <span className="pill pill-primary">{trade.badge}</span>
                <span className="pill pill-muted">{trade.meta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

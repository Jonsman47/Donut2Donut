const stats = [
  { label: "Escrowed trades", value: "98%" },
  { label: "Median release", value: "< 2h" },
  { label: "Dispute resolution", value: "24h avg" },
];

const reviews = [
  "“Escrow makes every trade feel effortless.”",
  "“Proof + fast reviews keep deals clean.”",
];

export default function TrustStrip() {
  return (
    <section className="container section trust-strip">
      <div className="trust-inner">
        <div className="trust-stats">
          {stats.map((stat) => (
            <div key={stat.label} className="trust-stat">
              <div className="trust-value">{stat.value}</div>
              <div className="muted">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="trust-reviews">
          {reviews.map((review) => (
            <div key={review} className="trust-quote">
              {review}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

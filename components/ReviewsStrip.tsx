const reviews = [
  {
    name: "@mineshaft",
    text: "Escrow by default makes trades feel instant and safe.",
    date: "Mar 12, 2025",
  },
  {
    name: "@donutcore",
    text: "Proof-first delivery keeps every listing clean.",
    date: "Apr 2, 2025",
  },
  {
    name: "@embervault",
    text: "Fast dispute handling is the reason we moved here.",
    date: "Apr 18, 2025",
  },
];

export default function ReviewsStrip() {
  return (
    <section className="section reviews-section">
      <div className="container">
        <div className="section-header reviews-header">
          <h2 className="h2">What our community says</h2>
        </div>
        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review.name} className="review-card glass-card">
              <div className="review-stars" aria-hidden="true">
                {"★★★★★"}
              </div>
              <div className="review-text">“{review.text}”</div>
              <div className="review-meta">
                <span className="review-name">{review.name}</span>
                <span className="review-date">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

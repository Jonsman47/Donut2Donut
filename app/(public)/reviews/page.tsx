"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function SiteReviewsPage() {
  const { status } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [average, setAverage] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function loadReviews(reset = false, nextPage?: number) {
    const pageValue = reset ? 1 : nextPage ?? page;
    const res = await fetch(`/api/site-reviews?page=${pageValue}&pageSize=6`);
    if (!res.ok) return;
    const data = await res.json();
    setAverage(data.averageRating ?? 0);
    setTotal(data.total ?? 0);
    setPage(pageValue);
    if (reset) {
      setReviews(data.reviews || []);
    } else {
      setReviews((prev) => [...prev, ...(data.reviews || [])]);
    }
  }

  useEffect(() => {
    loadReviews(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitReview() {
    setMessage(null);
    const res = await fetch("/api/site-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, text }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error || "Failed to submit review");
      return;
    }
    setMessage("Thanks for the feedback!");
    setText("");
    await loadReviews(true);
  }

  const canLoadMore = reviews.length < total;

  return (
    <div className="container section">
      <div className="stack-14">
        <div className="stack-6">
          <h1 className="h2" style={{ margin: 0 }}>
            Site Reviews
          </h1>
          <div className="muted">Average rating: {average.toFixed(1)} ★</div>
        </div>

        <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
          <div className="stack-8">
            <strong>Share your feedback</strong>
            {status !== "authenticated" && (
              <div className="badge badge-warn">Sign in to leave a review.</div>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  className={rating === value ? "btn btn-primary" : "btn btn-ghost"}
                  type="button"
                  onClick={() => setRating(value)}
                  disabled={status !== "authenticated"}
                >
                  {value}★
                </button>
              ))}
            </div>
            <textarea
              className="input"
              rows={3}
              placeholder="What should we improve?"
              value={text}
              onChange={(event) => setText(event.target.value)}
              disabled={status !== "authenticated"}
            />
            <button className="btn btn-secondary" type="button" onClick={submitReview} disabled={status !== "authenticated"}>
              Submit review
            </button>
            {message && <div className="muted">{message}</div>}
          </div>
        </div>

        <div className="grid-2" style={{ gap: 12 }}>
          {reviews.map((review) => (
            <div key={review.id} className="surface" style={{ padding: 16, borderRadius: 16 }}>
              <div className="stack-6">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong>{review.user?.username || "Anonymous"}</strong>
                  <span className="badge badge-blue">{review.rating}★</span>
                </div>
                <div className="muted">{review.text || "No comment"}</div>
                <div className="small">{new Date(review.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>

        {canLoadMore && (
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => loadReviews(false, page + 1)}
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}

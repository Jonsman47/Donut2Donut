"use client";

import Link from "next/link";

const TOS_SECTIONS = [
  {
    title: "Account & eligibility",
    items: [
      "You are responsible for keeping your account secure.",
      "You must provide accurate profile details for payouts and disputes.",
      "We can request additional verification if activity looks suspicious.",
    ],
  },
  {
    title: "Seller obligations",
    items: [
      "Listings must match what is delivered in-game.",
      "Proof uploads are required for payout release.",
      "Failure to deliver may result in refunds or penalties.",
    ],
  },
  {
    title: "Buyer obligations",
    items: [
      "Pay through the platform escrow only.",
      "Confirm delivery only when items/services are received.",
      "Disputes must be opened within the stated window.",
    ],
  },
  {
    title: "Prohibited activity",
    items: [
      "Scams, chargeback abuse, or fake proof are not allowed.",
      "Harassment or threats will result in bans.",
      "Attempting to bypass platform fees is forbidden.",
    ],
  },
  {
    title: "Disputes & enforcement",
    items: [
      "Staff may review chat logs, listings, and proof uploads.",
      "Decisions are final when evidence is clear.",
      "We can suspend accounts to protect marketplace safety.",
    ],
  },
];

export default function TosPage() {
  return (
    <div className="container section">
      <div className="stack-14" style={{ maxWidth: 860, margin: "0 auto" }}>
        <div className="stack-6">
          <h1 className="h2" style={{ margin: 0 }}>
            Terms of Service
          </h1>
          <div className="muted">
            Short, readable rules for selling on the marketplace.
          </div>
        </div>

        <div className="grid-2" style={{ gap: 14 }}>
          {TOS_SECTIONS.map((section) => (
            <div key={section.title} className="surface" style={{ padding: 18, borderRadius: 18 }}>
              <div className="stack-6">
                <strong>{section.title}</strong>
                <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="surface" style={{ padding: 18, borderRadius: 18 }}>
          <div className="stack-6">
            <strong>Questions?</strong>
            <div className="muted">
              If anything is unclear, contact staff before listing items.
            </div>
            <Link className="btn btn-secondary" href="/verify/setup">
              Back to verification
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

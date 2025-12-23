export type OrderRole = "buyer" | "seller";

export const ORDER_STATUSES = [
  "REQUESTED",
  "ACCEPTED",
  "PAID_ESCROW",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "DISPUTE_OPEN",
] as const;

export function getStatusTone(status: string) {
  switch (status) {
    case "REQUESTED":
      return "badge badge-warn";
    case "ACCEPTED":
    case "PAID_ESCROW":
      return "badge badge-blue";
    case "DELIVERED":
      return "badge badge-soft";
    case "COMPLETED":
      return "badge badge-green";
    case "CANCELLED":
    case "REFUNDED":
      return "badge badge-ghost";
    case "DISPUTE_OPEN":
      return "badge badge-warn";
    default:
      return "badge";
  }
}

export function getNextActionBanner(params: {
  status: string;
  role: OrderRole;
}) {
  const { status, role } = params;

  if (status === "REQUESTED") {
    return role === "seller"
      ? "New order request! Accept or decline."
      : "Waiting for the seller to accept your request.";
  }

  if (status === "ACCEPTED") {
    return role === "buyer"
      ? "Request accepted. Please pay the escrow."
      : "Waiting for buyer payment.";
  }

  if (status === "PAID_ESCROW") {
    return "Escrow secured. Meet in-game, record/verify, then confirm here.";
  }

  if (status === "COMPLETED") {
    return "Trade completed successfully.";
  }

  if (status === "CANCELLED") {
    return "Order cancelled.";
  }

  if (status === "DISPUTE_OPEN") {
    return "Dispute open. Support is reviewing.";
  }

  return "";
}

export function formatCurrency(cents: number) {
  return `${(cents / 100).toFixed(2)} €`;
}

export function formatDate(value: string | Date) {
  return new Date(value).toLocaleString();
}

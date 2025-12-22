export type OrderRole = "buyer" | "seller";

export const ORDER_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "DISPUTE",
] as const;

export function getStatusTone(status: string) {
  switch (status) {
    case "PENDING":
      return "badge badge-warn";
    case "ACCEPTED":
    case "PAID":
      return "badge badge-blue";
    case "SHIPPED":
    case "DELIVERED":
      return "badge badge-soft";
    case "COMPLETED":
      return "badge badge-green";
    case "DECLINED":
    case "CANCELLED":
      return "badge badge-ghost";
    case "DISPUTE":
      return "badge badge-warn";
    default:
      return "badge";
  }
}

export function getNextActionBanner(params: {
  status: string;
  role: OrderRole;
  deliveryType: string;
}) {
  const { status, role, deliveryType } = params;

  if (status === "PENDING") {
    return role === "seller"
      ? "Waiting for you to accept or decline this order."
      : "Waiting for the seller to accept. You can cancel while pending.";
  }

  if (status === "ACCEPTED") {
    if (role === "seller") {
      return deliveryType === "SERVICE"
        ? "Mark delivered when the service is complete."
        : "Mark as shipped when the delivery is on the way.";
    }
    return "Order accepted. Keep an eye on updates from the seller.";
  }

  if (status === "PAID") {
    return role === "seller"
      ? "Payment received. Fulfill the order next."
      : "Payment confirmed. Waiting on seller fulfillment.";
  }

  if (status === "SHIPPED") {
    return role === "buyer"
      ? "Seller marked as shipped. Confirm when received."
      : "Waiting for buyer confirmation.";
  }

  if (status === "DELIVERED") {
    return role === "buyer"
      ? "Service marked delivered. Confirm to complete."
      : "Waiting for buyer confirmation.";
  }

  if (status === "COMPLETED") {
    return role === "buyer"
      ? "Order completed. Leave a review to help the seller."
      : "Order completed. Thank you for fulfilling it.";
  }

  if (status === "DECLINED") {
    return "Order declined. No further action is required.";
  }

  if (status === "CANCELLED") {
    return "Order cancelled. No further action is required.";
  }

  if (status === "DISPUTE") {
    return "Dispute opened. Support will review the issue.";
  }

  return "";
}

export function formatCurrency(cents: number) {
  return `${(cents / 100).toFixed(2)} €`;
}

export function formatDate(value: string | Date) {
  return new Date(value).toLocaleString();
}

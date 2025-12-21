import Stripe from "stripe";
import { db } from "./db";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key ? new Stripe(key, { apiVersion: "2024-06-20" as any }) : null;

export async function createPaymentIntentForEscrow(opts: {
  orderId: string;
  amountCents: number;
  currency: string;
  buyerEmail?: string;
}) {
  if (!stripe) {
    // DEV MODE: fake payment
    return { id: `dev_pi_${opts.orderId}`, client_secret: "dev_client_secret" } as any;
  }

  return stripe.paymentIntents.create({
    amount: opts.amountCents,
    currency: opts.currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata: { orderId: opts.orderId },
    receipt_email: opts.buyerEmail,
  });
}

export async function releaseToSeller(orderId: string) {
  // If no Stripe keys, just mark released for dev testing.
  const order = await db.order.findUnique({ where: { id: orderId }, include: { seller: { include: { sellerProfile: true } } } });
  if (!order) throw new Error("Order not found");

  if (!stripe) {
    await db.order.update({ where: { id: orderId }, data: { status: "RELEASED_TO_SELLER", releasedAt: new Date(), stripeTransferId: "dev_transfer" } });
    return { id: "dev_transfer" } as any;
  }

  const sp = order.seller.sellerProfile;
  if (!sp?.stripeAccountId) throw new Error("Seller not connected");
  if (sp.payoutsFrozen) throw new Error("Payouts frozen");

  const sellerAmount = order.subtotalCents - order.platformFeeCents;

  const transfer = await stripe.transfers.create({
    amount: sellerAmount,
    currency: "eur",
    destination: sp.stripeAccountId,
    metadata: { orderId: order.id },
  });

  await db.order.update({
    where: { id: orderId },
    data: { stripeTransferId: transfer.id, releasedAt: new Date(), status: "RELEASED_TO_SELLER" },
  });

  return transfer;
}

export async function refundBuyer(orderId: string, amountCents?: number) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order?.stripePaymentIntentId) throw new Error("No payment intent");

  if (!stripe) {
    await db.order.update({ where: { id: orderId }, data: { status: amountCents ? "PARTIAL_REFUND" : "REFUNDED" } });
    return { id: "dev_refund" } as any;
  }

  const refund = await stripe.refunds.create({
    payment_intent: order.stripePaymentIntentId,
    amount: amountCents,
    metadata: { orderId },
  });

  await db.order.update({
    where: { id: orderId },
    data: { status: amountCents ? "PARTIAL_REFUND" : "REFUNDED" },
  });

  return refund;
}

export const PLATFORM_FEE_BPS = 1000; // 10%

export function platformFeeCents(subtotalCents: number) {
  return Math.round((subtotalCents * PLATFORM_FEE_BPS) / 10000);
}

export function makeSafeTradeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function eur(cents: number) {
  return (cents / 100).toFixed(2);
}

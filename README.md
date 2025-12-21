# DonutSMP Market (MVP)

This is a working starter that matches your blueprint:
- Escrow-first checkout (Stripe if keys exist, DEV mode if not)
- Anti-scam: safe trade code, proof policy, disputes, reports, trust levels, seller caps
- Pages: Home, Market, Listing, Seller profile, Cart, Checkout, Orders hub, Seller dashboard

## Quick start (local)

1) Copy env
- Duplicate `.env.example` -> `.env`
- For fastest local DB: set
  DATABASE_URL="file:./dev.db"
  and in `prisma/schema.prisma` change provider to `sqlite`.

2) Install
- npm i

3) DB
- npm run db:push
- npm run db:seed

4) Run
- npm run dev
- open http://localhost:3000

## Notes
- Login is "Dev Login" (username + optional email). Swap to Discord provider later.
- Upload presign is a stub (add S3/R2).
- Admin actions endpoints exist (freeze payouts, refund, release), but UI is minimal.

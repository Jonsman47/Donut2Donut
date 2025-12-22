"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import { getListingById } from "@/lib/demo";
import { ListingActions } from "./ListingActions";

type PageProps = {
  params: { id: string };
};

type TradeStage =
  | "REQUEST"
  | "ACCEPT"
  | "PAY"
  | "INGAME"
  | "PROOFS"
  | "COMPLETE"
  | "DISPUTE";

export default async function ListingPage({ params }: PageProps) {
  const listing = await getListingById(params.id);
  if (!listing) return notFound();

  // Pour l'instant : stage fixe (mock)
  const stage: TradeStage = "REQUEST";

  return (
    <div style={{ paddingTop: 86 }}>
      <section className="container section-tight">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr .8fr",
            gap: 16,
          }}
        >
          {/* LEFT : annonce + flow */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Media + titre */}
            <div
              className="surface glass border-grad"
              style={{ padding: 12, borderRadius: 22 }}
            >
              <div
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  marginBottom: 10,
                }}
              >
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  width={1400}
                  height={900}
                  style={{
                    width: "100%",
                    height: 260,
                    objectFit: "cover",
                  }}
                  priority
                />
              </div>

              <div className="stack-6">
                <div className="kicker">Annonce DonutSMP</div>
                <h1
                  className="h1"
                  style={{ fontSize: 22, fontWeight: 950, margin: 0 }}
                >
                  {listing.title}
                </h1>
                <p
                  className="p"
                  style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}
                >
                  Trade encadré par escrow : demande d&apos;achat, acceptation,
                  paiement, échange in‑game, preuves vidéo et litiges 48h.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 6,
                  }}
                >
                  <span className="badge badge-good">Escrow ON</span>
                  <span className="badge">Preuves vidéo requises</span>
                  <span className="badge">Litige 48h</span>
                  <span className="badge">
                    Livraison : {listing.delivery}
                  </span>
                </div>
              </div>
            </div>

            {/* Flow 4 étapes + litiges */}
            <div className="surface glass" style={{ padding: 14, borderRadius: 22 }}>
              <div className="stack-8">
                <div className="kicker">Flow de trade</div>
                <h2 className="h2" style={{ fontSize: 18, margin: 0 }}>
                  Comment ce trade va se dérouler
                </h2>

                <div className="stack-6">
                  <TradeStep
                    step="Étape 1"
                    title="Mise en vente & demande d'achat"
                    active={stage === "REQUEST"}
                    description="Le vendeur liste l'item (pioche, kit, service) avec pseudo Minecraft et prix. L'acheteur envoie une demande d'achat depuis cette page."
                  />
                  <TradeStep
                    step="Étape 2"
                    title="Acceptation & paiement escrow"
                    active={stage === "ACCEPT" || stage === "PAY"}
                    description="Le vendeur accepte la demande. L'acheteur paie via le site, l'argent est bloqué en escrow. Un code d'échange unique est généré pour ce trade."
                  />
                  <TradeStep
                    step="Étape 3"
                    title="Échange in‑game discret"
                    active={stage === "INGAME"}
                    description="Les deux joueurs se connectent sur Donut SMP (alts, coords, ender chest) et font l'échange sans /trade visible. Chacun enregistre une courte vidéo."
                  />
                  <TradeStep
                    step="Étape 4"
                    title="Validation, libération & litiges"
                    active={stage === "PROOFS" || stage === "COMPLETE"}
                    description="Les preuves vidéo sont upload sur le site et les deux cliquent “Échange OK”. Si tout est clean, l'escrow paie le vendeur. Sinon, un litige peut être ouvert pendant 48h."
                  />
                  <TradeStep
                    step="Litiges"
                    title="Scam & résolution"
                    active={stage === "DISPUTE"}
                    description="Si un joueur ne respecte pas les règles (pas de vidéo, item manquant...), l'autre peut ouvrir un litige. Les preuves sont analysées, l'argent va à la victime et le scammeur est blacklisté."
                  />
                </div>
              </div>
            </div>

            {/* Vendeur / confiance */}
            <div className="surface glass" style={{ padding: 14, borderRadius: 22 }}>
              <h2 className="h2" style={{ fontSize: 16, marginBottom: 8 }}>
                Vendeur & confiance
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    background:
                      "radial-gradient(circle at 30% 30%, rgba(120,220,255,.24), rgba(10,16,32,.6))",
                    border: "1px solid rgba(120,170,255,.18)",
                  }}
                />
                <div>
                  <div style={{ fontWeight: 900 }}>{listing.sellerName}</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                    }}
                  >
                    {listing.trustPercent}% trust • {listing.reviewCount} reviews
                  </div>
                </div>
                <span
                  className="badge"
                  style={{ marginLeft: "auto", fontSize: 11 }}
                >
                  {listing.sellerVerified ? "Vendeur vérifié" : "Vendeur standard"}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 8,
                }}
              >
                <StatBox label="Trust" value={`${listing.trustPercent}%`} />
                <StatBox
                  label="Avis"
                  value={listing.reviewCount.toString()}
                />
                <StatBox label="Livraison" value={listing.delivery} />
              </div>
            </div>
          </div>

          {/* RIGHT : bloc trade / actions */}
          <aside
            style={{
              position: "sticky",
              top: 90,
              alignSelf: "flex-start",
            }}
          >
            <div
              className="surface-strong glass border-grad"
              style={{ padding: 16, borderRadius: 22 }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 950,
                  marginBottom: 4,
                }}
              >
                {listing.priceLabel}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  marginBottom: 10,
                }}
              >
                Prix indicatif de cette annonce démo. Plus tard, ce montant sera
                lié à une commande escrow réelle (Order) avec paiement et code
                d&apos;échange.
              </div>

              {/* À terme : quantité + total */}
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  Quantité (mock)
                </span>
                <input
                  className="input"
                  defaultValue={1}
                  style={{ width: 60, padding: 6, fontSize: 13 }}
                />
              </div>

              {/* Actions : Étape 1 réelle + reste mock */}
              <div className="stack-8">
                <ListingActions listingId={listing.id} />

                <button className="btn btn-ghost" style={{ width: "100%" }}>
                  Étape 2 · (Vendeur) Accepter la demande (mock)
                </button>
                <button className="btn btn-ghost" style={{ width: "100%" }}>
                  Étape 3 · (Acheteur) Payer et recevoir le code (mock)
                </button>
                <button className="btn btn-ghost" style={{ width: "100%" }}>
                  Étape 4 · Uploader les preuves & confirmer (mock)
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ width: "100%", marginTop: 4 }}
                >
                  Ouvrir un litige (mock)
                </button>
              </div>

              <div
                className="p"
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  marginTop: 10,
                }}
              >
                Quand on branchera Prisma et les Orders, ces boutons mettront à
                jour le statut du trade (REQUESTED, PAID, INGAME, COMPLETED,
                DISPUTED…) et déclencheront le payout ou le refund.
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

type TradeStepProps = {
  step: string;
  title: string;
  description: string;
  active: boolean;
};

function TradeStep({ step, title, description, active }: TradeStepProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        opacity: active ? 1 : 0.75,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          border: "2px solid rgba(120,170,255,0.6)",
          background: active
            ? "rgba(120,170,255,0.2)"
            : "rgba(10,16,32,0.6)",
          marginTop: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 900,
          color: "#e5f3ff",
        }}
      >
        {step.replace("Étape ", "")}
      </div>
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            marginBottom: 2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#9ca3af",
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: 10,
        border: "1px solid rgba(120,170,255,.12)",
        background: "rgba(10,16,32,.32)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: ".06em",
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 4, fontWeight: 950, fontSize: 14 }}>{value}</div>
    </div>
  );
}

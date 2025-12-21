import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

function slugify(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

async function main(){
  // categories
  const roots = [
    { name: "In-game Items", children: ["Armor", "Tools", "Weapons", "Rare collectibles", "Enchants", "Kits", "Currency"] },
    { name: "Services", children: ["Building", "Coaching / PvP", "Editing / thumbnails", "Discord setup / bots"] },
    { name: "Digital goods", children: ["Textures", "Overlays", "Configs"] }
  ];

  for (const r of roots){
    const root = await db.category.upsert({
      where: { slug: slugify(r.name) },
      update: { name: r.name },
      create: { name: r.name, slug: slugify(r.name) }
    });
    for (const ch of r.children){
      await db.category.upsert({
        where: { slug: slugify(`${r.name}-${ch}`) },
        update: { name: ch, parentId: root.id },
        create: { name: ch, slug: slugify(`${r.name}-${ch}`), parentId: root.id }
      });
    }
  }

  // demo users
  const seller = await db.user.upsert({
    where: { username: "demo_seller" },
    update: {},
    create: { username: "demo_seller", email: "seller@example.com", role: "SELLER" }
  });

  await db.sellerProfile.upsert({
    where: { userId: seller.id },
    update: { trustLevel: 3, trustScore: 420, listingLimit: 50, maxPriceCents: 50000, payoutHoldDays: 2, discordVerified: true, twoFAEnabled: true },
    create: {
      userId: seller.id,
      bio: "Fast delivery. Proof always. No scam.",
      timezone: "Europe/Paris",
      rules: "No refunds after confirmed delivery.",
      trustLevel: 3,
      trustScore: 420,
      listingLimit: 50,
      maxPriceCents: 50000,
      payoutHoldDays: 2,
      discordVerified: true,
      twoFAEnabled: true
    }
  });

  const cat = await db.category.findFirst({ where: { slug: slugify("In-game Items-Kits") } }) 
          ?? await db.category.findFirst({ where: { name: "Kits" } });

  // demo listing
  await db.listing.create({
    data: {
      sellerId: seller.id,
      categoryId: cat.id,
      title: "Starter Kit (DonutSMP)",
      description: "Manual delivery in DMs. We schedule a trade, then deliver in-game.",
      whatYouGet: "1x Starter kit bundle\n- Tools\n- Food\n- Basic armor\n- 10k currency",
      priceCents: 1000,
      deliveryType: "INGAME_TRADE",
      escrowOnly: true,
      stock: 10,
      proofPolicy: {
        create: { requireStamp: true, requireScoreboard: true, requireSafeTradeCode: true, requireVideo: false }
      }
    }
  });

  console.log("Seed done.");
}

main().finally(()=>db.$disconnect());

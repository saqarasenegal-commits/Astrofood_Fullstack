/ pages/api/packs.js

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const packs = [
    {
      id: "premium-12-signs",
      name: "AstroFood Premium Gold – Pack 12 signes",
      level: "Édition AstroFood Premium Gold",
      description:
        "12 cartes digitales (1 par signe) avec 3 recettes par jour (petit-déj, déjeuner, dîner), FR / EN / AR.",
      priceCfa: 15000,
      currency: "XOF",
      checkoutUrl: "https://astrofood-premium-gold.com/checkout/premium12", // à remplacer plus tard par ton lien LemonSqueezy
    },
    {
      id: "breakfast-energy",
      name: "Pack Petit-déjeuner Énergie – 12 signes",
      level: "Édition AstroFood",
      description:
        "Recettes de petit-déjeuner pour booster l’énergie selon chaque signe astrologique.",
      priceCfa: 9000,
      currency: "XOF",
      checkoutUrl: "https://astrofood-premium-gold.com/checkout/breakfast", // placeholder
    },
    {
      id: "love-dinners",
      name: "Pack Love & Dîners Romantiques",
      level: "Édition AstroFood Romance",
      description:
        "Recettes & dîners romantiques cosy selon les signes, parfait pour soirées love.",
      priceCfa: 6000,
      currency: "XOF",
      checkoutUrl: "https://astrofood-premium-gold.com/checkout/love", // placeholder
    },
  ];

  res.status(200).json({
    ok: true,
    packs,
  });
}

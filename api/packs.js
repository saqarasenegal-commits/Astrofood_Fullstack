// pages/api/packs.js

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ ok: false, error: "Method not allowed" });
  }

  const packs = [
    {
      id: "premium-12-signes",
      name: "AstroFood Premium Gold - Pack 12 signes",
      level: "Edition AstroFood Premium Gold",
      description:
        "12 cartes digitales (1 par signe) avec 3 recettes par jour (petit-dejeuner, dejeuner, diner).",
      priceCfa: 29000,
      currency: "XOF",
      checkoutUrl: "https://example.com/checkout/premium-12",
    },
    {
      id: "breakfast-energie",
      name: "Pack Petit-dejeuner Energie - 12 signes",
      level: "Edition AstroFood",
      description:
        "Recettes de petit-dejeuner pour booster l'energie selon chaque signe astrologique.",
      priceCfa: 17000,
      currency: "XOF",
      checkoutUrl: "https://example.com/checkout/breakfast",
    },
    {
      id: "love-dinners",
      name: "Pack Love et Diners Romantiques",
      level: "Edition AstroFood Romance",
      description:
        "Recettes et diners romantiques cosy selon les signes, ideal pour soirees love.",
      priceCfa: 19000,
      currency: "XOF",
      checkoutUrl: "https://example.com/checkout/love",
    },
  ];

  return res.status(200).json({
    ok: true,
    packs,
  });
}

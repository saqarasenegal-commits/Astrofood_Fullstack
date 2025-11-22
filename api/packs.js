// api/packs.js

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const packs = [
    {
      id: "pack_12_signes",
      name: "Pack 12 Signes – Carte journalière",
      priceCfa: 15000,
      currency: "XOF",
      description: "12 cartes digitales Premium (1 par signe, 3 repas / jour).",
      level: "Premium Gold",
      checkoutUrl: "https://your-lemon-link.com/pack_12_signes",
    },
    {
      id: "pack_love",
      name: "Pack Love & Romance",
      priceCfa: 9000,
      currency: "XOF",
      description: "Recettes romantiques par signe, pour dîner à deux.",
      level: "Special Love Edition",
      checkoutUrl: "https://your-lemon-link.com/pack_love",
    },
  ];

  res.status(200).json({ ok: true, packs });
}


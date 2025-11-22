
// api/chat.js

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY manquant dans les variables d'environnement Vercel");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const { message, sign, lang } = req.body || {};

    if (!message) {
      res.status(400).json({ ok: false, error: "Message manquant." });
      return;
    }

    const safeLang = ["fr", "en", "ar"].includes(lang) ? lang : "fr";
    const safeSign = sign || "général";

    const systemPrompt = `
Tu es "AstroFood Chat-AI", expert en nutrition, astrologie et cuisine saine.
- Tu expliques les recettes, étapes de préparation, temps de cuisson, variantes santé.
- Tu peux adapter les conseils selon le signe astrologique (${safeSign}) et l'état énergétique.
- Réponds de manière courte, claire, chaleureuse.
- Langue: ${safeLang}.
`.trim();

    const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
      }),
    });

    if (!openaiResp.ok) {
      const text = await openaiResp.text();
      console.error("❌ Erreur OpenAI /api/chat:", text);
      res.status(500).json({ ok: false, error: "Erreur OpenAI" });
      return;
    }

    const data = await openaiResp.json();
    const reply =
      data?.choices?.[0]?.message?.content || "Je n'ai pas compris, peux-tu reformuler ?";

    res.status(200).json({ ok: true, reply });
  } catch (err) {
    console.error("❌ Erreur serveur /api/chat:", err);
    res.status(500).json({ ok: false, error: "Erreur serveur." });
  }
}

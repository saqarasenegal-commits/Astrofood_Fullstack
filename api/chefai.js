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
    const { sign, state, mealType, lang } = req.body || {};

    if (!sign || !mealType) {
      res.status(400).json({
        ok: false,
        error: "Paramètres manquants (sign, mealType).",
      });
      return;
    }

    const safeLang = ["fr", "en", "ar"].includes(lang) ? lang : "fr";
    const safeState = state || "équilibre";

    let langInstruction;
    if (safeLang === "fr") {
      langInstruction =
        "Langue : français. Tous les textes des recettes (titre, description, ingrédients, étapes) doivent être en français.";
    } else if (safeLang === "en") {
      langInstruction =
        "Response language: English. All recipe texts (title, description, ingredients, steps) must be in English.";
    } else if (safeLang === "ar") {
      langInstruction =
        "لغة الإجابة: العربية. يجب أن تكون جميع نصوص الوصفات (العنوان، الوصف، المكونات، خطوات التحضير) باللغة العربية.";
    }

    const userPrompt = `
Génère 3 recettes complètes pour :

- Signe astrologique : ${sign}
- État énergétique : ${safeState}
- Type de repas : ${mealType}

Respecte strictement ce format JSON :

{
  "recipes": [
    {
      "title": "Titre ou عنوان ou Title",
      "image": "URL d'image illustrative (ou null)",
      "description": "Texte court pour présenter la recette",
      "ingredients": ["ingrédient 1", "ingrédient 2", "..."],
      "steps": ["Étape 1", "Étape 2", "..."]
    }
  ]
}
`.trim();

    const systemPrompt = `
Tu es AstroFood Chef-AI, chef-nutritionniste expert en astrologie.
Réponds UNIQUEMENT en JSON valide.
N'ajoute PAS de texte avant ou après le JSON.
${langInstruction}
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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!openaiResp.ok) {
      const text = await openaiResp.text();
      console.error("❌ Erreur OpenAI /api/chefai:", text);
      res.status(500).json({ ok: false, error: "Erreur OpenAI" });
      return;
    }

    const data = await openaiResp.json();
    const rawContent = data?.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      console.error("❌ JSON invalide renvoyé par l'IA:", rawContent);
      res.status(500).json({
        ok: false,
        error: "Réponse IA invalide (JSON).",
      });
      return;
    }

    res.status(200).json({
      ok: true,
      recipes: parsed.recipes || [],
    });
  } catch (err) {
    console.error("❌ Erreur serveur /api/chefai:", err);
    res.status(500).json({ ok: false, error: "Erreur serveur." });
  }
}

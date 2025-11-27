// pages/api/chefai.js

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // =========================
    // 🌍 LANGUE POUR LES RECETTES
    // =========================
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

    // =========================
    // 🍽️ PROMPT RECETTES
    // =========================
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
      "image": null,
      "description": "Texte court pour présenter la recette",
      "ingredients": ["ingrédient 1", "ingrédient 2"],
      "steps": ["Étape 1", "Étape 2"]
    }
  ]
}
`.trim();

    const systemPrompt = `
Tu es AstroFood Chef-AI, chef-nutritionniste expert en astrologie.
Réponds UNIQUEMENT en ${langInstruction}
Garde un ton chaleureux, clair, facile à comprendre.
N'ajoute PAS de texte avant ou après le JSON.
`.trim();

    // ===============================
    // 🔥 APPEL IA POUR LES RECETTES
    // ===============================
    const respRecipe = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const rawContent = respRecipe.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      console.error("❌ JSON invalide pour les recettes:", rawContent);
      res.status(500).json({
        ok: false,
        error: "Réponse IA invalide (JSON recettes).",
      });
      return;
    }

    const recipes = parsed.recipes || [];

    // --------------------------------------------------------------------
    // STEP 2 — Générer une image FOOD (OpenAI Images → data URL)
    // --------------------------------------------------------------------
    let imageUrl = null;

    try {
      const mainRecipe = recipes[0] || {};
      const baseTitle =
        mainRecipe.title || `${mealType} pour le signe ${sign}`;

      const imagePrompt = `
high quality food photography, no text, no watermark,
${baseTitle}, plated on a table, warm light
      `.trim();

      const imgResp = await client.images.generate({
        model: "gpt-image-1-mini",
        prompt: imagePrompt,
        size: "1024x1024",
        n: 1,
        // on laisse le format par défaut (b64_json)
      });

      const b64 = imgResp.data?.[0]?.b64_json;
      if (b64) {
        imageUrl = `data:image/png;base64,${b64}`;
      }
    } catch (e) {
      console.error("❌ Erreur génération image:", e);
      imageUrl = null;
    }

    // =========================
    // ✅ RÉPONSE FINALE
    // =========================
    return res.status(200).json({
      ok: true,
      recipes,
      imageUrl, // data URL si image OK, sinon null
    });
  } catch (err) {
    console.error("❌ Erreur serveur /api/chefai:", err);
    res.status(500).json({ ok: false, error: "Erreur serveur." });
  }
}

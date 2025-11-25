// api/chefai.js

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
Réponds UNIQUEMENT en ${langInstruction}.
Garde un ton chaleureux, clair, facile à comprendre.
N'ajoute PAS de texte avant ou après le JSON.
`.trim();

    // ===============================
    // 🔥 APPEL IA POUR LES RECETTES
    // ===============================
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
      return res.status(500).json({ ok: false, error: "Erreur OpenAI" });
    }

    const data = await openaiResp.json();
    const rawContent = data?.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      console.error("❌ JSON invalide renvoyé par l'IA:", rawContent);
      return res.status(500).json({
        ok: false,
        error: "Réponse IA invalide (JSON).",
      });
    }

    const recipes = parsed.recipes || [];

    // ====================================
    // 🖼️ IMAGE IA (UNIQUE POUR LE SIGN + REPAS)
    // ====================================

    // 🔥 Prompt image selon la langue
    let imagePrompt = `
Illustration food stylisée pour le signe astrologique ${sign}
avec un thème ${mealType}. Style premium doré, ambiance AstroFood,
très élégant, sans texte écrit.
`;

    if (safeLang === "en") {
      imagePrompt = `
Stylized food illustration representing zodiac sign ${sign},
meal type: ${mealType}. Premium golden style, AstroFood branding,
no text written on the image.
`;
    }

    if (safeLang === "ar") {
      imagePrompt = `
صورة طعام فنية تمثل برج ${sign} مع طبق ${mealType}.
أسلوب فاخر ذهبي بدون أي نص مكتوب على الصورة.
`;
    }

    // Appel API image
    const imageResp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: imagePrompt,
        size: "512x512",
        n: 1,
      }),
    });

    let imageUrl = null;
    if (imageResp.ok) {
      const imgData = await imageResp.json();
      imageUrl = imgData?.data?.[0]?.url || null;
    }

    // =========================
    // ✅ RÉPONSE FINALE
    // =========================
    return res.status(200).json({
      ok: true,
      recipes,
      imageUrl,   // ←🔥 ajoute l'image ici
    });

  } catch (err) {
    console.error("❌ Erreur serveur /api/chefai:", err);
    res.status(500).json({ ok: false, error: "Erreur serveur." });
  }
}


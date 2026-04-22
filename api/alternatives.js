// Vercel Serverless Function: busca alternativas más económicas con Groq API (gratis)

// Genera URL de búsqueda real para cada tienda (siempre funciona)
function buildSearchUrl(store, searchQuery) {
  const q = encodeURIComponent(searchQuery);
  const storeLower = store.toLowerCase();

  if (storeLower.includes("amazon")) return `https://www.amazon.com/s?k=${q}`;
  if (storeLower.includes("aliexpress")) return `https://www.aliexpress.com/wholesale?SearchText=${q}`;
  if (storeLower.includes("shein")) return `https://www.shein.com/search?q=${q}`;
  if (storeLower.includes("zara")) return `https://www.zara.com/cl/es/search?searchTerm=${q}`;
  if (storeLower.includes("h&m") || storeLower.includes("hm")) return `https://www2.hm.com/es_es/search-results.html?q=${q}`;
  if (storeLower.includes("asos")) return `https://www.asos.com/search/?q=${q}`;
  if (storeLower.includes("mango")) return `https://shop.mango.com/cl/busqueda?q=${q}`;
  if (storeLower.includes("etsy")) return `https://www.etsy.com/search?q=${q}`;
  if (storeLower.includes("ebay")) return `https://www.ebay.com/sch/i.html?_nkw=${q}`;
  if (storeLower.includes("wish")) return `https://www.wish.com/search/${q}`;
  if (storeLower.includes("falabella")) return `https://www.falabella.com/falabella-cl/search?Ntt=${q}`;
  if (storeLower.includes("ripley")) return `https://simple.ripley.cl/search?string=${q}`;
  if (storeLower.includes("paris")) return `https://www.paris.cl/search?q=${q}`;
  if (storeLower.includes("mercadolibre") || storeLower.includes("mercado libre")) return `https://listado.mercadolibre.cl/${q}`;
  if (storeLower.includes("walmart")) return `https://www.walmart.com/search?q=${q}`;
  if (storeLower.includes("temu")) return `https://www.temu.com/search_result.html?search_key=${q}`;

  // Fallback: búsqueda en Google Shopping
  return `https://www.google.com/search?tbm=shop&q=${q}`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, description, category, color, material, estimatedPrice, style, searchTerms } = req.body || {};
  if (!name || !estimatedPrice) {
    return res.status(400).json({ success: false, error: "Faltan parámetros requeridos" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: "API key de Groq no configurada" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Eres un experto en e-commerce y búsqueda de productos. Siempre respondes con JSON válido sin markdown.",
          },
          {
            role: "user",
            content: `Sugiere 6 alternativas más económicas para este producto:

Nombre: ${name}
Descripción: ${description || ""}
Categoría: ${category || ""}
Color: ${color || ""}
Material: ${material || ""}
Precio original estimado: $${estimatedPrice} USD
Estilo: ${style || ""}
Términos de búsqueda: ${(searchTerms || []).join(", ")}

Para cada alternativa, sugiere:
- Un nombre descriptivo del tipo de producto alternativo
- Una tienda conocida donde buscarlo (Amazon, AliExpress, Shein, Zara, H&M, ASOS, Mango, Etsy, Falabella, Ripley, MercadoLibre, Temu, Walmart, eBay)
- Un término de búsqueda corto y específico para encontrarlo en esa tienda (máximo 5 palabras en inglés o español)
- Un precio estimado en USD (significativamente más barato que $${estimatedPrice})
- Porcentaje de similitud con el producto original

Responde SOLO con JSON válido (sin markdown):
{
  "alternatives": [
    {
      "id": "1",
      "name": "nombre descriptivo del producto alternativo",
      "searchQuery": "término de búsqueda corto para la tienda",
      "store": "nombre de la tienda",
      "price": precio en USD (número),
      "originalPrice": ${estimatedPrice},
      "savings": ahorro en USD (número),
      "similarity": porcentaje 0-100 (número),
      "description": "por qué es una buena alternativa",
      "available": true,
      "rating": calificación estimada 3.5-5 (número),
      "reviewCount": número estimado de reseñas
    }
  ]
}

Importante: precios deben ser SIGNIFICATIVAMENTE más baratos que $${estimatedPrice} USD.`,
          },
        ],
        max_tokens: 2048,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const msg = errorData?.error?.message || JSON.stringify(errorData);
      return res.status(500).json({ success: false, error: `Groq error (${response.status}): ${msg}` });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return res.status(500).json({ success: false, error: "Respuesta vacía de la IA" });

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ success: false, error: "No se pudieron encontrar alternativas" });

    const parsed = JSON.parse(jsonMatch[0]);
    const alternatives = parsed.alternatives || [];

    // Construir URLs de búsqueda reales para cada alternativa
    const withRealUrls = alternatives.map((alt) => ({
      ...alt,
      url: buildSearchUrl(alt.store, alt.searchQuery || alt.name),
      image: "", // Sin imagen falsa — el ProductCard mostrará el placeholder con el nombre
    }));

    return res.status(200).json({ success: true, data: withRealUrls });
  } catch (error) {
    console.error("Error en alternatives:", error);
    return res.status(500).json({ success: false, error: error.message || "Error desconocido" });
  }
}

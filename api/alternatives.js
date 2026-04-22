// Vercel Serverless Function: busca alternativas reales usando Real-Time Product Search API (RapidAPI)
// + Groq para analizar y rankear los resultados por similitud

// Extrae precio numérico de string como "$48" o "$20 - $95"
function parsePrice(priceStr) {
  if (!priceStr) return null;
  if (Array.isArray(priceStr)) {
    // typical_price_range: ["$20", "$45"] → promedio
    const nums = priceStr.map(p => parseFloat(p.replace(/[^0-9.]/g, ""))).filter(Boolean);
    if (nums.length === 0) return null;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }
  const num = parseFloat(String(priceStr).replace(/[^0-9.]/g, ""));
  return isNaN(num) ? null : num;
}

// Extrae el link directo a la tienda desde los offers del producto
function getDirectUrl(product) {
  const offers = product.offers;
  if (offers?.primary?.offer_page_url) return offers.primary.offer_page_url;
  if (offers?.secondary?.length > 0) return offers.secondary[0].offer_page_url;
  // Fallback: Google Shopping URL del producto
  return product.product_page_url || null;
}

// Extrae el nombre de la tienda
function getStoreName(product) {
  const offers = product.offers;
  if (offers?.primary?.store_name) return offers.primary.store_name;
  if (offers?.secondary?.length > 0) return offers.secondary[0].store_name;
  return "Google Shopping";
}

// Extrae el precio de la oferta principal
function getOfferPrice(product) {
  const offers = product.offers;
  if (offers?.primary?.price) return parsePrice(offers.primary.price);
  return parsePrice(product.typical_price_range);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, description, category, color, estimatedPrice, searchTerms } = req.body || {};
  if (!name || !estimatedPrice) {
    return res.status(400).json({ success: false, error: "Faltan parámetros requeridos" });
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!rapidApiKey) {
    return res.status(500).json({ success: false, error: "RAPIDAPI_KEY no configurada" });
  }

  try {
    // Construir query de búsqueda combinando los términos más relevantes
    const terms = searchTerms?.length > 0 ? searchTerms.slice(0, 3) : [name];
    const colorStr = color && color !== "N/A" ? ` ${color}` : "";
    const searchQuery = `${colorStr} ${terms[0]}`.trim();

    // Buscar productos reales en Google Shopping via RapidAPI
    const searchUrl = new URL("https://real-time-product-search.p.rapidapi.com/search-v2");
    searchUrl.searchParams.set("q", searchQuery);
    searchUrl.searchParams.set("country", "us");
    searchUrl.searchParams.set("language", "en");
    searchUrl.searchParams.set("limit", "10");
    searchUrl.searchParams.set("sort_by", "BEST_MATCH");

    const searchRes = await fetch(searchUrl.toString(), {
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "real-time-product-search.p.rapidapi.com",
      },
    });

    if (!searchRes.ok) {
      const errText = await searchRes.text();
      return res.status(500).json({ success: false, error: `RapidAPI error (${searchRes.status}): ${errText.slice(0, 200)}` });
    }

    const searchData = await searchRes.json();
    const rawProducts = searchData?.data?.products || [];

    if (rawProducts.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Filtrar productos con precio y link directo disponibles
    const validProducts = rawProducts
      .map(p => ({
        product_id: p.product_id,
        name: p.product_title,
        price: getOfferPrice(p),
        image: p.product_photos?.[0] || "",
        url: getDirectUrl(p),
        store: getStoreName(p),
        rating: p.product_rating || null,
        reviewCount: p.product_num_reviews || 0,
        description: p.product_description || "",
      }))
      .filter(p => p.price !== null && p.url !== null && p.price < estimatedPrice * 1.2);

    if (validProducts.length === 0) {
      // Si no hay productos más baratos, devolver los primeros 6 disponibles sin filtro de precio
      const allValid = rawProducts
        .map(p => ({
          product_id: p.product_id,
          name: p.product_title,
          price: getOfferPrice(p),
          image: p.product_photos?.[0] || "",
          url: getDirectUrl(p),
          store: getStoreName(p),
          rating: p.product_rating || null,
          reviewCount: p.product_num_reviews || 0,
        }))
        .filter(p => p.price !== null && p.url !== null)
        .slice(0, 6);

      const alternatives = allValid.map((p, i) => ({
        id: String(i + 1),
        name: p.name,
        price: p.price,
        originalPrice: estimatedPrice,
        savings: Math.max(0, estimatedPrice - p.price),
        similarity: Math.max(60, 95 - i * 5),
        store: p.store,
        url: p.url,
        image: p.image,
        description: `Alternativa similar encontrada en ${p.store}`,
        available: true,
        rating: p.rating,
        reviewCount: p.reviewCount,
      }));

      return res.status(200).json({ success: true, data: alternatives });
    }

    // Si hay Groq disponible, usar IA para calcular similitud real
    if (groqApiKey && validProducts.length > 0) {
      try {
        const productList = validProducts.slice(0, 8).map((p, i) =>
          `${i + 1}. "${p.name}" - $${p.price} en ${p.store}`
        ).join("\n");

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: "Eres un experto en e-commerce. Responde solo con JSON válido sin markdown.",
              },
              {
                role: "user",
                content: `Producto original: "${name}" - $${estimatedPrice} USD${color ? ` - Color: ${color}` : ""}${category ? ` - Categoría: ${category}` : ""}

Estas son alternativas encontradas en tiendas reales:
${productList}

Para cada alternativa, asigna un porcentaje de similitud (0-100) con el producto original basándote en el nombre, categoría y descripción.

Responde SOLO con JSON:
{
  "similarities": [85, 72, 68, 90, 75, 60, 55, 50]
}
(un número por cada alternativa en el mismo orden)`,
              },
            ],
            max_tokens: 200,
            temperature: 0.2,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const content = groqData.choices?.[0]?.message?.content || "";
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const similarities = parsed.similarities || [];

            const alternatives = validProducts.slice(0, 6).map((p, i) => ({
              id: String(i + 1),
              name: p.name,
              price: p.price,
              originalPrice: estimatedPrice,
              savings: Math.max(0, estimatedPrice - p.price),
              similarity: similarities[i] || Math.max(60, 90 - i * 5),
              store: p.store,
              url: p.url,
              image: p.image,
              description: p.description || `Alternativa similar en ${p.store}`,
              available: true,
              rating: p.rating,
              reviewCount: p.reviewCount,
            }));

            // Ordenar por similitud descendente
            alternatives.sort((a, b) => b.similarity - a.similarity);
            return res.status(200).json({ success: true, data: alternatives });
          }
        }
      } catch (groqErr) {
        console.warn("Groq similarity scoring failed, using default order:", groqErr.message);
      }
    }

    // Fallback sin Groq: devolver los productos con similitud estimada
    const alternatives = validProducts.slice(0, 6).map((p, i) => ({
      id: String(i + 1),
      name: p.name,
      price: p.price,
      originalPrice: estimatedPrice,
      savings: Math.max(0, estimatedPrice - p.price),
      similarity: Math.max(60, 90 - i * 5),
      store: p.store,
      url: p.url,
      image: p.image,
      description: p.description || `Alternativa similar en ${p.store}`,
      available: true,
      rating: p.rating,
      reviewCount: p.reviewCount,
    }));

    return res.status(200).json({ success: true, data: alternatives });

  } catch (error) {
    console.error("Error en alternatives:", error);
    return res.status(500).json({ success: false, error: error.message || "Error desconocido" });
  }
}

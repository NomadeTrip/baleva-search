// Vercel Serverless Function: busca alternativas más económicas con Groq API (gratis)
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
            content: `Busca alternativas más económicas para este producto:

Nombre: ${name}
Descripción: ${description || ""}
Categoría: ${category || ""}
Color: ${color || ""}
Material: ${material || ""}
Precio original estimado: $${estimatedPrice} USD
Estilo: ${style || ""}
Términos de búsqueda: ${(searchTerms || []).join(", ")}

Genera 6 alternativas reales y más económicas de tiendas conocidas (Amazon, AliExpress, Zara, H&M, ASOS, Shein, Mango, Etsy, etc.) que tengan un diseño similar.

Responde SOLO con un JSON válido (sin markdown, sin bloques de código) con esta estructura:
{
  "alternatives": [
    {
      "id": "1",
      "name": "nombre del producto alternativo",
      "price": precio en USD (número),
      "originalPrice": precio original en USD (número, puede ser igual),
      "savings": ahorro respecto al producto original (número),
      "similarity": porcentaje de similitud 0-100 (número),
      "store": "nombre de la tienda",
      "url": "URL de búsqueda o producto en la tienda",
      "image": "https://via.placeholder.com/300",
      "description": "descripción breve de por qué es similar",
      "available": true,
      "rating": calificación 1-5 (número),
      "reviewCount": número de reseñas estimado
    }
  ]
}

Importante: Los precios deben ser SIGNIFICATIVAMENTE más baratos que $${estimatedPrice} USD. Ordena por similitud de diseño.`,
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
    return res.status(200).json({ success: true, data: parsed.alternatives || [] });
  } catch (error) {
    console.error("Error en alternatives:", error);
    return res.status(500).json({ success: false, error: error.message || "Error desconocido" });
  }
}

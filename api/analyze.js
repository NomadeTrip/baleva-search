// Vercel Serverless Function: analiza un producto con Groq API (gratis)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, value } = req.body || {};
  if (!type || !value) {
    return res.status(400).json({ success: false, error: "Faltan parámetros: type y value son requeridos" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: "API key de Groq no configurada" });
  }

  try {
    let userMessage;

    if (type === "url") {
      userMessage = `Analiza este producto y extrae su información. URL del producto: ${value}

Responde SOLO con un JSON válido (sin markdown, sin bloques de código) con esta estructura exacta:
{
  "name": "nombre del producto",
  "description": "descripción breve del diseño y características",
  "category": "categoría (ej: cartera, bolso, zapatos, ropa)",
  "color": "color principal",
  "material": "material (ej: cuero, tela, sintético)",
  "estimatedPrice": número en USD,
  "style": "estilo de diseño (ej: minimalista, escultural, casual, elegante)",
  "searchTerms": ["término1", "término2", "término3", "término4", "término5"]
}`;
    } else if (type === "image") {
      // Para imágenes, Groq soporta visión con llama-3.2-11b-vision-preview
      const base64Match = value.match(/^data:([^;]+);base64,(.+)$/);
      if (!base64Match) {
        return res.status(400).json({ success: false, error: "Formato de imagen inválido" });
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: value },
                },
                {
                  type: "text",
                  text: `Analiza este producto en la imagen y extrae su información.

Responde SOLO con un JSON válido (sin markdown, sin bloques de código) con esta estructura exacta:
{
  "name": "nombre del producto",
  "description": "descripción breve del diseño y características",
  "category": "categoría (ej: cartera, bolso, zapatos, ropa)",
  "color": "color principal",
  "material": "material estimado (ej: cuero, tela, sintético)",
  "estimatedPrice": número en USD estimado,
  "style": "estilo de diseño (ej: minimalista, escultural, casual, elegante)",
  "searchTerms": ["término1", "término2", "término3", "término4", "término5"]
}`,
                },
              ],
            },
          ],
          max_tokens: 1024,
          temperature: 0.3,
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
      if (!jsonMatch) return res.status(500).json({ success: false, error: "No se pudo extraer información del producto" });

      return res.status(200).json({ success: true, data: JSON.parse(jsonMatch[0]) });
    } else {
      return res.status(400).json({ success: false, error: "Tipo inválido. Use 'url' o 'image'" });
    }

    // Para URLs (texto)
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
            content: "Eres un experto en análisis de productos de e-commerce. Siempre respondes con JSON válido sin markdown.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 1024,
        temperature: 0.3,
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
    if (!jsonMatch) return res.status(500).json({ success: false, error: "No se pudo extraer información del producto" });

    return res.status(200).json({ success: true, data: JSON.parse(jsonMatch[0]) });
  } catch (error) {
    console.error("Error en analyze:", error);
    return res.status(500).json({ success: false, error: error.message || "Error desconocido" });
  }
}

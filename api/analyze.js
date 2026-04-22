// Vercel Serverless Function: analiza un producto con Gemini API
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, value } = req.body || {};

  if (!type || !value) {
    return res.status(400).json({ success: false, error: "Faltan parámetros: type y value son requeridos" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: "API key de Gemini no configurada" });
  }

  try {
    let requestBody;

    if (type === "url") {
      requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Analiza este producto y extrae su información. URL del producto: ${value}
                
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
}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      };
    } else if (type === "image") {
      // Para imágenes, value es un data URL base64
      const base64Match = value.match(/^data:([^;]+);base64,(.+)$/);
      if (!base64Match) {
        return res.status(400).json({ success: false, error: "Formato de imagen inválido" });
      }
      const mimeType = base64Match[1];
      const base64Data = base64Match[2];

      requestBody = {
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
              {
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
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      };
    } else {
      return res.status(400).json({ success: false, error: "Tipo inválido. Use 'url' o 'image'" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return res.status(500).json({ success: false, error: "Error al llamar a la API de Gemini" });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return res.status(500).json({ success: false, error: "Respuesta vacía de la IA" });
    }

    // Extraer JSON de la respuesta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ success: false, error: "No se pudo extraer información del producto" });
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    console.error("Error en analyze:", error);
    return res.status(500).json({ success: false, error: error.message || "Error desconocido" });
  }
}

// Servicio de IA que usa la API de Manus directamente desde el frontend
// Completamente gratuito, sin necesidad de API keys externas

const FORGE_API_URL = import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.manus.im";
const FORGE_API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY || "";

export interface ProductAnalysis {
  name: string;
  description: string;
  category: string;
  color: string;
  material: string;
  estimatedPrice: number;
  style: string;
  searchTerms: string[];
}

export interface AlternativeProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  savings: number;
  similarity: number;
  store: string;
  url: string;
  image: string;
  description: string;
  available: boolean;
  rating?: number;
  reviewCount?: number;
}

async function callLLM(messages: Array<{ role: string; content: unknown }>): Promise<string> {
  const apiUrl = `${FORGE_API_URL.replace(/\/$/, "")}/v1/chat/completions`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FORGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      messages,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error de IA: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content || "";
}

function extractJSON(text: string): unknown {
  // Intentar extraer JSON de la respuesta (puede venir con markdown)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No se encontró JSON en la respuesta");
  return JSON.parse(jsonMatch[0]);
}

export async function analyzeProductFromURL(url: string): Promise<ProductAnalysis> {
  const content = await callLLM([
    {
      role: "system",
      content: "Eres un experto en análisis de productos. Analiza productos y extrae información detallada. Responde SOLO con JSON válido, sin markdown.",
    },
    {
      role: "user",
      content: `Analiza este producto y extrae su información. URL del producto: ${url}

Responde SOLO con un JSON válido con esta estructura exacta:
{
  "name": "nombre del producto",
  "description": "descripción breve",
  "category": "categoría (ej: cartera, bolso, zapatos, ropa, electrónico)",
  "color": "color principal",
  "material": "material estimado",
  "estimatedPrice": precio en USD como número,
  "style": "estilo de diseño",
  "searchTerms": ["término1", "término2", "término3", "término4", "término5"]
}`,
    },
  ]);

  return extractJSON(content) as ProductAnalysis;
}

export async function analyzeProductFromImage(imageBase64: string): Promise<ProductAnalysis> {
  const content = await callLLM([
    {
      role: "system",
      content: "Eres un experto en análisis de productos. Analiza imágenes de productos y extrae información detallada. Responde SOLO con JSON válido, sin markdown.",
    },
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: {
            url: imageBase64,
            detail: "high",
          },
        },
        {
          type: "text",
          text: `Analiza este producto en la imagen y extrae su información.

Responde SOLO con un JSON válido con esta estructura exacta:
{
  "name": "nombre del producto",
  "description": "descripción breve",
  "category": "categoría (ej: cartera, bolso, zapatos, ropa, electrónico)",
  "color": "color principal",
  "material": "material estimado",
  "estimatedPrice": precio en USD como número,
  "style": "estilo de diseño",
  "searchTerms": ["término1", "término2", "término3", "término4", "término5"]
}`,
        },
      ],
    },
  ]);

  return extractJSON(content) as ProductAnalysis;
}

export async function findAlternatives(analysis: ProductAnalysis): Promise<AlternativeProduct[]> {
  const content = await callLLM([
    {
      role: "system",
      content: "Eres un experto en búsqueda de productos y comparación de precios. Conoces tiendas internacionales y locales. Responde SOLO con JSON válido, sin markdown.",
    },
    {
      role: "user",
      content: `Busca alternativas más económicas para este producto:

Nombre: ${analysis.name}
Descripción: ${analysis.description}
Categoría: ${analysis.category}
Color: ${analysis.color}
Material: ${analysis.material}
Precio original estimado: $${analysis.estimatedPrice} USD
Estilo: ${analysis.style}
Términos de búsqueda: ${analysis.searchTerms.join(", ")}

Genera 6 alternativas más económicas de tiendas conocidas (Amazon, AliExpress, Zara, H&M, ASOS, Shein, Mango, Etsy, Falabella, Ripley, etc.) con diseño similar.

Responde SOLO con un JSON válido con esta estructura:
{
  "alternatives": [
    {
      "id": "1",
      "name": "nombre del producto alternativo",
      "price": precio en USD como número,
      "originalPrice": precio original como número,
      "savings": ahorro respecto al producto original como número,
      "similarity": porcentaje de similitud 0-100 como número,
      "store": "nombre de la tienda",
      "url": "URL de búsqueda en la tienda",
      "image": "https://via.placeholder.com/300x300?text=Producto",
      "description": "por qué es similar y más barato",
      "available": true,
      "rating": calificación 1-5 como número,
      "reviewCount": número de reseñas estimado
    }
  ]
}

Los precios deben ser SIGNIFICATIVAMENTE más baratos que $${analysis.estimatedPrice} USD. Ordena por similitud.`,
    },
  ]);

  const parsed = extractJSON(content) as { alternatives: AlternativeProduct[] };
  return parsed.alternatives || [];
}

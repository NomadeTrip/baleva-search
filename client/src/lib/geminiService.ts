/**
 * Servicio de integración con Google Gemini API
 * Proporciona análisis de productos usando IA multimodal
 */

interface ProductAnalysis {
  name: string;
  description: string;
  category: string;
  color: string;
  material: string;
  estimatedPrice: number;
  style: string;
  searchTerms: string[];
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL || import.meta.env.VITE_FRONTEND_FORGE_API_URL || 'https://generativelanguage.googleapis.com';

/**
 * Analiza un producto desde una URL usando Gemini
 */
export async function analyzeProductFromUrl(
  url: string
): Promise<ProductAnalysis | null> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('API key de Gemini no configurada. Agrega VITE_GEMINI_API_KEY en variables de entorno.');
    }

    const response = await fetch(
      `${GEMINI_API_URL}/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analiza el siguiente link de producto y extrae información en formato JSON:
                  
                  URL: ${url}
                  
                  Responde SOLO con un JSON válido (sin markdown, sin explicaciones) con esta estructura:
                  {
                    "name": "nombre del producto",
                    "description": "descripción breve",
                    "category": "categoría",
                    "color": "color principal",
                    "material": "material",
                    "estimatedPrice": número,
                    "style": "estilo/diseño",
                    "searchTerms": ["término1", "término2", "término3"]
                  }`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error de API: ${response.statusText}`);
    }

    const data = await response.json();
    const content =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extraer JSON de la respuesta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No se pudo extraer JSON de la respuesta");
    }

    const analysis: ProductAnalysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error("Error analizando producto desde URL:", error);
    return null;
  }
}

/**
 * Analiza un producto desde una imagen usando Gemini
 */
export async function analyzeProductFromImage(
  imageBase64: string
): Promise<ProductAnalysis | null> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('API key de Gemini no configurada. Agrega VITE_GEMINI_API_KEY en variables de entorno.');
    }

    // Extraer el tipo MIME de la imagen
    const mimeMatch = imageBase64.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, "");

    const response = await fetch(
      `${GEMINI_API_URL}/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
                {
                  text: `Analiza esta imagen de producto y extrae información en formato JSON:
                  
                  Responde SOLO con un JSON válido (sin markdown, sin explicaciones) con esta estructura:
                  {
                    "name": "nombre del producto",
                    "description": "descripción breve",
                    "category": "categoría",
                    "color": "color principal",
                    "material": "material aproximado",
                    "estimatedPrice": número (estimado en CLP),
                    "style": "estilo/diseño",
                    "searchTerms": ["término1", "término2", "término3"]
                  }`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error de API: ${response.statusText}`);
    }

    const data = await response.json();
    const content =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extraer JSON de la respuesta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No se pudo extraer JSON de la respuesta");
    }

    const analysis: ProductAnalysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error("Error analizando imagen:", error);
    return null;
  }
}

/**
 * Genera términos de búsqueda adicionales para encontrar alternativas
 */
export async function generateSearchTerms(
  productName: string,
  category: string
): Promise<string[]> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('API key de Gemini no configurada. Agrega VITE_GEMINI_API_KEY en variables de entorno.');
    }

    const response = await fetch(
      `${GEMINI_API_URL}/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Genera 5 términos de búsqueda alternativos para encontrar productos similares a: "${productName}" (categoría: ${category})
                  
                  Responde SOLO con un JSON válido (sin markdown) con esta estructura:
                  {
                    "terms": ["término1", "término2", "término3", "término4", "término5"]
                  }`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error de API: ${response.statusText}`);
    }

    const data = await response.json();
    const content =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return [];
    }

    const result = JSON.parse(jsonMatch[0]);
    return result.terms || [];
  } catch (error) {
    console.error("Error generando términos de búsqueda:", error);
    return [];
  }
}

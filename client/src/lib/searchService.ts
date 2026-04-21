/**
 * Servicio de búsqueda de alternativas de productos
 * Busca en múltiples tiendas nacionales e internacionales
 */

export interface SearchResult {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  store: string;
  url: string;
  similarity: number;
}

/**
 * Búsqueda de alternativas en tiendas chilenas
 */
async function searchChileanStores(
  searchTerms: string[],
  maxPrice: number
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  // Aquí iría la integración con APIs de tiendas chilenas
  // Por ahora retornamos resultados de ejemplo

  // Ejemplo: Amphora
  results.push({
    id: "amphora-1",
    name: "Cartera Tote Miller",
    price: 49990,
    originalPrice: 49990,
    image: "https://via.placeholder.com/300x300?text=Miller",
    store: "Amphora",
    url: "https://amphora.cl",
    similarity: 85,
  });

  // Ejemplo: Paris.cl
  results.push({
    id: "paris-1",
    name: "Cartera Tote Sara",
    price: 26990,
    originalPrice: 26990,
    image: "https://via.placeholder.com/300x300?text=Sara",
    store: "Paris.cl",
    url: "https://paris.cl",
    similarity: 75,
  });

  return results;
}

/**
 * Búsqueda de alternativas en tiendas internacionales
 */
async function searchInternationalStores(
  searchTerms: string[],
  maxPrice: number
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  // Aquí iría la integración con APIs de tiendas internacionales
  // Por ahora retornamos resultados de ejemplo

  // Ejemplo: AliExpress
  results.push({
    id: "aliexpress-1",
    name: "Bolsa Tote Dupe Polene",
    price: 35000,
    originalPrice: 35000,
    image: "https://via.placeholder.com/300x300?text=Dupe",
    store: "AliExpress",
    url: "https://aliexpress.com",
    similarity: 70,
  });

  return results;
}

/**
 * Calcula la similitud entre dos productos
 */
function calculateSimilarity(
  product1: { name: string; category: string; color: string },
  product2: { name: string }
): number {
  // Algoritmo simple de similitud basado en coincidencia de palabras
  const words1 = product1.name.toLowerCase().split(/\s+/);
  const words2 = product2.name.toLowerCase().split(/\s+/);

  let matches = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2 && word1.length > 2) {
        matches++;
      }
    }
  }

  const maxWords = Math.max(words1.length, words2.length);
  return Math.round((matches / maxWords) * 100);
}

/**
 * Búsqueda principal de alternativas
 */
export async function searchAlternatives(
  searchTerms: string[],
  originalPrice: number,
  productInfo: { name: string; category: string; color: string }
): Promise<SearchResult[]> {
  try {
    const maxPrice = originalPrice * 1.2; // Permitir hasta 20% más caro

    // Buscar en tiendas chilenas e internacionales en paralelo
    const [chileanResults, internationalResults] = await Promise.all([
      searchChileanStores(searchTerms, maxPrice),
      searchInternationalStores(searchTerms, maxPrice),
    ]);

    // Combinar resultados
    const allResults = [...chileanResults, ...internationalResults];

    // Filtrar por precio
    const filteredResults = allResults.filter((r) => r.price <= maxPrice);

    // Calcular similitud más precisa
    const resultsWithSimilarity = filteredResults.map((result) => ({
      ...result,
      similarity: calculateSimilarity(productInfo, result),
    }));

    // Ordenar por similitud descendente y luego por precio ascendente
    resultsWithSimilarity.sort((a, b) => {
      if (b.similarity !== a.similarity) {
        return b.similarity - a.similarity;
      }
      return a.price - b.price;
    });

    return resultsWithSimilarity;
  } catch (error) {
    console.error("Error buscando alternativas:", error);
    return [];
  }
}

/**
 * Busca en Google Shopping
 */
export async function searchGoogleShopping(
  query: string,
  maxPrice: number
): Promise<SearchResult[]> {
  // Esta función requeriría acceso a Google Shopping API
  // Por ahora retorna un array vacío
  return [];
}

/**
 * Busca en Mercado Libre
 */
export async function searchMercadoLibre(
  query: string,
  maxPrice: number
): Promise<SearchResult[]> {
  try {
    // Aquí iría la integración con API de Mercado Libre
    // Por ahora retornamos resultados de ejemplo
    return [];
  } catch (error) {
    console.error("Error buscando en Mercado Libre:", error);
    return [];
  }
}

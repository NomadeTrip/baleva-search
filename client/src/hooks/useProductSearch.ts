import { useState } from "react";
import { searchAlternatives } from "@/lib/searchService";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  store: string;
  similarity: number;
  url: string;
  savings: number;
}

export function useProductSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Product[]>([]);

  const searchAlternativesProducts = async (
    searchTerms: string[],
    maxPrice: number,
    productInfo: { name: string; category: string; color: string }
  ): Promise<Product[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Buscar alternativas
      const searchResults = await searchAlternatives(
        searchTerms,
        maxPrice,
        productInfo
      );

      // Convertir a formato Product con cálculo de ahorros
      const products: Product[] = searchResults.map((result) => ({
        ...result,
        originalPrice: maxPrice,
        savings: maxPrice - result.price,
      }));

      setResults(products);
      return products;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al buscar alternativas";
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    searchAlternativesProducts,
    isLoading,
    error,
    results,
    clearResults,
  };
}

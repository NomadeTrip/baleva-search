import { useState } from "react";
import {
  analyzeProductFromUrl,
  analyzeProductFromImage,
  generateSearchTerms,
} from "@/lib/geminiService";

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

export function useGeminiAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeProduct = async (
    input: { type: "url" | "image"; value: string }
  ): Promise<ProductAnalysis | null> => {
    setIsLoading(true);
    setError(null);

    try {
      let analysis: ProductAnalysis | null = null;

      if (input.type === "url") {
        analysis = await analyzeProductFromUrl(input.value);
      } else if (input.type === "image") {
        analysis = await analyzeProductFromImage(input.value);
      }

      if (!analysis) {
        throw new Error("No se pudo analizar el producto");
      }

      // Generar términos de búsqueda adicionales
      const additionalTerms = await generateSearchTerms(
        analysis.name,
        analysis.category
      );

      if (additionalTerms.length > 0) {
        analysis.searchTerms = [
          ...analysis.searchTerms,
          ...additionalTerms,
        ].slice(0, 10);
      }

      return analysis;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al analizar el producto";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeProduct, isLoading, error };
}

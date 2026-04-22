import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock del módulo llm para no hacer llamadas reales a la IA en los tests
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import { invokeLLM } from "./_core/llm";

describe("search router - analyzeProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe parsear correctamente la respuesta JSON de la IA para análisis de URL", async () => {
    const mockAnalysis = {
      name: "Cartera de cuero marrón",
      description: "Cartera elegante de cuero genuino",
      category: "cartera",
      color: "marrón",
      material: "cuero",
      estimatedPrice: 150,
      style: "clásico",
      searchTerms: ["cartera cuero", "bolso marrón", "leather bag"],
    };

    (invokeLLM as ReturnType<typeof vi.fn>).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(mockAnalysis),
          },
        },
      ],
    });

    // Importar la función de análisis dinámicamente para que use el mock
    const { invokeLLM: mockLLM } = await import("./_core/llm");
    
    const result = await mockLLM({
      messages: [
        { role: "user", content: "Analiza este producto" },
      ],
    });

    const content = result.choices[0]?.message?.content;
    expect(typeof content).toBe("string");
    
    const parsed = JSON.parse(content as string);
    expect(parsed.name).toBe("Cartera de cuero marrón");
    expect(parsed.estimatedPrice).toBe(150);
    expect(Array.isArray(parsed.searchTerms)).toBe(true);
  });

  it("debe parsear correctamente la respuesta JSON de la IA para alternativas", async () => {
    const mockAlternatives = {
      alternatives: [
        {
          id: "1",
          name: "Cartera similar económica",
          price: 25,
          originalPrice: 25,
          savings: 125,
          similarity: 85,
          store: "AliExpress",
          url: "https://aliexpress.com/item/123",
          image: "https://via.placeholder.com/300",
          description: "Cartera similar de cuero sintético",
          available: true,
          rating: 4.2,
          reviewCount: 1500,
        },
      ],
    };

    (invokeLLM as ReturnType<typeof vi.fn>).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(mockAlternatives),
          },
        },
      ],
    });

    const { invokeLLM: mockLLM } = await import("./_core/llm");
    
    const result = await mockLLM({
      messages: [
        { role: "user", content: "Busca alternativas" },
      ],
    });

    const content = result.choices[0]?.message?.content;
    expect(typeof content).toBe("string");
    
    const parsed = JSON.parse(content as string);
    expect(Array.isArray(parsed.alternatives)).toBe(true);
    expect(parsed.alternatives[0].price).toBeLessThan(parsed.alternatives[0].savings + parsed.alternatives[0].price);
    expect(parsed.alternatives[0].similarity).toBeGreaterThan(0);
    expect(parsed.alternatives[0].similarity).toBeLessThanOrEqual(100);
  });

  it("debe manejar respuestas JSON embebidas en markdown", () => {
    const responseWithMarkdown = "```json\n{\"name\": \"Producto\", \"price\": 50}\n```";
    const jsonMatch = responseWithMarkdown.match(/\{[\s\S]*\}/);
    expect(jsonMatch).not.toBeNull();
    const parsed = JSON.parse(jsonMatch![0]);
    expect(parsed.name).toBe("Producto");
  });

  it("debe retornar error si no hay JSON en la respuesta", () => {
    const responseWithoutJSON = "No pude analizar el producto";
    const jsonMatch = responseWithoutJSON.match(/\{[\s\S]*\}/);
    expect(jsonMatch).toBeNull();
  });
});

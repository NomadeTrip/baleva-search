import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

// Tipos para análisis de producto
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

interface AlternativeProduct {
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

// Función para analizar producto con IA
async function analyzeProductWithAI(input: { type: "url" | "image"; value: string }): Promise<ProductAnalysis> {
  let messages;

  if (input.type === "url") {
    messages = [
      {
        role: "system" as const,
        content: "Eres un experto en análisis de productos de moda y accesorios. Analiza productos y extrae información detallada en JSON.",
      },
      {
        role: "user" as const,
        content: `Analiza este producto y extrae su información. URL: ${input.value}
        
        Responde SOLO con un JSON válido (sin markdown) con esta estructura exacta:
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
    ];
  } else {
    // Para imágenes, usar image_url
    messages = [
      {
        role: "system" as const,
        content: "Eres un experto en análisis de productos de moda y accesorios. Analiza imágenes de productos y extrae información detallada en JSON.",
      },
      {
        role: "user" as const,
        content: [
          {
            type: "image_url" as const,
            image_url: {
              url: input.value,
              detail: "high" as const,
            },
          },
          {
            type: "text" as const,
            text: `Analiza este producto en la imagen y extrae su información.
            
            Responde SOLO con un JSON válido (sin markdown) con esta estructura exacta:
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
    ];
  }

  const result = await invokeLLM({ messages });
  const content = result.choices[0]?.message?.content;
  
  if (typeof content !== "string") {
    throw new Error("Respuesta inesperada de la IA");
  }

  // Extraer JSON de la respuesta
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No se pudo extraer información del producto");
  }

  return JSON.parse(jsonMatch[0]) as ProductAnalysis;
}

// Función para buscar alternativas con IA
async function findAlternativesWithAI(analysis: ProductAnalysis): Promise<AlternativeProduct[]> {
  const messages = [
    {
      role: "system" as const,
      content: "Eres un experto en búsqueda de productos y comparación de precios. Conoces tiendas internacionales y locales de moda, accesorios y ropa.",
    },
    {
      role: "user" as const,
      content: `Busca alternativas más económicas para este producto:
      
      Nombre: ${analysis.name}
      Descripción: ${analysis.description}
      Categoría: ${analysis.category}
      Color: ${analysis.color}
      Material: ${analysis.material}
      Precio original estimado: $${analysis.estimatedPrice} USD
      Estilo: ${analysis.style}
      Términos de búsqueda: ${analysis.searchTerms.join(", ")}
      
      Genera 6 alternativas reales y más económicas de tiendas conocidas (Amazon, AliExpress, Zara, H&M, ASOS, Shein, Mango, Etsy, etc.) que tengan un diseño similar.
      
      Responde SOLO con un JSON válido (sin markdown) con esta estructura:
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
            "image": "URL de imagen del producto (usa imagen de placeholder si no sabes)",
            "description": "descripción breve de por qué es similar",
            "available": true,
            "rating": calificación 1-5 (número),
            "reviewCount": número de reseñas estimado
          }
        ]
      }
      
      Importante: Los precios deben ser SIGNIFICATIVAMENTE más baratos que $${analysis.estimatedPrice} USD. Ordena por similitud de diseño.`,
    },
  ];

  const result = await invokeLLM({ messages });
  const content = result.choices[0]?.message?.content;
  
  if (typeof content !== "string") {
    throw new Error("Respuesta inesperada de la IA");
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No se pudieron encontrar alternativas");
  }

  const parsed = JSON.parse(jsonMatch[0]) as { alternatives: AlternativeProduct[] };
  return parsed.alternatives || [];
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Rutas para Baleva Search
  search: router({
    // Analizar producto desde URL o imagen
    analyzeProduct: publicProcedure
      .input(
        z.object({
          type: z.enum(["url", "image"]),
          value: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const analysis = await analyzeProductWithAI(input);
          return { success: true, data: analysis };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Error desconocido";
          return { success: false, error: message, data: null };
        }
      }),

    // Buscar alternativas más económicas
    findAlternatives: publicProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string(),
          category: z.string(),
          color: z.string(),
          material: z.string(),
          estimatedPrice: z.number(),
          style: z.string(),
          searchTerms: z.array(z.string()),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const alternatives = await findAlternativesWithAI(input);
          return { success: true, data: alternatives };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Error desconocido";
          return { success: false, error: message, data: [] };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

import { useState } from "react";
import { Loader2, TrendingDown } from "lucide-react";
import SearchInput from "@/components/SearchInput";
import ProductCard from "@/components/ProductCard";

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

export default function Home() {
  const [searchResults, setSearchResults] = useState<AlternativeProduct[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const isLoading = isAnalyzing || isSearching;

  const handleSearch = async (input: { type: "url" | "image"; value: string }) => {
    setHasSearched(true);
    setSearchResults([]);
    setErrorMsg(null);
    setIsAnalyzing(true);

    try {
      // Paso 1: Analizar el producto con Gemini via Serverless Function
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: input.type, value: input.value }),
      });

      if (!analyzeRes.ok) {
        const text = await analyzeRes.text();
        let errMsg = "Error al analizar el producto";
        try { errMsg = JSON.parse(text).error || errMsg; } catch {}
        throw new Error(errMsg);
      }

      const analyzeData = await analyzeRes.json();

      if (!analyzeData.success || !analyzeData.data) {
        throw new Error(analyzeData.error || "No se pudo analizar el producto");
      }

      const analysis: ProductAnalysis = analyzeData.data;
      setIsAnalyzing(false);
      setIsSearching(true);

      // Paso 2: Buscar alternativas más económicas via Serverless Function
      const altRes = await fetch("/api/alternatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: analysis.name,
          description: analysis.description,
          category: analysis.category,
          color: analysis.color,
          material: analysis.material,
          estimatedPrice: analysis.estimatedPrice,
          style: analysis.style,
          searchTerms: analysis.searchTerms,
        }),
      });

      if (!altRes.ok) {
        const text = await altRes.text();
        let errMsg = "Error al buscar alternativas";
        try { errMsg = JSON.parse(text).error || errMsg; } catch {}
        throw new Error(errMsg);
      }

      const altData = await altRes.json();

      if (!altData.success) {
        throw new Error(altData.error || "No se pudieron encontrar alternativas");
      }

      setSearchResults((altData.data as AlternativeProduct[]) || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setErrorMsg(msg);
    } finally {
      setIsAnalyzing(false);
      setIsSearching(false);
    }
  };

  const totalSavings = searchResults.reduce((sum, p) => sum + p.savings, 0);
  const bestDeal =
    searchResults.length > 0
      ? searchResults.reduce((best, current) =>
          current.savings > best.savings ? current : best
        )
      : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-card/95 backdrop-blur-sm z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Baleva Search
              </h1>
            </div>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Encuentra alternativas más económicas
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {!hasSearched ? (
          // Estado inicial
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Busca alternativas más económicas
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Sube una foto o pega un link de cualquier producto y encuentra
                opciones similares pero más baratas en tiendas nacionales e
                internacionales.
              </p>
            </div>

            <SearchInput onSearch={handleSearch} isLoading={isLoading} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Búsqueda Inteligente
                </h3>
                <p className="text-sm text-muted-foreground">
                  IA que analiza el producto y busca alternativas similares
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Ahorra Dinero
                </h3>
                <p className="text-sm text-muted-foreground">
                  Compara precios y encuentra las mejores ofertas
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Tiendas Globales
                </h3>
                <p className="text-sm text-muted-foreground">
                  Busca en tiendas locales e internacionales
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Estado de resultados
          <div>
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-lg text-foreground font-semibold">
                  {isAnalyzing
                    ? "Analizando producto con IA..."
                    : "Buscando alternativas..."}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Esto puede tomar unos segundos
                </p>
              </div>
            )}

            {!isLoading && errorMsg && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center">
                <p className="text-destructive font-semibold mb-2">
                  Error en la búsqueda
                </p>
                <p className="text-sm text-destructive/80">{errorMsg}</p>
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setSearchResults([]);
                    setErrorMsg(null);
                  }}
                  className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium"
                >
                  Intentar de nuevo
                </button>
              </div>
            )}

            {!isLoading && searchResults.length > 0 && (
              <>
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">
                        {searchResults.length} alternativas encontradas
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Ordenadas por similitud y precio
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setHasSearched(false);
                        setSearchResults([]);
                        setErrorMsg(null);
                      }}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
                    >
                      Nueva búsqueda
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        Mejor ahorro
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {bestDeal ? `$${bestDeal.savings.toLocaleString()}` : "-"}
                      </p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        Ahorro total disponible
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        ${totalSavings.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        Similitud promedio
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {Math.round(
                          searchResults.reduce((sum, p) => sum + p.similarity, 0) /
                            searchResults.length
                        )}
                        %
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              </>
            )}

            {!isLoading && searchResults.length === 0 && !errorMsg && (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-4">
                  No se encontraron alternativas
                </p>
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setSearchResults([]);
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Intentar otra búsqueda
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-16 py-8 bg-card">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            © 2026 Baleva Search. Encuentra alternativas más económicas de tus
            productos favoritos.
          </p>
        </div>
      </footer>
    </div>
  );
}

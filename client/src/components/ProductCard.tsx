import { ExternalLink, TrendingDown, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ProductCardProps {
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  store: string;
  similarity: number;
  url: string;
  savings: number;
  formatPrice: (usd: number) => string;
}

export default function ProductCard({
  name,
  price,
  originalPrice,
  image,
  store,
  similarity,
  url,
  savings,
  formatPrice,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const savingsPercentage = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  // Generar imagen placeholder con el nombre del producto
  const placeholderUrl = `https://placehold.co/400x300/f1f5f9/64748b?text=${encodeURIComponent(name.slice(0, 20))}`;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-secondary overflow-hidden">
        {!imgError && image && !image.includes("via.placeholder.com") ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <img
            src={placeholderUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Si el placeholder también falla, mostrar ícono
              const target = e.currentTarget;
              target.style.display = "none";
              target.parentElement!.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  <span class="text-xs">Sin imagen</span>
                </div>
              `;
            }}
          />
        )}

        {/* Savings Badge */}
        {savingsPercentage > 0 && (
          <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
            <TrendingDown className="w-4 h-4" />
            <span className="font-semibold text-sm">{savingsPercentage}% OFF</span>
          </div>
        )}

        {/* Similarity Badge */}
        <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
          {similarity}% similar
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 text-sm">
          {name}
        </h3>

        {/* Store */}
        <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
          {store}
        </p>

        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {formatPrice(price)}
            </span>
            {originalPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          {savings > 0 && (
            <p className="text-xs text-accent font-semibold mt-1">
              Ahorras: {formatPrice(savings)}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Similitud</span>
            <span className="text-xs font-semibold text-foreground">
              {similarity}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${similarity}%` }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <Button
          asChild
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver en tienda
          </a>
        </Button>
      </div>
    </div>
  );
}

import { ExternalLink, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  store: string;
  similarity: number;
  url: string;
  savings: number;
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
}: ProductCardProps) {
  const savingsPercentage = Math.round((savings / originalPrice) * 100);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-secondary overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-sm">Imagen no disponible</span>
          </div>
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
              ${price.toLocaleString()}
            </span>
            {originalPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          {savings > 0 && (
            <p className="text-xs text-accent font-semibold mt-1">
              Ahorras: ${savings.toLocaleString()}
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

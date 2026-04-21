import { useState, useRef } from "react";
import { Upload, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  onSearch: (input: { type: "url" | "image"; value: string }) => void;
  isLoading: boolean;
}

export default function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [url, setUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        onSearch({ type: "image", value: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (url.trim()) {
      onSearch({ type: "url", value: url });
      setUrl("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && url.trim() && !isLoading) {
      handleUrlSubmit();
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* URL Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-2">
          Pega el link del producto
        </label>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://ejemplo.com/producto..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleUrlSubmit}
            disabled={!url.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Link2 className="w-4 h-4 mr-2" />
                Buscar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">o</span>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-2">
          Sube una foto del producto
        </label>

        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-border"
            />
            <button
              onClick={handleClearImage}
              className="absolute top-2 right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            >
              Cambiar imagen
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">
              Haz clic para subir una imagen
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF hasta 10MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isLoading}
          className="hidden"
        />
      </div>

      {/* Info Box */}
      <div className="bg-secondary/50 border border-border rounded-lg p-4">
        <p className="text-sm text-foreground">
          <span className="font-semibold">💡 Tip:</span> Puedes usar tanto links
          como fotos. La IA analizará el producto y buscará alternativas más
          económicas en tiendas nacionales e internacionales.
        </p>
      </div>
    </div>
  );
}

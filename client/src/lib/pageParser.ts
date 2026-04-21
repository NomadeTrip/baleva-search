/**
 * Utilidades para parsear información de páginas web
 * Extrae precios, imágenes y detalles de productos
 */

export interface ParsedProduct {
  name: string;
  price: number;
  image: string;
  url: string;
}

/**
 * Extrae el precio de una cadena de texto
 * Busca patrones como: $100, 100.000, 100,00, etc.
 */
export function extractPrice(text: string): number | null {
  // Patrones de precio comunes
  const patterns = [
    /\$\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/g, // $100.000,00
    /(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:CLP|USD|EUR|ARS)/g, // 100.000 CLP
    /(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/g, // 100.000
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      let priceStr = match[1];
      // Normalizar separadores
      priceStr = priceStr.replace(/\./g, "").replace(",", ".");
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0) {
        return Math.round(price);
      }
    }
  }

  return null;
}

/**
 * Extrae URLs de imágenes de un HTML
 */
export function extractImages(html: string): string[] {
  const images: string[] = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    if (url && !url.includes("data:") && !url.includes("placeholder")) {
      images.push(url);
    }
  }

  return images;
}

/**
 * Extrae el título de una página
 */
export function extractTitle(html: string): string {
  const titleMatch = /<title>([^<]+)<\/title>/i.exec(html);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  const h1Match = /<h1[^>]*>([^<]+)<\/h1>/i.exec(html);
  if (h1Match) {
    return h1Match[1].trim();
  }

  return "Producto sin título";
}

/**
 * Extrae meta descripción
 */
export function extractDescription(html: string): string {
  const metaMatch = /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i.exec(
    html
  );
  if (metaMatch) {
    return metaMatch[1].trim();
  }

  return "";
}

/**
 * Normaliza una URL relativa a absoluta
 */
export function normalizeUrl(url: string, baseUrl: string): string {
  if (url.startsWith("http")) {
    return url;
  }

  if (url.startsWith("/")) {
    const base = new URL(baseUrl);
    return base.origin + url;
  }

  return new URL(url, baseUrl).toString();
}

/**
 * Extrae el dominio de una URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return "desconocido";
  }
}

/**
 * Valida si una URL es válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extrae números de un texto
 */
export function extractNumbers(text: string): number[] {
  const numbers: number[] = [];
  const numberRegex = /\d+(?:[.,]\d+)*/g;
  let match;

  while ((match = numberRegex.exec(text)) !== null) {
    let numStr = match[0];
    numStr = numStr.replace(/\./g, "").replace(",", ".");
    const num = parseFloat(numStr);
    if (!isNaN(num)) {
      numbers.push(num);
    }
  }

  return numbers;
}

/**
 * Limpia HTML de etiquetas
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

/**
 * Trunca texto a una longitud máxima
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + "...";
}

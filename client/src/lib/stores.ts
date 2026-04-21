/**
 * Configuración de tiendas para búsqueda de alternativas
 * Define las tiendas donde se buscarán productos
 */

export interface StoreConfig {
  id: string;
  name: string;
  country: string;
  searchUrl: string;
  type: "local" | "international";
  enabled: boolean;
}

export const STORES: StoreConfig[] = [
  // Tiendas Chilenas
  {
    id: "amphora",
    name: "Amphora",
    country: "Chile",
    searchUrl: "https://amphora.cl/search?q=",
    type: "local",
    enabled: true,
  },
  {
    id: "paris",
    name: "Paris.cl",
    country: "Chile",
    searchUrl: "https://www.paris.cl/search?q=",
    type: "local",
    enabled: true,
  },
  {
    id: "falabella",
    name: "Falabella",
    country: "Chile",
    searchUrl: "https://www.falabella.com/falabella-cl/search?q=",
    type: "local",
    enabled: true,
  },
  {
    id: "ripley",
    name: "Ripley",
    country: "Chile",
    searchUrl: "https://www.ripley.com.pe/ripley/search?q=",
    type: "local",
    enabled: true,
  },
  {
    id: "mercadolibre",
    name: "Mercado Libre",
    country: "Chile",
    searchUrl: "https://listado.mercadolibre.cl/",
    type: "local",
    enabled: true,
  },

  // Tiendas Internacionales
  {
    id: "aliexpress",
    name: "AliExpress",
    country: "China",
    searchUrl: "https://www.aliexpress.com/wholesale?SearchText=",
    type: "international",
    enabled: true,
  },
  {
    id: "amazon",
    name: "Amazon",
    country: "Global",
    searchUrl: "https://www.amazon.com/s?k=",
    type: "international",
    enabled: true,
  },
  {
    id: "etsy",
    name: "Etsy",
    country: "Global",
    searchUrl: "https://www.etsy.com/search?q=",
    type: "international",
    enabled: true,
  },
  {
    id: "ebay",
    name: "eBay",
    country: "Global",
    searchUrl: "https://www.ebay.com/sch/i.html?_nkw=",
    type: "international",
    enabled: true,
  },
];

/**
 * Obtener tiendas habilitadas
 */
export function getEnabledStores(type?: "local" | "international"): StoreConfig[] {
  return STORES.filter((store) => {
    if (!store.enabled) return false;
    if (type && store.type !== type) return false;
    return true;
  });
}

/**
 * Construir URL de búsqueda para una tienda
 */
export function buildSearchUrl(storeId: string, query: string): string {
  const store = STORES.find((s) => s.id === storeId);
  if (!store) return "";

  const encodedQuery = encodeURIComponent(query);
  return store.searchUrl + encodedQuery;
}

/**
 * Obtener tiendas locales
 */
export function getLocalStores(): StoreConfig[] {
  return getEnabledStores("local");
}

/**
 * Obtener tiendas internacionales
 */
export function getInternationalStores(): StoreConfig[] {
  return getEnabledStores("international");
}

/**
 * Generar URLs de búsqueda para múltiples tiendas
 */
export function generateSearchUrls(
  query: string,
  includeLocal: boolean = true,
  includeInternational: boolean = true
): { store: string; url: string }[] {
  const urls: { store: string; url: string }[] = [];

  if (includeLocal) {
    getLocalStores().forEach((store) => {
      urls.push({
        store: store.name,
        url: buildSearchUrl(store.id, query),
      });
    });
  }

  if (includeInternational) {
    getInternationalStores().forEach((store) => {
      urls.push({
        store: store.name,
        url: buildSearchUrl(store.id, query),
      });
    });
  }

  return urls;
}

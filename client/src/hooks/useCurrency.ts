import { useState, useEffect } from "react";

export type Currency = "USD" | "CLP" | "ARS" | "MXN" | "COP" | "PEN" | "BRL";

interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  decimals: number;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: "USD", symbol: "$", name: "Dólar (USD)", decimals: 2 },
  { code: "CLP", symbol: "$", name: "Peso Chileno (CLP)", decimals: 0 },
  { code: "ARS", symbol: "$", name: "Peso Argentino (ARS)", decimals: 0 },
  { code: "MXN", symbol: "$", name: "Peso Mexicano (MXN)", decimals: 2 },
  { code: "COP", symbol: "$", name: "Peso Colombiano (COP)", decimals: 0 },
  { code: "PEN", symbol: "S/", name: "Sol Peruano (PEN)", decimals: 2 },
  { code: "BRL", symbol: "R$", name: "Real Brasileño (BRL)", decimals: 2 },
];

// Tasas de cambio aproximadas respecto a USD (se actualizan desde API)
const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1,
  CLP: 940,
  ARS: 1200,
  MXN: 17.5,
  COP: 4100,
  PEN: 3.75,
  BRL: 5.1,
};

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [rates, setRates] = useState<Record<Currency, number>>(FALLBACK_RATES);

  useEffect(() => {
    // Intentar obtener tasas actualizadas desde una API gratuita
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        if (data.rates) {
          setRates({
            USD: 1,
            CLP: data.rates.CLP || FALLBACK_RATES.CLP,
            ARS: data.rates.ARS || FALLBACK_RATES.ARS,
            MXN: data.rates.MXN || FALLBACK_RATES.MXN,
            COP: data.rates.COP || FALLBACK_RATES.COP,
            PEN: data.rates.PEN || FALLBACK_RATES.PEN,
            BRL: data.rates.BRL || FALLBACK_RATES.BRL,
          });
        }
      })
      .catch(() => {
        // Usar tasas de fallback si falla la API
      });
  }, []);

  const convert = (amountUSD: number): number => {
    return amountUSD * rates[currency];
  };

  const format = (amountUSD: number): string => {
    const config = CURRENCIES.find((c) => c.code === currency)!;
    const converted = convert(amountUSD);
    const formatted = converted.toLocaleString("es-CL", {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    });
    return `${config.symbol}${formatted}`;
  };

  const currentConfig = CURRENCIES.find((c) => c.code === currency)!;

  return { currency, setCurrency, convert, format, currentConfig, rates };
}

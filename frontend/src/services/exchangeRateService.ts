import { buildBinanceRequest, getReferentialRateFromAds } from "@/services/binanceP2P";

export interface ExchangeRateData {
  officialRate: number;
  referentialRate: number | null;
  updatedAt: string;
}

let moduleCache: { value: ExchangeRateData; timestamp: number } | null = null;

const getOfficialRate = () => {
  const officialRate = Number(process.env.OFFICIAL_EXCHANGE_RATE);
  return Number.isFinite(officialRate) ? officialRate : 0;
};

const getFallbackExchangeRate = (): ExchangeRateData =>
  moduleCache?.value ?? { officialRate: getOfficialRate(), referentialRate: null, updatedAt: "" };

export async function getExchangeRate(): Promise<ExchangeRateData> {
  if (!process.env.BINANCE_P2P_URL) {
    return getFallbackExchangeRate();
  }

  try {
    const response = await fetch(process.env.BINANCE_P2P_URL ?? "", buildBinanceRequest(process.env.SCRAPER_USER_AGENT));
    const data = (await response.json()) as { data?: Array<{ adv?: { price?: string } }> };
    const referentialRate = response.ok ? getReferentialRateFromAds(data.data) : null;

    if (referentialRate === null) {
      return getFallbackExchangeRate();
    }

    const exchangeRate = { officialRate: getOfficialRate(), referentialRate, updatedAt: new Date().toISOString() };
    moduleCache = { value: exchangeRate, timestamp: Date.now() };
    return exchangeRate;
  } catch {
    return getFallbackExchangeRate();
  }
}

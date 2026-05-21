const REQUEST_BODY = {
  proMerchantAds: false,
  page: 1,
  rows: 5,
  payTypes: [],
  countries: [],
  publisherType: null,
  asset: "USDT",
  fiat: "BOB",
  tradeType: "BUY",
};

export const buildBinanceRequest = (
  userAgent?: string,
): RequestInit & { next: { revalidate: number } } => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "User-Agent": userAgent ?? "Mozilla/5.0",
  },
  body: JSON.stringify(REQUEST_BODY),
  next: { revalidate: 1800 },
});

export const getReferentialRateFromAds = (ads?: Array<{ adv?: { price?: string } }>) => {
  const prices = (ads ?? [])
    .map((item) => Number(item.adv?.price))
    .filter((price) => Number.isFinite(price))
    .slice(0, 5);

  if (!prices.length) {
    return null;
  }

  return Number((prices.reduce((total, price) => total + price, 0) / prices.length).toFixed(2));
};

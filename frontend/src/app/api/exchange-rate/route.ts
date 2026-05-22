import { NextResponse } from "next/server";
import { getExchangeRate } from "@/services/exchangeRateService";

export const revalidate = 1800;

export async function GET() {
  const exchangeRate = await getExchangeRate();
  return NextResponse.json(exchangeRate, {
    headers: {
      "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400",
    },
  });
}

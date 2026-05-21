"use client";

import ExchangeRateBar from "@/components/ExchangeRateBar";
import { useExchangeRate } from "@/hooks/useExchangeRate";

export default function HomeExchangeSection() {
  const { officialRate, referentialRate, updatedAt, isLoading } = useExchangeRate();
  const updatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleString("es-BO", { day: "numeric", month: "numeric", year: "numeric" })
    : "No disponible";

  return (
    <ExchangeRateBar
      officialRate={officialRate}
      referentialRate={referentialRate}
      updatedAt={updatedLabel}
      isLoading={isLoading}
    />
  );
}

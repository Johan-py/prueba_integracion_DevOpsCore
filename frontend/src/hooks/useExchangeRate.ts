"use client";

import { useEffect, useState } from "react";

interface ExchangeRateData {
  officialRate: number;
  referentialRate: number | null;
  updatedAt: string;
}

interface ExchangeRateState extends ExchangeRateData {
  isLoading: boolean;
  isError: boolean;
}

const initialState: ExchangeRateState = {
  officialRate: 0,
  referentialRate: null,
  updatedAt: "",
  isLoading: true,
  isError: false,
};

export function useExchangeRate() {
  const [state, setState] = useState<ExchangeRateState>(initialState);

  useEffect(() => {
    fetch("/api/exchange-rate", { cache: "no-store" })
      .then((response) => response.json() as Promise<ExchangeRateData>)
      .then((data) => setState({ ...data, isLoading: false, isError: data.referentialRate === null }))
      .catch(() => setState((current) => ({ ...current, isLoading: false, isError: true })));
  }, []);

  return state;
}

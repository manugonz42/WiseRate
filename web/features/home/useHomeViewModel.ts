"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { HistoricalRate, Rate, SponsoredOffer, TimeFrame, TransferQuote } from "@/lib/models";
import { exchangeRateService, transferProviderService } from "@/lib/services";

const DEFAULT_AMOUNT = 500; // docs/modules/home.md — fixed €500 for the rate card.

export interface HomeState {
  amount: number;
  rate: Rate | null;
  topQuotes: TransferQuote[];
  bestQuote: TransferQuote | null;
  sponsoredOffer: SponsoredOffer | null;
  history: HistoricalRate[];
  timeFrame: TimeFrame;
  loading: boolean;
  isEmpty: boolean;
}

export interface HomeViewModel extends HomeState {
  setAmount: (amount: number) => void;
  setTimeFrame: (tf: TimeFrame) => void;
  refresh: () => void;
}

// Observable state + intents only — no rendering, mirrors the iOS/Android
// HomeViewModel. View components stay free of I/O.
export function useHomeViewModel(): HomeViewModel {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("30D");
  const [rate, setRate] = useState<Rate | null>(null);
  const [quotes, setQuotes] = useState<TransferQuote[]>([]);
  const [sponsored, setSponsored] = useState<SponsoredOffer[]>([]);
  const [history, setHistory] = useState<HistoricalRate[]>([]);
  const [quotesLoaded, setQuotesLoaded] = useState(false);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  // Rate + sponsored offers don't depend on the amount — load once (and on
  // pull-to-refresh), not on every keystroke.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      exchangeRateService.getRate("EUR", "PHP"),
      transferProviderService.getSponsoredOffers(),
    ]).then(([r, offers]) => {
      if (cancelled) return;
      setRate(r);
      setSponsored(offers);
    });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  // Quotes reprice on amount change — debounce so typing doesn't thrash the
  // service; skeletons show until the first load resolves.
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      const q = await transferProviderService.getQuotes(amount, 63.5);
      if (cancelled) return;
      setQuotes(q);
      setQuotesLoaded(true);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [amount, nonce]);

  // History reloads on timeframe change (independent of amount).
  useEffect(() => {
    let cancelled = false;
    exchangeRateService.getHistory("EUR", "PHP", timeFrame).then((h) => {
      if (!cancelled) setHistory(h);
    });
    return () => {
      cancelled = true;
    };
  }, [timeFrame, nonce]);

  const topQuotes = useMemo(
    () => [...quotes].sort((a, b) => b.receiveAmount - a.receiveAmount).slice(0, 3),
    [quotes],
  );

  const loading = !quotesLoaded;

  return {
    amount,
    rate,
    topQuotes,
    bestQuote: topQuotes[0] ?? null,
    sponsoredOffer: sponsored[0] ?? null,
    history,
    timeFrame,
    loading,
    isEmpty: quotesLoaded && quotes.length === 0,
    setAmount,
    setTimeFrame,
    refresh,
  };
}

"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_CURRENCY, isCurrencyCode, type CurrencyCode } from "@/config/currencies";
import { DEFAULT_LOCALE, type LocaleCode } from "@/config/locales";
import { messages, type MessageKey } from "@/messages";

const CURRENCY_KEY = "bibeck.currency";

type PreferencesValue = {
  currency: CurrencyCode;
  locale: LocaleCode;
  setCurrency: (currency: CurrencyCode) => void;
  t: (key: MessageKey) => string;
};

const PreferencesContext = createContext<PreferencesValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    const savedCurrency = window.localStorage.getItem(CURRENCY_KEY);
    // Preferences are restored only after hydration so the server and first client render both use safe defaults.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isCurrencyCode(savedCurrency)) setCurrencyState(savedCurrency);
    window.localStorage.removeItem("bibeck.locale");
    document.cookie = "bibeck.locale=; Path=/; Max-Age=0; SameSite=Lax";
  }, []);

  const value = useMemo<PreferencesValue>(() => ({
    currency,
    locale: DEFAULT_LOCALE,
    setCurrency(nextCurrency) {
      setCurrencyState(nextCurrency);
      window.localStorage.setItem(CURRENCY_KEY, nextCurrency);
    },
    t: (key) => messages[DEFAULT_LOCALE][key],
  }), [currency]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesValue {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used within PreferencesProvider");
  return context;
}

export function useCurrency() {
  const { currency, setCurrency } = usePreferences();
  return { currency, setCurrency };
}

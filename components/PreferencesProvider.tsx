"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_CURRENCY, isCurrencyCode, type CurrencyCode } from "@/config/currencies";
import { DEFAULT_LOCALE, isLocaleCode, locales, type LocaleCode } from "@/config/locales";
import { messages, type MessageKey } from "@/messages";

const CURRENCY_KEY = "bibeck.currency";
const LOCALE_KEY = "bibeck.locale";

type PreferencesValue = {
  currency: CurrencyCode;
  locale: LocaleCode;
  setCurrency: (currency: CurrencyCode) => void;
  setLocale: (locale: LocaleCode) => void;
  t: (key: MessageKey) => string;
};

const PreferencesContext = createContext<PreferencesValue | null>(null);

export function PreferencesProvider({ children, initialLocale = DEFAULT_LOCALE, localeFromRoute = false }: { children: ReactNode; initialLocale?: LocaleCode; localeFromRoute?: boolean }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [locale, setLocaleState] = useState<LocaleCode>(initialLocale);

  useEffect(() => {
    const savedCurrency = window.localStorage.getItem(CURRENCY_KEY);
    const savedLocale = window.localStorage.getItem(LOCALE_KEY);
    // Preferences are restored only after hydration so the server and first client render both use safe defaults.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isCurrencyCode(savedCurrency)) setCurrencyState(savedCurrency);
    if (!localeFromRoute && isLocaleCode(savedLocale)) setLocaleState(savedLocale);
  }, [localeFromRoute]);

  useEffect(() => {
    document.documentElement.lang = locales.find((item) => item.code === locale)?.htmlLang ?? "zh-Hant-TW";
  }, [locale]);

  const value = useMemo<PreferencesValue>(() => ({
    currency,
    locale,
    setCurrency(nextCurrency) {
      setCurrencyState(nextCurrency);
      window.localStorage.setItem(CURRENCY_KEY, nextCurrency);
    },
    setLocale(nextLocale) {
      setLocaleState(nextLocale);
      window.localStorage.setItem(LOCALE_KEY, nextLocale);
      document.cookie = `${LOCALE_KEY}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    },
    t: (key) => messages[locale][key] ?? messages[DEFAULT_LOCALE][key],
  }), [currency, locale]);

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

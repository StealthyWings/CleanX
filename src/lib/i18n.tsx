"use client";

import { createContext, useContext, useCallback, useEffect, useMemo, useSyncExternalStore, ReactNode } from "react";
import en from "@/locales/en.json";
import hi from "@/locales/hi.json";

export type Locale = "en" | "hi";

type Messages = { [key: string]: string | Messages };

const messages: Record<Locale, Messages> = { en, hi };
const STORAGE_KEY = "cleanx-locale";

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

function getNestedValue(obj: Messages, path: string): string | undefined {
  let acc: string | Messages | undefined = obj;
  for (const part of path.split(".")) {
    if (typeof acc !== "object") return undefined;
    acc = acc[part];
  }
  return typeof acc === "string" ? acc : undefined;
}

// Locale lives in localStorage; useSyncExternalStore keeps SSR ("en") and
// the client's saved choice in sync without a setState-in-effect flash.
const listeners = new Set<() => void>();

function readLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "hi" ? "hi" : "en";
  } catch {
    return "en";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore<Locale>(subscribe, readLocale, () => "en");

  const setLocale = useCallback((l: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // Storage unavailable (private mode) — locale just won't persist
    }
    listeners.forEach((fn) => fn());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let value = getNestedValue(messages[locale], key) ?? getNestedValue(messages.en, key) ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          value = value.replaceAll(`{${k}}`, String(v));
        }
      }
      return value;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  return useContext(I18nContext);
}

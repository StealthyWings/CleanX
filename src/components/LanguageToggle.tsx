"use client";

import { useTranslation, Locale } from "@/lib/i18n";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
];

// Note: no framer `layoutId` here — the toggle renders in both the desktop and
// mobile navbars, and a shared layoutId made the active pill jump to the hidden copy.
export function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className="flex items-center gap-0.5 p-1 rounded-full bg-white border border-border"
    >
      <Languages className="w-3.5 h-3.5 text-muted-foreground mx-1.5" aria-hidden />
      {LOCALES.map(({ code, label }) => {
        const active = locale === code;
        return (
          <button
            key={code}
            role="radio"
            aria-checked={active}
            aria-label={label}
            lang={code}
            onClick={() => setLocale(code)}
            className={cn(
              "min-w-9 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer",
              active
                ? "bg-brand text-white shadow-sm"
                : "text-muted-foreground hover:text-brand-dark hover:bg-brand/10"
            )}
          >
            {t(`language.${code}`)}
          </button>
        );
      })}
    </div>
  );
}

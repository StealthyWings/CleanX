"use client";

import { motion } from "framer-motion";
import { useTranslation, Locale } from "@/lib/i18n";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="flex items-center gap-1 p-1 rounded-full glass border border-border/30">
      <Languages className="w-3.5 h-3.5 text-muted-foreground ml-2" />
      {(["en", "hi"] as Locale[]).map((l) => (
        <motion.button
          key={l}
          whileTap={{ scale: 0.9 }}
          onClick={() => setLocale(l)}
          className={`relative px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
            locale === l
              ? "text-white"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {locale === l && (
            <motion.div
              layoutId="lang-toggle"
              className="absolute inset-0 rounded-full bg-brand"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{t(`language.${l}`)}</span>
        </motion.button>
      ))}
    </div>
  );
}

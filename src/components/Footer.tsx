"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <Link href="/" aria-label="CleanX home" className="scale-90 origin-left">
          <Logo />
        </Link>
        <p>{t("footer.tagline")}</p>
        <p>
          {t("footer.mapData")}{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            OpenStreetMap
          </a>
        </p>
      </div>
    </footer>
  );
}

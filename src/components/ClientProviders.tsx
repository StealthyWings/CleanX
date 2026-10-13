"use client";

import { MotionConfig } from "framer-motion";
import { I18nProvider } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StoreSync } from "@/components/StoreSync";
import { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <MotionConfig reducedMotion="user">
        <StoreSync />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </MotionConfig>
    </I18nProvider>
  );
}

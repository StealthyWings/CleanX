"use client";

import { I18nProvider } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
    </I18nProvider>
  );
}

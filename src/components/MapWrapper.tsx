"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { useTranslation } from "@/lib/i18n";

function MapLoading() {
  const { t } = useTranslation();
  return (
    <div className="w-full h-full min-h-[300px] rounded-2xl bg-muted/30 flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground" role="status">
        <div className="w-5 h-5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        <span className="text-sm">{t("map.loading")}</span>
      </div>
    </div>
  );
}

// Dynamic import wrapper for any Leaflet-based component
// Prevents SSR issues since Leaflet requires `window`
export function withNoSSR<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  return dynamic(importFn, {
    ssr: false,
    loading: () => <MapLoading />,
  });
}

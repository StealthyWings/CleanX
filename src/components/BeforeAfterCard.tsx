"use client";

import { Report } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface BeforeAfterCardProps {
  report: Report;
  compact?: boolean;
}

export function BeforeAfterCard({ report, compact = false }: BeforeAfterCardProps) {
  const { t } = useTranslation();

  if (!report.afterImageUrl) return null;

  return (
    <div className={`rounded-xl overflow-hidden border border-border/20 ${compact ? "" : "glass"}`}>
      <div className={`grid grid-cols-2 gap-px bg-border/20`}>
        {/* Before */}
        <div className="relative bg-background">
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-red-500/80 text-white text-[10px] font-semibold">
            {t("dashboard.before")}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={report.imageUrl}
            alt="Before cleanup"
            className={`w-full object-cover ${compact ? "h-24" : "h-36"}`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        {/* After */}
        <div className="relative bg-background">
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-emerald-500/80 text-white text-[10px] font-semibold">
            {t("dashboard.after")}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={report.afterImageUrl}
            alt="After cleanup"
            className={`w-full object-cover ${compact ? "h-24" : "h-36"}`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </div>
    </div>
  );
}

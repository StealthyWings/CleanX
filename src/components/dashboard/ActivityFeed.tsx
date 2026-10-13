"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Clock } from "lucide-react";
import { useReportStore } from "@/lib/store";
import { timeAgo } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { ActivityEntry } from "@/lib/types";

/**
 * Renders a structured activity entry using i18n translations.
 * Falls back to legacy `entry.action` field for older entries.
 */
function useActivityRenderer() {
  const { t } = useTranslation();

  return useCallback((entry: ActivityEntry): string => {
    // Legacy fallback for plain-text entries
    if (!entry.type && entry.action) return entry.action;

    const p = entry.params || {};

    switch (entry.type) {
      case 'report_submitted': {
        const sev = p.severity
          ? t(`report.${p.severity}`)
          : '';
        const loc = p.location || '';
        return loc
          ? `${t("activity.reportSubmitted")} — ${sev} ${t("activity.severityAt")} ${loc}`
          : `${t("activity.reportSubmitted")} — ${sev} ${t("activity.severity")}`;
      }
      case 'report_claimed':
        return `${t("activity.reportClaimed")} #${p.reportShort} ${t("activity.by")} ${p.volunteerName}`;
      case 'report_cleaned':
        return `${t("activity.reportCleaned")} #${p.reportShort} ${t("activity.by")} ${p.volunteerName} (+${p.points} ${t("leaderboard.pts")})`;
      case 'image_duplicate':
        return `⚠️ ${t("activity.duplicateImage")} — ${p.volunteerName} (#${p.reportShort})`;
      case 'account_flagged':
        return `🚩 ${t("activity.accountFlagged")} — ${p.volunteerName}`;
      default:
        return entry.action || t("activity.unknownAction");
    }
  }, [t]);
}

export default function ActivityFeed() {
  const activity = useReportStore((s) => s.activity);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, locale } = useTranslation();
  const renderActivity = useActivityRenderer();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activity.length]);

  return (
    <div className="glass rounded-2xl border border-border/20 flex flex-col h-[320px] sm:h-[380px]">
      <div className="px-5 py-3 border-b border-border/20 flex items-center gap-2 shrink-0">
        <Activity className="w-4 h-4 text-brand-light" />
        <h2 className="text-sm font-semibold">{t("dashboard.activityFeed")}</h2>
        <span className="ml-auto text-[11px] text-muted-foreground px-2 py-0.5 rounded-full bg-brand/10">
          {activity.length} {t("dashboard.events")}
        </span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence initial={false}>
          {activity.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-xl border border-border/10 hover:bg-muted/30 transition-colors ${
                entry.type === 'account_flagged'
                  ? 'bg-red-50 border-red-200'
                  : entry.type === 'image_duplicate'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-white/50'
              }`}
            >
              <p className="text-sm leading-relaxed">{renderActivity(entry)}</p>
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                {timeAgo(entry.timestamp, locale)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

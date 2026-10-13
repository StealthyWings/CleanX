"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useReportStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import Link from "next/link";

export default function LeaderboardWidget() {
  const volunteers = useReportStore((s) => s.volunteers);
  const loaded = useReportStore((s) => s.loaded);
  const leaderboard = useMemo(
    () => [...volunteers].sort((a, b) => b.totalPoints - a.totalPoints),
    [volunteers]
  );
  const { t } = useTranslation();
  const top5 = leaderboard.slice(0, 5);

  const medals = ["🥇", "🥈", "🥉", "4", "5"];

  return (
    <div className="glass rounded-2xl border border-border/20 flex flex-col">
      <div className="px-5 py-3 border-b border-border/20 flex items-center gap-2 shrink-0">
        <Trophy className="w-4 h-4 text-amber-500" />
        <h2 className="text-sm font-semibold">{t("leaderboard.title")}</h2>
        <Link href="/leaderboard" className="ml-auto text-[11px] text-brand-light hover:underline">
          {t("leaderboard.viewAll")}
        </Link>
      </div>
      <div className="p-3 space-y-1.5">
        {loaded && top5.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            {t("leaderboard.noVolunteers")}
          </p>
        )}
        {top5.map((vol, i) => (
          <motion.div
            key={vol.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/15 transition-colors"
          >
            <span className="text-sm w-6 text-center">
              {i < 3 ? medals[i] : <span className="text-xs text-muted-foreground font-mono">#{i + 1}</span>}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{vol.name}</p>
              <p className="text-[10px] text-muted-foreground">
                🧹 {vol.cleanupCount} {t("leaderboard.cleanups")}
              </p>
            </div>
            <span className="text-sm font-bold text-brand-light shrink-0">
              {vol.totalPoints} <span className="text-[10px] text-muted-foreground">{t("leaderboard.pts")}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

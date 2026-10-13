"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Medal, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useReportStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { useEffect, useState, useMemo } from "react";

const podiumColors = [
  { bg: "from-amber-500/20 to-yellow-500/10", border: "border-amber-400/30", text: "text-amber-600", icon: "🥇" },
  { bg: "from-slate-400/20 to-gray-400/10", border: "border-slate-400/30", text: "text-slate-500", icon: "🥈" },
  { bg: "from-amber-700/20 to-orange-700/10", border: "border-amber-700/30", text: "text-amber-700", icon: "🥉" },
];

function computeCleanupRate(
  cleanupCount: number,
  lastCleanup: number | undefined,
  t: (key: string, vars?: Record<string, string | number>) => string
): string {
  if (cleanupCount === 0 || !lastCleanup) return "—";
  const hoursActive = Math.max(1, (Date.now() - lastCleanup) / 3600000);
  const rate = cleanupCount / Math.max(1, hoursActive / 24); // per day
  if (rate >= 1) return t("leaderboard.perDay", { n: rate.toFixed(1) });
  return t("leaderboard.perWeek", { n: (rate * 7).toFixed(1) });
}

export default function LeaderboardPage() {
  // Select volunteers directly (stable reference) and sort in useMemo
  const volunteers = useReportStore((s) => s.volunteers);
  const loaded = useReportStore((s) => s.loaded);
  const leaderboard = useMemo(
    () => [...volunteers].sort((a, b) => b.totalPoints - a.totalPoints),
    [volunteers]
  );
  const { t } = useTranslation();

  // Force re-render every 3s for "near real-time" feel (updates from Zustand are instant,
  // but this ensures the timeAgo and rate values stay fresh)
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(timer);
  }, []);

  const top10 = leaderboard.slice(0, 10);
  const top3 = top10.slice(0, 3);

  return (
    <div className="min-h-screen gradient-bg-vibrant">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display font-bold uppercase tracking-[0.06em] text-ink text-4xl sm:text-6xl">
            {t("leaderboard.title")}
          </h1>
        </motion.div>

        {/* Top 3 Podium */}
        {top3.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <AnimatePresence mode="popLayout">
              {top3.map((vol, i) => {
                const style = podiumColors[i];
                return (
                  <motion.div
                    key={vol.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                  >
                    <GlassCard hover={false} className={`text-center p-6 border ${style.border} bg-linear-to-br ${style.bg} ${i === 0 ? "sm:-translate-y-2 shadow-lg shadow-amber-500/10" : ""}`}>
                      <div className="text-3xl mb-2">{style.icon}</div>
                      <h3 className="text-lg font-bold mb-1">{vol.name}</h3>
                      <p className={`text-3xl font-bold ${style.text} mb-1`}>
                        <AnimatedCounter value={vol.totalPoints} />
                        <span className="text-sm ml-1">{t("leaderboard.pts")}</span>
                      </p>
                      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>🧹 {vol.cleanupCount} {t("leaderboard.cleanups")}</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {computeCleanupRate(vol.cleanupCount, vol.lastCleanup, t)}
                        </span>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Full Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl overflow-hidden border border-border/20"
        >
          <div className="px-5 py-3 border-b border-border/20 flex items-center gap-2">
            <Medal className="w-4 h-4 text-brand-light" />
            <h2 className="text-sm font-semibold">{t("leaderboard.top10Title")}</h2>
          </div>

          {!loaded ? (
            <div className="p-5 space-y-3" aria-busy="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-9 rounded-lg bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : top10.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {t("leaderboard.noVolunteers")}
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {/* Header */}
              <div className="grid grid-cols-12 px-5 py-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                <div className="col-span-2 sm:col-span-1">{t("leaderboard.rank")}</div>
                <div className="col-span-6 sm:col-span-4">{t("leaderboard.volunteer")}</div>
                <div className="hidden sm:block col-span-2 text-center">{t("leaderboard.cleanups")}</div>
                <div className="hidden sm:block col-span-2 text-center">{t("leaderboard.cleanupRate")}</div>
                <div className="col-span-4 sm:col-span-3 text-right">{t("leaderboard.points")}</div>
              </div>

              {/* Rows */}
              <AnimatePresence mode="popLayout">
                {top10.map((vol, i) => (
                  <motion.div
                    key={vol.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-12 px-5 py-3 items-center hover:bg-brand/[0.03] transition-colors"
                  >
                    <div className="col-span-2 sm:col-span-1">
                      <span className={`text-sm font-bold tabular-nums ${i < 3 ? podiumColors[i].text : "text-muted-foreground"}`}>
                        #{i + 1}
                      </span>
                    </div>
                    <div className="col-span-6 sm:col-span-4 min-w-0">
                      <p className="text-sm font-medium truncate">{vol.name}</p>
                      <p className="sm:hidden text-[11px] text-muted-foreground">
                        {vol.cleanupCount} {t("leaderboard.cleanups")}
                      </p>
                    </div>
                    <div className="hidden sm:block col-span-2 text-center">
                      <span className="text-sm text-muted-foreground tabular-nums">{vol.cleanupCount}</span>
                    </div>
                    <div className="hidden sm:block col-span-2 text-center">
                      <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {computeCleanupRate(vol.cleanupCount, vol.lastCleanup, t)}
                      </span>
                    </div>
                    <div className="col-span-4 sm:col-span-3 text-right">
                      <span className="text-sm font-bold text-brand-light">
                        <AnimatedCounter value={vol.totalPoints} />
                        <span className="text-xs ml-1 text-muted-foreground">{t("leaderboard.pts")}</span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

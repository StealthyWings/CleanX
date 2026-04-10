"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Zap, TrendingUp } from "lucide-react";
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

function computeCleanupRate(cleanupCount: number, lastCleanup?: number): string {
  if (cleanupCount === 0 || !lastCleanup) return "—";
  const hoursActive = Math.max(1, (Date.now() - lastCleanup) / 3600000);
  const rate = cleanupCount / Math.max(1, hoursActive / 24); // per day
  if (rate >= 1) return `${rate.toFixed(1)}/day`;
  return `${(rate * 7).toFixed(1)}/wk`;
}

export default function LeaderboardPage() {
  // Select volunteers directly (stable reference) and sort in useMemo
  const volunteers = useReportStore((s) => s.volunteers);
  const leaderboard = useMemo(
    () => [...volunteers].sort((a, b) => b.totalPoints - a.totalPoints),
    [volunteers]
  );
  const { t } = useTranslation();

  // Live pulse indicator — toggles every second for animation
  const [livePulse, setLivePulse] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => setLivePulse((p) => !p), 1200);
    return () => clearInterval(timer);
  }, []);

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
          {/* Live indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-emerald-400/20 text-xs font-medium text-emerald-600 mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 transition-opacity duration-700 ${
                  livePulse ? "opacity-75 scale-150" : "opacity-0 scale-100"
                }`}
                style={{ transition: "opacity 0.7s, transform 0.7s" }}
              />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            {t("leaderboard.liveUpdates")}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-amber-400/20 text-xs font-medium text-amber-600 mb-4 ml-2">
            <Trophy className="w-3.5 h-3.5" />
            {t("leaderboard.scoring")}: {t("leaderboard.lowPoints")} · {t("leaderboard.mediumPoints")} · {t("leaderboard.highPoints")}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            {t("leaderboard.title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("leaderboard.subtitle")}
          </p>
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
                    <GlassCard className={`text-center p-6 border ${style.border} bg-gradient-to-br ${style.bg}`}>
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
                          {computeCleanupRate(vol.cleanupCount, vol.lastCleanup)}
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
            <span className="ml-auto text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-emerald-500" />
              {t("leaderboard.autoRefresh")}
            </span>
          </div>

          {top10.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {t("leaderboard.noVolunteers")}
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {/* Header */}
              <div className="grid grid-cols-12 px-5 py-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                <div className="col-span-1">{t("leaderboard.rank")}</div>
                <div className="col-span-4">{t("leaderboard.volunteer")}</div>
                <div className="col-span-2 text-center">{t("leaderboard.cleanups")}</div>
                <div className="col-span-2 text-center">{t("leaderboard.cleanupRate")}</div>
                <div className="col-span-3 text-right">{t("leaderboard.points")}</div>
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
                    className="grid grid-cols-12 px-5 py-3 items-center hover:bg-muted/10 transition-colors"
                  >
                    <div className="col-span-1">
                      <span className={`text-sm font-bold ${i < 3 ? podiumColors[i].text : "text-muted-foreground"}`}>
                        #{i + 1}
                      </span>
                    </div>
                    <div className="col-span-4">
                      <span className="text-sm font-medium">{vol.name}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm text-muted-foreground">{vol.cleanupCount}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {computeCleanupRate(vol.cleanupCount, vol.lastCleanup)}
                      </span>
                    </div>
                    <div className="col-span-3 text-right">
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

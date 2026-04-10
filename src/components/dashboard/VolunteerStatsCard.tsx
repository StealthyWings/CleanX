"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Trophy, Target, ArrowUp, TrendingUp } from "lucide-react";
import { useReportStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { SEVERITY_POINTS } from "@/lib/types";

export default function VolunteerStatsCard() {
  const currentVolunteerName = useReportStore((s) => s.currentVolunteerName);
  const volunteers = useReportStore((s) => s.volunteers);
  const { t } = useTranslation();

  // Editable name
  const [editName, setEditName] = useState("");
  const setCurrentVolunteer = useReportStore((s) => s.setCurrentVolunteer);

  // Sync from store on mount
  useEffect(() => {
    if (currentVolunteerName) setEditName(currentVolunteerName);
  }, [currentVolunteerName]);

  const leaderboard = useMemo(
    () => [...volunteers].sort((a, b) => b.totalPoints - a.totalPoints),
    [volunteers]
  );

  const volunteer = useMemo(
    () => volunteers.find((v) => v.name === currentVolunteerName),
    [volunteers, currentVolunteerName]
  );

  const rank = useMemo(() => {
    if (!volunteer) return null;
    return leaderboard.findIndex((v) => v.id === volunteer.id) + 1;
  }, [leaderboard, volunteer]);

  // Calculate how many cleanups of each severity needed to enter top 10
  const cleanupsNeeded = useMemo(() => {
    if (!volunteer) return null;
    const top10 = leaderboard.slice(0, 10);
    if (top10.length < 10) {
      // Less than 10 volunteers — already in top 10 or will be
      return null;
    }
    const tenthPlacePoints = top10[9].totalPoints;
    if (volunteer.totalPoints >= tenthPlacePoints) return null; // already in top 10

    const deficit = tenthPlacePoints - volunteer.totalPoints + 1; // +1 to surpass, not just tie

    return {
      low: Math.ceil(deficit / SEVERITY_POINTS.low),
      medium: Math.ceil(deficit / SEVERITY_POINTS.medium),
      high: Math.ceil(deficit / SEVERITY_POINTS.high),
    };
  }, [leaderboard, volunteer]);

  // If no volunteer set, show the "set your name" mini-form
  if (!currentVolunteerName) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-brand/20 p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-brand-light" />
          <h2 className="text-sm font-semibold">{t("volunteer.yourStats")}</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {t("volunteer.enterName")}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder={t("volunteer.namePlaceholder")}
            className="flex-1 px-3 py-2 rounded-lg border border-border/40 text-sm bg-white/80 focus:outline-none focus:border-brand/40"
          />
          <button
            onClick={() => editName.trim() && setCurrentVolunteer(editName.trim())}
            disabled={!editName.trim()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand to-brand-dark text-white text-sm font-semibold disabled:opacity-40 cursor-pointer"
          >
            {t("volunteer.save")}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-brand/20 p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-brand/10">
            <User className="w-4 h-4 text-brand-light" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">{t("volunteer.yourStats")}</h2>
            <p className="text-xs text-muted-foreground">{currentVolunteerName}</p>
          </div>
        </div>
        <button
          onClick={() => setCurrentVolunteer("")}
          className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {t("volunteer.change")}
        </button>
      </div>

      {volunteer ? (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Rank */}
            <div className="text-center p-3 rounded-xl bg-amber-500/5 border border-amber-400/15">
              <Trophy className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-amber-600">#{rank}</p>
              <p className="text-[10px] text-muted-foreground uppercase">{t("leaderboard.rank")}</p>
            </div>
            {/* Points */}
            <div className="text-center p-3 rounded-xl bg-brand/5 border border-brand/15">
              <Target className="w-4 h-4 text-brand-light mx-auto mb-1" />
              <p className="text-xl font-bold text-brand-light">{volunteer.totalPoints}</p>
              <p className="text-[10px] text-muted-foreground uppercase">{t("leaderboard.pts")}</p>
            </div>
            {/* Cleanups */}
            <div className="text-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-400/15">
              <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-emerald-500">{volunteer.cleanupCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase">{t("leaderboard.cleanups")}</p>
            </div>
          </div>

          {/* Flagged warning */}
          {volunteer.flagged && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs mb-3 flex items-center gap-2">
              🚩 {t("volunteer.flaggedWarning")}
            </div>
          )}

          {/* Cleanups needed to reach top 10 */}
          {cleanupsNeeded && (
            <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-400/15">
              <div className="flex items-center gap-1.5 mb-2">
                <ArrowUp className="w-3.5 h-3.5 text-purple-500" />
                <p className="text-xs font-semibold text-purple-600">
                  {t("volunteer.toReachTop10")}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-emerald-600">{cleanupsNeeded.low}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">{t("report.low")} (10pts)</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-500">{cleanupsNeeded.medium}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">{t("report.medium")} (25pts)</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-500">{cleanupsNeeded.high}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">{t("report.high")} (50pts)</p>
                </div>
              </div>
            </div>
          )}

          {/* Already in top 10 indicator */}
          {!cleanupsNeeded && rank !== null && rank <= 10 && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs flex items-center gap-2">
              🏆 {t("volunteer.inTop10")}
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t("volunteer.notFound")}
        </p>
      )}
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import StatsRow from "@/components/dashboard/StatsRow";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import LeaderboardWidget from "@/components/dashboard/LeaderboardWidget";
import VolunteerStatsCard from "@/components/dashboard/VolunteerStatsCard";
import { withNoSSR } from "@/components/MapWrapper";
import { useTranslation } from "@/lib/i18n";

const ReportMap = withNoSSR(
  () => import("@/components/dashboard/ReportMap"),
  "Loading dashboard map..."
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen gradient-bg-vibrant">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {t("dashboard.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("dashboard.subtitle")}
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants}>
          <StatsRow />
        </motion.div>

        {/* Map + Sidebar */}
        <motion.div variants={itemVariants} className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl overflow-hidden border border-border/20">
              <div className="px-5 py-3 border-b border-border/20 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{t("dashboard.liveMap")}</h2>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {t("dashboard.low")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    {t("dashboard.medium")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    {t("dashboard.high")}
                  </span>
                </div>
              </div>
              <div className="h-[450px] sm:h-[550px]">
                <ReportMap />
              </div>
            </div>
          </div>

          {/* Sidebar: Volunteer Stats + Activity Feed + Leaderboard */}
          <div className="lg:col-span-1 space-y-6">
            <VolunteerStatsCard />
            <ActivityFeed />
            <LeaderboardWidget />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

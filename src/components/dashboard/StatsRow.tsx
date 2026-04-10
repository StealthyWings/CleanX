"use client";

import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useReportStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

export default function StatsRow() {
  const totalReported = useReportStore((s) => s.totalReported());
  const inProgress = useReportStore((s) => s.inProgress());
  const cleaned = useReportStore((s) => s.cleaned());
  const highSeverity = useReportStore((s) => s.highSeverity());
  const { t } = useTranslation();

  const stats = [
    {
      key: "total",
      label: t("dashboard.totalReported"),
      icon: FileText,
      color: "text-brand-light",
      bg: "bg-brand/10",
      border: "border-brand/20",
      value: totalReported,
    },
    {
      key: "progress",
      label: t("dashboard.inProgress"),
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      value: inProgress,
    },
    {
      key: "cleaned",
      label: t("dashboard.cleaned"),
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      value: cleaned,
    },
    {
      key: "high",
      label: t("dashboard.highSeverity"),
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      value: highSeverity,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass rounded-2xl p-4 sm:p-5 border ${stat.border} glow-hover`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">
                  {stat.label}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

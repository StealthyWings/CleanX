"use client";

import { motion } from "framer-motion";
import { Sparkles, Leaf, AlertTriangle, Flame } from "lucide-react";
import { Severity, SEVERITY_POINTS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface SeverityPickerProps {
  severity: Severity | null;
  setSeverity: (s: Severity) => void;
  aiSuggestion: Severity | null;
}

const severityOptions: {
  value: Severity;
  icon: typeof Leaf;
  gradient: string;
  border: string;
  glow: string;
  textColor: string;
}[] = [
  {
    value: "low",
    icon: Leaf,
    gradient: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/30",
    glow: "glow-green",
    textColor: "text-emerald-600",
  },
  {
    value: "medium",
    icon: AlertTriangle,
    gradient: "from-orange-500/20 to-amber-600/10",
    border: "border-orange-500/30",
    glow: "glow-orange",
    textColor: "text-orange-500",
  },
  {
    value: "high",
    icon: Flame,
    gradient: "from-red-500/20 to-rose-600/10",
    border: "border-red-500/30",
    glow: "glow-red",
    textColor: "text-red-500",
  },
];

export default function SeverityPicker({ severity, setSeverity, aiSuggestion }: SeverityPickerProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="font-display text-3xl uppercase tracking-wide text-ink mb-2">{t("report.selectSeverity")}</h2>
      <p className="text-muted-foreground text-sm mb-6">
        {t("report.selectSeverityDesc")}
        {aiSuggestion && (
          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-xs">
            <Sparkles className="w-3 h-3" />
            {t("report.aiSuggests")}: {t(`report.${aiSuggestion}`)}
          </span>
        )}
      </p>

      <div className="grid grid-cols-1 gap-4" role="radiogroup" aria-label={t("report.selectSeverity")}>
        {severityOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = severity === opt.value;
          const isAiSuggested = aiSuggestion === opt.value && !severity;

          return (
            <motion.button
              key={opt.value}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSeverity(opt.value)}
              role="radio"
              aria-checked={isSelected}
              className={cn(
                "relative w-full text-left p-6 rounded-2xl glass border transition-all duration-300 cursor-pointer",
                isSelected
                  ? `${opt.border} bg-linear-to-r ${opt.gradient} shadow-lg`
                  : isAiSuggested
                  ? `${opt.border} bg-linear-to-r ${opt.gradient} opacity-80`
                  : "border-border/30 hover:border-border/50",
                opt.glow
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? `bg-linear-to-br ${opt.gradient}` : "bg-muted/30"
                  )}
                >
                  <Icon className={cn("w-7 h-7", isSelected ? opt.textColor : "text-muted-foreground")} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={cn("text-lg font-semibold", isSelected && opt.textColor)}>
                      {t(`report.${opt.value}`)}
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground">
                      +{SEVERITY_POINTS[opt.value]} {t("leaderboard.pts")}
                    </span>
                    {isAiSuggested && !isSelected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-[10px] font-medium animate-glow-pulse">
                        <Sparkles className="w-2.5 h-2.5" />
                        {t("report.aiSuggested")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{t(`report.${opt.value}Desc`)}</p>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0", opt.textColor)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

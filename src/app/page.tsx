"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, BarChart3, Sparkles, ArrowRight, Shield, Zap, Users } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useReportStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function HomePage() {
  const store = useReportStore();
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen gradient-bg overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-brand/[0.04] blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -20, 30, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/[0.03] blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, 15, -15, 0], y: [0, -25, 15, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 right-1/3 w-[350px] h-[350px] rounded-full bg-emerald-500/[0.03] blur-[100px]"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-brand/20 text-xs font-medium text-brand-light">
            <Sparkles className="w-3.5 h-3.5" />
            {t("landing.badge")}
          </div>
        </motion.div>

        {/* Hero Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
        >
          {t("landing.heading")}{" "}
          <span className="bg-gradient-to-r from-brand via-brand-light to-emerald-400 bg-clip-text text-transparent">
            {t("landing.headingHighlight")}
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-center text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          {t("landing.subtitle")}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link href="/report">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(6,182,212,0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-brand to-brand-dark text-white font-semibold text-base shadow-lg shadow-brand/20 flex items-center gap-3 cursor-pointer"
            >
              <MapPin className="w-5 h-5" />
              {t("landing.reportBtn")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </Link>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group px-8 py-4 rounded-2xl glass border border-border/40 text-foreground font-semibold text-base flex items-center gap-3 hover:border-brand/30 transition-colors cursor-pointer"
            >
              <BarChart3 className="w-5 h-5 text-brand-light" />
              {t("landing.viewBtn")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-muted-foreground" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Live Stats */}
        <motion.div variants={itemVariants}>
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">
            {t("landing.statsTitle")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <GlassCard className="text-center p-5">
              <p className="text-3xl font-bold text-brand-light mb-1">
                <AnimatedCounter value={store.totalReported()} />
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("landing.totalReports")}</p>
            </GlassCard>
            <GlassCard className="text-center p-5">
              <p className="text-3xl font-bold text-amber-400 mb-1">
                <AnimatedCounter value={store.inProgress()} />
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("landing.inProgress")}</p>
            </GlassCard>
            <GlassCard className="text-center p-5">
              <p className="text-3xl font-bold text-emerald-400 mb-1">
                <AnimatedCounter value={store.cleaned()} />
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("landing.cleaned")}</p>
            </GlassCard>
            <GlassCard className="text-center p-5">
              <p className="text-3xl font-bold text-red-400 mb-1">
                <AnimatedCounter value={store.highSeverity()} />
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("landing.highSeverity")}</p>
            </GlassCard>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div variants={itemVariants} className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="text-center p-8">
            <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand-light flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("landing.feature1Title")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("landing.feature1Desc")}
            </p>
          </GlassCard>
          <GlassCard className="text-center p-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("landing.feature2Title")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("landing.feature2Desc")}
            </p>
          </GlassCard>
          <GlassCard className="text-center p-8">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("landing.feature3Title")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("landing.feature3Desc")}
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}

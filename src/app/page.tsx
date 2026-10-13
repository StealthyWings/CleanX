"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Shield, Zap, Users } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { FernIllustration } from "@/components/FernIllustration";
import { useReportStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

const MotionLink = motion.create(Link);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function HomePage() {
  const totalReported = useReportStore((s) => s.reports.length);
  const inProgress = useReportStore((s) => s.reports.filter((r) => r.status === "in-progress").length);
  const cleaned = useReportStore((s) => s.reports.filter((r) => r.status === "cleaned").length);
  const highSeverity = useReportStore((s) => s.reports.filter((r) => r.severity === "high" && r.status !== "cleaned").length);
  const { t } = useTranslation();

  const stats = [
    { label: t("landing.totalReports"), value: totalReported },
    { label: t("landing.inProgress"), value: inProgress },
    { label: t("landing.cleaned"), value: cleaned },
    { label: t("landing.highSeverity"), value: highSeverity },
  ];

  const features = [
    { icon: Zap, title: t("landing.feature1Title"), desc: t("landing.feature1Desc") },
    { icon: Users, title: t("landing.feature2Title"), desc: t("landing.feature2Desc") },
    { icon: Shield, title: t("landing.feature3Title"), desc: t("landing.feature3Desc") },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden lg:min-h-[calc(100vh-4.5rem)] flex flex-col lg:block">
        {/* Fern hill — banner on mobile, left half on desktop */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="order-2 h-72 sm:h-96 lg:h-auto lg:absolute lg:inset-y-0 lg:left-0 lg:w-[56%] pointer-events-none"
        >
          <FernIllustration />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="order-1 relative z-10 w-full px-4 sm:px-6 lg:pl-[56%] lg:pr-10 xl:pr-16 pt-14 pb-10 lg:py-0 lg:min-h-[calc(100vh-4.5rem)] flex items-center justify-center"
        >
          <div className="text-center max-w-xl mx-auto lg:py-20 lg:pl-8">
            <motion.h1
              variants={itemVariants}
              className="font-display font-bold uppercase leading-[0.95] tracking-[0.06em] text-ink text-6xl sm:text-7xl lg:text-6xl xl:text-7xl 2xl:text-8xl mb-8"
            >
              <span className="block">{t("landing.heading")}</span>
              <span className="block text-brand">{t("landing.headingHighlight")}</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-10"
            >
              {t("landing.subtitle")}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <MotionLink
                href="/report"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-brand hover:bg-brand-light text-white font-display text-xl tracking-wide shadow-lg shadow-brand/25 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                {t("landing.reportBtn")}
              </MotionLink>
              <MotionLink
                href="/dashboard"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border-2 border-brand/40 text-brand-dark hover:border-brand hover:bg-brand/5 font-display text-xl tracking-wide transition-colors"
              >
                {t("landing.viewBtn")}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </MotionLink>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Live stats band */}
      <section className="bg-fern-dark text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:divide-x md:divide-white/10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center px-4">
                <p className="font-display text-5xl font-semibold tabular-nums">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="mt-1 text-xs uppercase tracking-widest text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-8 rounded-3xl border border-border bg-background glow-hover"
            >
              <div className="w-14 h-14 rounded-full bg-brand text-white flex items-center justify-center mx-auto mb-5">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl uppercase tracking-wide text-ink mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

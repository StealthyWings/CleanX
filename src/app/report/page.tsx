"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Camera, AlertTriangle, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { useReportStore } from "@/lib/store";
import { Severity } from "@/lib/types";
import LocationPicker from "@/components/report/LocationPicker";
import ImageUpload from "@/components/report/ImageUpload";
import SeverityPicker from "@/components/report/SeverityPicker";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function ReportPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<Severity | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const addReport = useReportStore((s) => s.addReport);
  const router = useRouter();
  const { t } = useTranslation();

  const steps = [
    { label: t("report.stepLocation"), icon: MapPin },
    { label: t("report.stepPhoto"), icon: Camera },
    { label: t("report.stepSeverity"), icon: AlertTriangle },
  ];

  const canProceed = useCallback(() => {
    if (currentStep === 0) return !!location;
    if (currentStep === 1) return !!imageUrl;
    if (currentStep === 2) return !!severity;
    return false;
  }, [currentStep, location, imageUrl, severity]);

  const next = () => {
    if (!canProceed()) return;
    if (currentStep < 2) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      // Submit
      addReport({
        lat: location!.lat,
        lng: location!.lng,
        imageUrl,
        severity: severity!,
      });
      setSubmitted(true);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass rounded-3xl p-8 sm:p-12 text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-3">{t("report.submitted")}</h2>
          <p className="text-muted-foreground mb-8">
            {t("report.submittedDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand to-brand-dark text-white font-semibold cursor-pointer"
            >
              {t("report.viewDashboard")}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSubmitted(false);
                setCurrentStep(0);
                setLocation(null);
                setImageUrl("");
                setSeverity(null);
                setAiSuggestion(null);
              }}
              className="px-6 py-3 rounded-xl glass border border-border/40 font-semibold cursor-pointer"
            >
              {t("report.reportAnother")}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            const isComplete = i < currentStep;
            return (
              <div key={i} className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isComplete
                      ? "rgba(6,182,212,0.3)"
                      : isActive
                      ? "rgba(6,182,212,0.15)"
                      : "rgba(31,41,55,0.5)",
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border transition-colors"
                  style={{
                    borderColor: isComplete || isActive
                      ? "rgba(6,182,212,0.4)"
                      : "rgba(75,85,99,0.3)",
                  }}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4 text-brand-light" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isActive ? "text-brand-light" : "text-muted-foreground"}`} />
                  )}
                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      isActive || isComplete ? "text-brand-light" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-8 h-px ${
                      i < currentStep ? "bg-brand/40" : "bg-border/40"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="relative overflow-hidden min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              {currentStep === 0 && (
                <LocationPicker location={location} setLocation={setLocation} />
              )}
              {currentStep === 1 && (
                <ImageUpload
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  onAiSuggestion={setAiSuggestion}
                />
              )}
              {currentStep === 2 && (
                <SeverityPicker
                  severity={severity}
                  setSeverity={setSeverity}
                  aiSuggestion={aiSuggestion}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={prev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-border/40 text-sm font-medium disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("report.back")}
          </motion.button>
          <motion.button
            whileHover={canProceed() ? { scale: 1.03, boxShadow: "0 0 30px rgba(6,182,212,0.25)" } : {}}
            whileTap={canProceed() ? { scale: 0.97 } : {}}
            onClick={next}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand to-brand-dark text-white text-sm font-semibold disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-brand/20 cursor-pointer"
          >
            {currentStep === 2 ? t("report.submitReport") : t("report.continue")}
            {currentStep === 2 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

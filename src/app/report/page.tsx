"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Camera, AlertTriangle, Check, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const addReport = useReportStore((s) => s.addReport);
  const router = useRouter();
  const { t } = useTranslation();

  const steps = [
    { label: t("report.stepLocation"), icon: MapPin },
    { label: t("report.stepPhoto"), icon: Camera },
    { label: t("report.stepSeverity"), icon: AlertTriangle },
  ];

  const canProceed = useCallback(() => {
    if (submitting) return false;
    if (currentStep === 0) return !!location;
    if (currentStep === 1) return !!imageUrl;
    if (currentStep === 2) return !!severity;
    return false;
  }, [currentStep, location, imageUrl, severity, submitting]);

  const next = async () => {
    if (!canProceed()) return;
    if (currentStep < 2) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Submit
      setSubmitting(true);
      setSubmitError("");
      try {
        await addReport({
          lat: location!.lat,
          lng: location!.lng,
          imageUrl,
          severity: severity!,
        });
        setSubmitted(true);
        window.scrollTo({ top: 0 });
      } catch {
        setSubmitError(t("common.saveFailed"));
      } finally {
        setSubmitting(false);
      }
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
            className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10" />
          </motion.div>
          <h2 className="font-display text-4xl uppercase tracking-wide text-ink mb-3">{t("report.submitted")}</h2>
          <p className="text-muted-foreground mb-8">
            {t("report.submittedDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/dashboard")}
              className="px-7 py-3 rounded-full bg-brand hover:bg-brand-light text-white font-display text-lg tracking-wide transition-colors cursor-pointer"
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
              className="px-7 py-3 rounded-full border-2 border-brand/40 text-brand-dark hover:border-brand font-display text-lg tracking-wide transition-colors cursor-pointer"
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
                    scale: isActive ? 1.05 : 1,
                    backgroundColor: isComplete
                      ? "rgba(122,139,63,0.14)"
                      : isActive
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.5)",
                    borderColor: isComplete || isActive
                      ? "rgba(122,139,63,0.5)"
                      : "rgba(148,163,184,0.35)",
                  }}
                  aria-current={isActive ? "step" : undefined}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isActive ? "shadow-md shadow-brand/15" : ""}`}
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
                    className={`w-6 sm:w-10 h-0.5 rounded-full transition-colors duration-500 ${
                      i < currentStep ? "bg-brand/50" : "bg-border"
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

        {submitError && (
          <p role="alert" className="mt-6 text-sm text-red-600 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            {submitError}
          </p>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={prev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-brand/30 text-brand-dark hover:border-brand bg-white font-display text-base tracking-wide disabled:opacity-0 disabled:pointer-events-none transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("report.back")}
          </motion.button>
          <motion.button
            whileHover={canProceed() ? { scale: 1.03, boxShadow: "0 8px 24px rgba(122,139,63,0.3)" } : {}}
            whileTap={canProceed() ? { scale: 0.97 } : {}}
            onClick={next}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand hover:bg-brand-light transition-colors text-white font-display text-base tracking-wide disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed shadow-lg shadow-brand/20 cursor-pointer"
          >
            {submitting ? t("common.saving") : currentStep === 2 ? t("report.submitReport") : t("report.continue")}
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : currentStep === 2 ? (
              <Check className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

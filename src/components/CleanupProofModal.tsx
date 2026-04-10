"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Loader2, AlertTriangle, ShieldAlert } from "lucide-react";
import { Report } from "@/lib/types";
import { useReportStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

interface CleanupProofModalProps {
  report: Report;
  onClose: () => void;
}

export function CleanupProofModal({ report, onClose }: CleanupProofModalProps) {
  const [afterImage, setAfterImage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<"" | "duplicate" | "flagged">("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const markCleaned = useReportStore((s) => s.markCleaned);
  const isImageDuplicate = useReportStore((s) => s.isImageDuplicate);
  const { t } = useTranslation();

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // Check for duplicate before even setting it
      if (isImageDuplicate(dataUrl)) {
        setError(t("proof.duplicateWarning"));
        setErrorType("duplicate");
        setAfterImage(""); // clear
        return;
      }
      setAfterImage(dataUrl);
      setError("");
      setErrorType("");
    };
    reader.readAsDataURL(file);
  }, [isImageDuplicate, t]);

  const handleSubmit = async () => {
    if (!afterImage) {
      setError(t("proof.required"));
      setErrorType("");
      return;
    }
    setSubmitting(true);
    // Simulate brief processing delay
    await new Promise((res) => setTimeout(res, 500));

    const result = markCleaned(report.id, afterImage);

    if (result === 'duplicate') {
      setError(t("proof.duplicateWarning"));
      setErrorType("duplicate");
      setAfterImage("");
      setSubmitting(false);
      return;
    }

    if (result === 'flagged') {
      setError(t("proof.accountFlagged"));
      setErrorType("flagged");
      setAfterImage("");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(148,163,184,0.3)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">{t("proof.title")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t("proof.subtitle")}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/30 text-muted-foreground cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Before image */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              {t("proof.beforeImage")}
            </p>
            <div className="rounded-xl overflow-hidden border border-border/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={report.imageUrl} alt="Before" className="w-full h-40 object-cover" />
            </div>
          </div>

          {/* After upload */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              {t("proof.afterImage")}
            </p>
            {!afterImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file);
                }}
                className="border-2 border-dashed border-border/40 rounded-xl p-8 text-center cursor-pointer hover:border-brand/30 transition-colors"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t("proof.uploadAfter")}</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-emerald-500/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={afterImage} alt="After" className="w-full h-40 object-cover" />
                <button
                  onClick={() => { setAfterImage(""); setError(""); setErrorType(""); }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-foreground cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Error messages */}
          {error && (
            <div className={`text-xs mb-3 p-3 rounded-xl flex items-start gap-2 ${
              errorType === 'flagged'
                ? 'bg-red-50 border border-red-300 text-red-700'
                : errorType === 'duplicate'
                ? 'bg-amber-50 border border-amber-300 text-amber-700'
                : 'bg-red-50 border border-red-200 text-red-500'
            }`}>
              {errorType === 'flagged' ? (
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              ) : errorType === 'duplicate' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : null}
              <span>{error}</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              // Reset input so re-selecting same file triggers onChange
              if (e.target) e.target.value = '';
            }}
            className="hidden"
          />

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border/40 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {t("proof.cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!afterImage || submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("proof.uploading")}
                </>
              ) : (
                t("proof.submit")
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, X, Loader2, AlertTriangle, ShieldAlert } from "lucide-react";
import { Report } from "@/lib/types";
import { useReportStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { compressImage } from "@/lib/utils";

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
  const [dragOver, setDragOver] = useState(false);

  // Close on Escape and lock page scroll while the modal is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await compressImage(file);
    // Check for duplicate before even setting it (the server re-checks on submit)
    if (isImageDuplicate(dataUrl)) {
      setError(t("proof.duplicateWarning"));
      setErrorType("duplicate");
      setAfterImage(""); // clear
      return;
    }
    setAfterImage(dataUrl);
    setError("");
    setErrorType("");
  }, [isImageDuplicate, t]);

  const handleSubmit = async () => {
    if (!afterImage) {
      setError(t("proof.required"));
      setErrorType("");
      return;
    }
    setSubmitting(true);

    let result;
    try {
      result = await markCleaned(report.id, afterImage);
    } catch {
      setError(t("common.saveFailed"));
      setErrorType("");
      setSubmitting(false);
      return;
    }

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(15,23,42,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="proof-modal-title"
        initial={{ scale: 0.95, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="glass rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(148,163,184,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 id="proof-modal-title" className="font-display text-2xl uppercase tracking-wide text-ink">{t("proof.title")}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t("proof.subtitle")}</p>
          </div>
          <button onClick={onClose} aria-label={t("proof.close")} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
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
            <img src={report.imageUrl} alt={t("proof.beforeImage")} className="w-full h-40 object-cover bg-muted/40" />
          </div>
        </div>

        {/* After upload */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            {t("proof.afterImage")}
          </p>
          {!afterImage ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              className={`w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragOver ? "border-brand/50 bg-brand/5" : "border-border/40 hover:border-brand/30"
              }`}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("proof.uploadAfter")}</p>
            </button>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-emerald-500/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={afterImage} alt={t("proof.afterImage")} className="w-full h-40 object-cover" />
              <button
                onClick={() => { setAfterImage(""); setError(""); setErrorType(""); }}
                aria-label={t("report.removeImage")}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-foreground cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Error messages */}
        {error && (
          <div role="alert" className={`text-xs mb-3 p-3 rounded-xl flex items-start gap-2 ${
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
            className="flex-1 px-4 py-2.5 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {t("proof.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!afterImage || submitting}
            className="flex-1 px-4 py-2.5 rounded-full bg-fern hover:bg-fern-dark transition-colors text-white text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
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
  );
}

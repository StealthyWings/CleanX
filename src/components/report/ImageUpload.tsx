"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, ImageIcon, Loader2, Sparkles, X } from "lucide-react";
import { Severity } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import { cn, compressImage } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024;

interface ImageUploadProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  onAiSuggestion: (severity: Severity | null) => void;
}

export default function ImageUpload({ imageUrl, setImageUrl, onAiSuggestion }: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > MAX_BYTES) {
        setError(t("report.fileTooLarge"));
        return;
      }
      setError("");

      setAnalyzing(true);
      try {
        const url = await compressImage(file);
        setImageUrl(url);

        // Trigger AI analysis
        const img = new Image();
        img.src = url;
        await img.decode().catch(() => {});

        const { suggestSeverity } = await import("@/lib/ai-severity");
        onAiSuggestion(await suggestSeverity(img));
      } catch {
        onAiSuggestion(null);
      } finally {
        setAnalyzing(false);
      }
    },
    [setImageUrl, onAiSuggestion, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset so picking the same file again still fires onChange
      e.target.value = "";
    },
    [processFile]
  );

  return (
    <div>
      <h2 className="font-display text-3xl uppercase tracking-wide text-ink mb-2">{t("report.uploadPhoto")}</h2>
      <p className="text-muted-foreground text-sm mb-6">{t("report.uploadPhotoDesc")}</p>

      {!imageUrl ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "w-full glass rounded-2xl p-10 text-center border-2 border-dashed transition-colors cursor-pointer",
            dragOver ? "border-brand/50 bg-brand/5" : "border-border/40 hover:border-brand/30"
          )}
        >
          <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand-light flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7" />
          </div>
          <p className="font-semibold mb-1">{t("report.dropImage")}</p>
          <p className="text-xs text-muted-foreground">{t("report.imageFormats")}</p>
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden border border-border/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={t("report.uploadPhoto")}
              className="w-full h-64 object-cover"
            />
            <button
              onClick={() => {
                setImageUrl("");
                onAiSuggestion(null);
              }}
              aria-label={t("report.removeImage")}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/85 backdrop-blur text-muted-foreground hover:text-foreground shadow-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {analyzing ? (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2 p-3 rounded-xl glass border border-brand/20"
            >
              <Loader2 className="w-4 h-4 text-brand-light animate-spin" />
              <span className="text-sm text-brand-light">{t("report.aiAnalyzing")}</span>
              <Sparkles className="w-3 h-3 text-brand-light animate-glow-pulse" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 flex items-center justify-center gap-2 text-sm text-emerald-600"
            >
              <ImageIcon className="w-4 h-4" />
              {t("report.imageUploaded")}
            </motion.div>
          )}
        </motion.div>
      )}

      {error && (
        <p role="alert" className="text-red-600 text-sm mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

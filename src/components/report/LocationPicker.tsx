"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Navigation, MousePointerClick, MapPin, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { withNoSSR } from "@/components/MapWrapper";
import { useTranslation } from "@/lib/i18n";

const LocationMapPicker = withNoSSR(() => import("@/components/report/LocationMapInner"));

type LatLng = { lat: number; lng: number };

interface LocationPickerProps {
  location: LatLng | null;
  setLocation: (loc: LatLng | null) => void;
}

export default function LocationPicker({ location, setLocation }: LocationPickerProps) {
  const [mode, setMode] = useState<"choose" | "map">(location ? "map" : "choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const handleGPS = useCallback(() => {
    if (loading) return;
    setError("");
    if (!navigator.geolocation) {
      setError(t("report.geoUnsupported"));
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
        // Show the map so the pin can be fine-tuned
        setMode("map");
      },
      () => {
        setError(t("report.locationError"));
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [loading, setLocation, t]);

  return (
    <div>
      <h2 className="font-display text-3xl uppercase tracking-wide text-ink mb-2">{t("report.pickLocation")}</h2>
      <p className="text-muted-foreground text-sm mb-6">{t("report.pickLocationDesc")}</p>

      {mode === "choose" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassCard onClick={handleGPS} hover={false} className="p-8 text-center cursor-pointer hover:border-brand hover:shadow-[inset_0_0_0_1px_var(--color-brand)] transition-[border-color,box-shadow] duration-200">
            {loading ? (
              <Loader2 className="w-10 h-10 mx-auto mb-3 text-brand-light animate-spin" />
            ) : (
              <Navigation className="w-10 h-10 mx-auto mb-3 text-brand-light" />
            )}
            <h3 className="font-semibold mb-1">{t("report.useMyLocation")}</h3>
            <p className="text-xs text-muted-foreground">{t("report.autoDetect")}</p>
          </GlassCard>
          <GlassCard onClick={() => setMode("map")} hover={false} className="p-8 text-center cursor-pointer hover:border-brand hover:shadow-[inset_0_0_0_1px_var(--color-brand)] transition-[border-color,box-shadow] duration-200">
            <MousePointerClick className="w-10 h-10 mx-auto mb-3 text-amber-500" />
            <h3 className="font-semibold mb-1">{t("report.pickOnMap")}</h3>
            <p className="text-xs text-muted-foreground">{t("report.clickToDrop")}</p>
          </GlassCard>
        </div>
      )}

      {error && (
        <motion.p
          role="alert"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 text-sm mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
        >
          {error}
        </motion.p>
      )}

      {mode === "map" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <div className="h-[350px] rounded-2xl overflow-hidden border border-border/30 isolate">
            <LocationMapPicker location={location} setLocation={setLocation} />
          </div>
          {!location && (
            <p className="mt-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5" />
              {t("report.clickToDrop")}
            </p>
          )}
        </motion.div>
      )}

      {location && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 flex items-center justify-center gap-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-brand/20 text-sm">
            <MapPin className="w-4 h-4 text-brand-light" />
            <span className="text-brand-light font-medium tabular-nums">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </div>
          <button
            onClick={() => {
              setLocation(null);
              setMode("choose");
            }}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer"
          >
            {t("report.change")}
          </button>
        </motion.div>
      )}
    </div>
  );
}

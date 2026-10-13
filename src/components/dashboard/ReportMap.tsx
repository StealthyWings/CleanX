"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useReportStore } from "@/lib/store";
import { Report, Severity, Status, SEVERITY_POINTS } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { useEffect, useState, SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "@/lib/i18n";
import { CleanupProofModal } from "@/components/CleanupProofModal";

const SEVERITY_COLORS: Record<Severity, string> = {
  low: "#22c55e",
  medium: "#f97316",
  high: "#ef4444",
};

const STATUS_LABELS: Record<Status, { key: string; color: string }> = {
  reported: { key: "map.reported", color: "#f59e0b" },
  "in-progress": { key: "map.inProgress", color: "#5d6d27" },
  cleaned: { key: "map.cleaned", color: "#22c55e" },
};

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Swap a missing photo for a neutral placeholder instead of leaving a hole in the popup
function showImagePlaceholder(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  img.onerror = null;
  img.src =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="120" viewBox="0 0 320 120"><rect width="320" height="120" fill="#f1f5f9"/><g fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(148 48)"><rect x="0" y="0" width="24" height="20" rx="3"/><circle cx="8" cy="7" r="2"/><path d="M24 15l-6-6L4 20"/></g></svg>'
    );
}

function ClaimAction({ reportId }: { reportId: string }) {
  const claimReport = useReportStore((s) => s.claimReport);
  const currentVolunteerName = useReportStore((s) => s.currentVolunteerName);
  const { t } = useTranslation();
  const [askingName, setAskingName] = useState(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const claim = async (volunteerName: string) => {
    setPending(true);
    setError("");
    try {
      await claimReport(reportId, volunteerName);
    } catch {
      setError(t("common.saveFailed"));
      setPending(false);
    }
  };

  const buttonStyle = {
    width: "100%", padding: "8px 16px", borderRadius: "999px",
    background: "linear-gradient(135deg, #8a9a4b, #6f8132)",
    color: "white", fontSize: "13px", fontWeight: 600,
    border: "none", cursor: pending ? "wait" : "pointer", transition: "transform 0.15s",
    opacity: pending ? 0.7 : 1,
  } as const;

  const errorText = error && (
    <p role="alert" style={{ marginTop: "6px", fontSize: "11px", color: "#dc2626", textAlign: "center" }}>{error}</p>
  );

  if (askingName) {
    return (
      <>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim() && !pending) claim(name.trim());
          }}
          style={{ display: "flex", gap: "6px" }}
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("map.enterName")}
            aria-label={t("map.enterName")}
            maxLength={60}
            style={{
              flex: 1, minWidth: 0, padding: "7px 12px", borderRadius: "999px", fontSize: "13px",
              border: "1px solid rgba(111,129,50,0.35)", outline: "none", background: "white",
            }}
          />
          <button
            type="submit"
            disabled={!name.trim() || pending}
            style={{ ...buttonStyle, width: "auto", opacity: name.trim() && !pending ? 1 : 0.5 }}
          >
            {pending ? "…" : t("map.confirmClaim")}
          </button>
        </form>
        {errorText}
      </>
    );
  }

  return (
    <>
      <button
        disabled={pending}
        onClick={(e) => {
          e.stopPropagation();
          if (currentVolunteerName) {
            claim(currentVolunteerName);
          } else {
            setAskingName(true);
          }
        }}
        style={buttonStyle}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {pending ? t("common.saving") : t("map.claimForCleanup")}
      </button>
      {errorText}
    </>
  );
}

function ReportMarker({ report }: { report: Report }) {
  const volunteer = useReportStore((s) =>
    report.claimedBy ? s.volunteers.find((v) => v.name === report.claimedBy) : undefined
  );
  const { t, locale } = useTranslation();
  const [showProofModal, setShowProofModal] = useState(false);

  const color = report.status === "cleaned" ? "#6b7280" : SEVERITY_COLORS[report.severity];
  const fillOpacity = report.status === "cleaned" ? 0.3 : 0.6;
  const radius = report.severity === "high" ? 12 : report.severity === "medium" ? 10 : 8;
  const statusInfo = STATUS_LABELS[report.status];

  return (
    <>
      <CircleMarker
        center={[report.lat, report.lng]}
        radius={radius}
        pathOptions={{
          color: color,
          fillColor: color,
          fillOpacity: fillOpacity,
          weight: report.status === "in-progress" ? 3 : 2,
          dashArray: report.status === "in-progress" ? "5,5" : undefined,
        }}
      >
        <Popup minWidth={280} maxWidth={320}>
          <div style={{ fontFamily: "var(--font-poppins), system-ui, sans-serif" }}>
            {/* Image — before/after if cleaned */}
            {report.status === "cleaned" && report.afterImageUrl ? (
              <div style={{ marginBottom: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", borderRadius: "8px", overflow: "hidden" }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", top: "4px", left: "4px", zIndex: 10, padding: "1px 8px", borderRadius: "999px", background: "rgba(239,68,68,0.8)", color: "white", fontSize: "9px", fontWeight: 600 }}>
                      {t("map.before")}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={report.imageUrl} alt={t("map.before")} onError={showImagePlaceholder} style={{ width: "100%", height: "100px", objectFit: "cover", display: "block" }} />
                  </div>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", top: "4px", left: "4px", zIndex: 10, padding: "1px 8px", borderRadius: "999px", background: "rgba(34,197,94,0.8)", color: "white", fontSize: "9px", fontWeight: 600 }}>
                      {t("map.after")}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={report.afterImageUrl} alt={t("map.after")} onError={showImagePlaceholder} style={{ width: "100%", height: "100px", objectFit: "cover", display: "block" }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: "12px" }}>
                {/* Before image label */}
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", top: "4px", left: "4px", zIndex: 10,
                    padding: "1px 8px", borderRadius: "999px",
                    background: "rgba(239,68,68,0.8)", color: "white", fontSize: "9px", fontWeight: 600
                  }}>
                    {t("map.before")}
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={report.imageUrl}
                    alt={t("map.before")}
                    style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", display: "block" }}
                    onError={showImagePlaceholder}
                  />
                </div>
                {/* Show "awaiting proof" for in-progress without after photo */}
                {report.status === "in-progress" && !report.afterImageUrl && (
                  <div style={{
                    marginTop: "6px", padding: "4px 10px", borderRadius: "6px",
                    background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
                    fontSize: "11px", color: "#d97706", textAlign: "center", fontWeight: 500,
                  }}>
                    {t("map.notFullyCleaned")}
                  </div>
                )}
              </div>
            )}

            {/* Badges */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
                  background: `${SEVERITY_COLORS[report.severity]}20`,
                  color: SEVERITY_COLORS[report.severity],
                  border: `1px solid ${SEVERITY_COLORS[report.severity]}40`,
                }}
              >
                ● {t(`report.${report.severity}`)} · {SEVERITY_POINTS[report.severity]} {t("map.pts")}
              </span>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
                  background: `${statusInfo.color}20`,
                  color: statusInfo.color,
                  border: `1px solid ${statusInfo.color}40`,
                }}
              >
                {t(statusInfo.key)}
              </span>
            </div>

            {/* Timestamp */}
            <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "10px" }}>
              📍 {report.lat.toFixed(4)}, {report.lng.toFixed(4)} · {timeAgo(report.timestamp, locale)}
            </p>

            {/* Volunteer info — show when claimed or cleaned */}
            {volunteer && (
              <div style={{
                padding: "10px 12px", borderRadius: "10px", marginBottom: "10px",
                background: "rgba(122,139,63,0.07)", border: "1px solid rgba(122,139,63,0.2)",
              }}>
                <p style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t("map.volunteerInfo")}
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#44511b", marginBottom: "6px" }}>
                  👤 {volunteer.name}
                </p>
                <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#475569" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    🏆 <strong>{volunteer.totalPoints}</strong> {t("map.pts")}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    🧹 <strong>{volunteer.cleanupCount}</strong> {t("map.cleanups")}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            {report.status === "reported" && <ClaimAction reportId={report.id} />}

            {report.status === "in-progress" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProofModal(true);
                }}
                style={{
                  width: "100%", padding: "8px 16px", borderRadius: "999px",
                  background: "linear-gradient(135deg, #4f8a3e, #3f7a36)",
                  color: "white", fontSize: "13px", fontWeight: 600,
                  border: "none", cursor: "pointer", transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                📸 {t("map.markCleaned")}
              </button>
            )}

            {report.status === "cleaned" && (
              <p style={{ fontSize: "12px", color: "#16a34a", textAlign: "center", fontWeight: 600 }}>
                {t("map.cleanedAt")} {report.cleanedAt ? timeAgo(report.cleanedAt, locale) : ""}
              </p>
            )}
          </div>
        </Popup>
      </CircleMarker>

      {/* Proof modal rendered outside popup */}
      {showProofModal && (
        <ProofModalPortal report={report} onClose={() => setShowProofModal(false)} />
      )}
    </>
  );
}

// Render the proof modal at document body level to avoid Leaflet popup clipping.
// This file only ever loads client-side (see withNoSSR), so document is available.
function ProofModalPortal({ report, onClose }: { report: Report; onClose: () => void }) {
  return createPortal(<CleanupProofModal report={report} onClose={onClose} />, document.body);
}

export default function ReportMap() {
  const reports = useReportStore((s) => s.reports);

  return (
    <MapContainer
      center={[13.05, 80.25]}
      zoom={12}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapResizer />
      {reports.map((report) => (
        <ReportMarker key={`${report.id}-${report.status}`} report={report} />
      ))}
    </MapContainer>
  );
}

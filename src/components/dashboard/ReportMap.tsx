"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useReportStore } from "@/lib/store";
import { Report, Severity, Status, SEVERITY_POINTS } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";

const SEVERITY_COLORS: Record<Severity, string> = {
  low: "#22c55e",
  medium: "#f97316",
  high: "#ef4444",
};

const STATUS_LABELS: Record<Status, { key: string; color: string }> = {
  reported: { key: "map.reported", color: "#f59e0b" },
  "in-progress": { key: "map.inProgress", color: "#3b82f6" },
  cleaned: { key: "map.cleaned", color: "#22c55e" },
};

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

function ReportMarker({ report }: { report: Report }) {
  const claimReport = useReportStore((s) => s.claimReport);
  const getVolunteerByName = useReportStore((s) => s.getVolunteerByName);
  const { t } = useTranslation();
  const [showProofModal, setShowProofModal] = useState(false);

  const color = report.status === "cleaned" ? "#6b7280" : SEVERITY_COLORS[report.severity];
  const fillOpacity = report.status === "cleaned" ? 0.3 : 0.6;
  const radius = report.severity === "high" ? 12 : report.severity === "medium" ? 10 : 8;
  const statusInfo = STATUS_LABELS[report.status];

  const volunteer = report.claimedBy ? getVolunteerByName(report.claimedBy) : null;

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
                    <img src={report.imageUrl} alt="Before" style={{ width: "100%", height: "100px", objectFit: "cover" }} />
                  </div>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", top: "4px", left: "4px", zIndex: 10, padding: "1px 8px", borderRadius: "999px", background: "rgba(34,197,94,0.8)", color: "white", fontSize: "9px", fontWeight: 600 }}>
                      {t("map.after")}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={report.afterImageUrl} alt="After" style={{ width: "100%", height: "100px", objectFit: "cover" }} />
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
                    alt="Hotspot"
                    style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
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
                ● {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)} · {SEVERITY_POINTS[report.severity]} {t("map.pts")}
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
              📍 {report.lat.toFixed(4)}, {report.lng.toFixed(4)} · {timeAgo(report.timestamp)}
            </p>

            {/* Volunteer info — show when claimed or cleaned */}
            {volunteer && (
              <div style={{
                padding: "10px 12px", borderRadius: "10px", marginBottom: "10px",
                background: "rgba(8,145,178,0.06)", border: "1px solid rgba(8,145,178,0.15)",
              }}>
                <p style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t("map.volunteerInfo")}
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#0e7490", marginBottom: "6px" }}>
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
            {report.status === "reported" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const name = prompt("Enter your volunteer name:") || "Anonymous";
                  claimReport(report.id, name);
                }}
                style={{
                  width: "100%", padding: "8px 16px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                  color: "white", fontSize: "13px", fontWeight: 600,
                  border: "none", cursor: "pointer", transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                {t("map.claimForCleanup")}
              </button>
            )}

            {report.status === "in-progress" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProofModal(true);
                }}
                style={{
                  width: "100%", padding: "8px 16px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
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
                {t("map.cleanedAt")} {report.cleanedAt ? timeAgo(report.cleanedAt) : ""}
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

// Render the proof modal at document body level to avoid Leaflet popup clipping
function ProofModalPortal({ report, onClose }: { report: Report; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Dynamic import to avoid SSR issues
  const { CleanupProofModal } = require("@/components/CleanupProofModal");
  return <CleanupProofModal report={report} onClose={onClose} />;
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

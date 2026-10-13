import { cn } from "@/lib/utils";

/**
 * Decorative hero art: a dark hill covered in ferns, drawn procedurally so it
 * stays crisp at any size and needs no image asset. Fully deterministic, so
 * server and client renders match.
 */

type FrondSpec = {
  x: number;
  y: number;
  length: number;
  angle: number; // degrees, 0 = straight up
  color: string;
  pairs: number;
  opacity?: number;
  sway?: boolean;
  delay?: number;
};

// One pinnate leaflet pointing along +x, with a lobed (wavy) edge
function leafletPath(size: number, lobes: number) {
  const steps = 28;
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * size;
    const t = x / size;
    const envelope = size * 0.17 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), 0.75);
    const lobe = 0.62 + 0.38 * Math.abs(Math.sin(t * lobes * Math.PI));
    const w = Math.max(0, envelope * lobe);
    top.push(`${x.toFixed(1)},${(-w).toFixed(1)}`);
    bottom.unshift(`${x.toFixed(1)},${w.toFixed(1)}`);
  }
  return `M0,0 L${top.join(" L")} L${bottom.join(" L")} Z`;
}

function Frond({ x, y, length, angle, color, pairs, opacity = 1, sway, delay = 0 }: FrondSpec) {
  const leaflets = [];
  for (let i = 0; i < pairs; i++) {
    const t = i / pairs;
    const ly = -length * (0.06 + 0.9 * t);
    const size = length * 0.36 * (1 - t * 0.82);
    const tilt = 28 + 26 * (1 - t); // leaflets reach upward more near the tip
    const d = leafletPath(size, 5);
    leaflets.push(
      <path key={`r${i}`} d={d} transform={`translate(0 ${ly.toFixed(1)}) rotate(${-tilt})`} />,
      <path key={`l${i}`} d={d} transform={`translate(0 ${ly.toFixed(1)}) scale(-1 1) rotate(${-tilt})`} />
    );
  }

  const frond = (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} fill={color} opacity={opacity}>
      {leaflets}
      <path
        d={`M0,0 Q${length * 0.04},${-length * 0.5} 0,${-length}`}
        stroke={color}
        strokeWidth={Math.max(1.5, length * 0.012)}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );

  if (!sway) return frond;
  return (
    <g
      className="animate-sway"
      style={{ transformOrigin: `${x}px ${y}px`, transformBox: "view-box", animationDelay: `${delay}s` }}
    >
      {frond}
    </g>
  );
}

const BACK_FRONDS: FrondSpec[] = [
  { x: 40, y: 230, length: 190, angle: 18, color: "#b9cf9f", pairs: 14, opacity: 0.55 },
  { x: 250, y: 330, length: 150, angle: 30, color: "#c7d9b0", pairs: 12, opacity: 0.5 },
  { x: 560, y: 600, length: 160, angle: 42, color: "#c7d9b0", pairs: 12, opacity: 0.55 },
];

const FRONT_FRONDS: FrondSpec[] = [
  { x: -10, y: 420, length: 300, angle: 24, color: "#2f6b2c", pairs: 16, sway: true },
  { x: 60, y: 600, length: 360, angle: 34, color: "#3f7a36", pairs: 17, sway: true, delay: 1.2 },
  { x: 180, y: 620, length: 300, angle: 40, color: "#568f3f", pairs: 15, sway: true, delay: 0.6 },
  { x: 20, y: 300, length: 220, angle: 12, color: "#4b843b", pairs: 14 },
  { x: 300, y: 640, length: 250, angle: 48, color: "#2f6b2c", pairs: 14, sway: true, delay: 2 },
  { x: 420, y: 650, length: 200, angle: 55, color: "#6e9f4a", pairs: 13 },
  { x: -20, y: 560, length: 260, angle: 50, color: "#6e9f4a", pairs: 14, sway: true, delay: 1.6 },
  { x: 120, y: 470, length: 170, angle: -8, color: "#8fb56a", pairs: 12, opacity: 0.9 },
];

const DOTS = [
  { cx: 92, cy: 72, r: 13, fill: "#7a8b3f" },
  { cx: 172, cy: 118, r: 4, fill: "#7a8b3f" },
  { cx: 300, cy: 300, r: 7, fill: "#7a8b3f" },
  { cx: 458, cy: 418, r: 8, fill: "#7a8b3f" },
  { cx: 520, cy: 470, r: 12, fill: "#7a8b3f" },
  { cx: 330, cy: 360, r: 3, fill: "#7a8b3f" },
  { cx: 60, cy: 320, r: 14, fill: "#ffffff", opacity: 0.18 },
  { cx: 150, cy: 470, r: 22, fill: "#ffffff", opacity: 0.14 },
  { cx: 240, cy: 540, r: 9, fill: "#ffffff", opacity: 0.2 },
  { cx: 380, cy: 560, r: 26, fill: "#ffffff", opacity: 0.12 },
];

export function FernIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      className={cn("w-full h-full", className)}
      preserveAspectRatio="xMinYMax slice"
      role="img"
      aria-hidden="true"
    >
      {BACK_FRONDS.map((f, i) => (
        <Frond key={`b${i}`} {...f} />
      ))}

      {/* Dark hill */}
      <path
        d="M-20,170 C60,120 140,150 190,230 C250,330 300,420 420,470 C510,505 570,540 620,600 L620,620 L-20,620 Z"
        fill="#1c2a1c"
      />

      {FRONT_FRONDS.map((f, i) => (
        <Frond key={`f${i}`} {...f} />
      ))}

      {DOTS.map((d, i) => (
        <circle key={i} {...d} />
      ))}
    </svg>
  );
}

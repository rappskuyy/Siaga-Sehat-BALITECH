"use client";

import { useState } from "react";

export interface BodyRegion {
  id: string;
  label: string;
  shape: "rect" | "circle" | "ellipse";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rx?: number;
  cx?: number;
  cy?: number;
  r?: number;
}

const FRONT_REGIONS: BodyRegion[] = [
  { id: "kepala", label: "Kepala", shape: "ellipse", cx: 100, cy: 28, r: 0 },
  { id: "wajah", label: "Wajah", shape: "ellipse", cx: 100, cy: 30, r: 0 },
  { id: "leher", label: "Leher", shape: "rect", x: 91, y: 46, width: 18, height: 12, rx: 4 },
  { id: "bahu-kiri", label: "Bahu Kiri", shape: "circle", cx: 62, cy: 68, r: 12 },
  { id: "bahu-kanan", label: "Bahu Kanan", shape: "circle", cx: 138, cy: 68, r: 12 },
  { id: "dada", label: "Dada", shape: "rect", x: 74, y: 60, width: 52, height: 44, rx: 10 },
  { id: "perut", label: "Perut", shape: "rect", x: 76, y: 104, width: 48, height: 42, rx: 8 },
  {
    id: "lengan-atas-kiri",
    label: "Lengan Atas Kiri",
    shape: "rect",
    x: 44,
    y: 78,
    width: 18,
    height: 52,
    rx: 8,
  },
  {
    id: "lengan-atas-kanan",
    label: "Lengan Atas Kanan",
    shape: "rect",
    x: 138,
    y: 78,
    width: 18,
    height: 52,
    rx: 8,
  },
  {
    id: "siku-tangan-kiri",
    label: "Siku & Lengan Bawah Kiri",
    shape: "rect",
    x: 38,
    y: 130,
    width: 18,
    height: 50,
    rx: 8,
  },
  {
    id: "siku-tangan-kanan",
    label: "Siku & Lengan Bawah Kanan",
    shape: "rect",
    x: 144,
    y: 130,
    width: 18,
    height: 50,
    rx: 8,
  },
  {
    id: "pergelangan-tangan-kiri",
    label: "Pergelangan / Telapak Tangan Kiri",
    shape: "circle",
    cx: 46,
    cy: 190,
    r: 10,
  },
  {
    id: "pergelangan-tangan-kanan",
    label: "Pergelangan / Telapak Tangan Kanan",
    shape: "circle",
    cx: 154,
    cy: 190,
    r: 10,
  },
  { id: "pinggul", label: "Pinggul", shape: "rect", x: 74, y: 146, width: 52, height: 26, rx: 8 },
  {
    id: "paha-kiri",
    label: "Paha Kiri",
    shape: "rect",
    x: 72,
    y: 174,
    width: 24,
    height: 62,
    rx: 9,
  },
  {
    id: "paha-kanan",
    label: "Paha Kanan",
    shape: "rect",
    x: 104,
    y: 174,
    width: 24,
    height: 62,
    rx: 9,
  },
  { id: "lutut-kiri", label: "Lutut Kiri", shape: "circle", cx: 84, cy: 246, r: 11 },
  { id: "lutut-kanan", label: "Lutut Kanan", shape: "circle", cx: 116, cy: 246, r: 11 },
  {
    id: "betis-kaki-kiri",
    label: "Betis & Kaki Kiri",
    shape: "rect",
    x: 73,
    y: 258,
    width: 22,
    height: 68,
    rx: 8,
  },
  {
    id: "betis-kaki-kanan",
    label: "Betis & Kaki Kanan",
    shape: "rect",
    x: 105,
    y: 258,
    width: 22,
    height: 68,
    rx: 8,
  },
];

const BACK_REGIONS: BodyRegion[] = [
  { id: "kepala-belakang", label: "Kepala Belakang", shape: "ellipse", cx: 100, cy: 28, r: 0 },
  {
    id: "tengkuk",
    label: "Tengkuk / Leher Belakang",
    shape: "rect",
    x: 91,
    y: 46,
    width: 18,
    height: 12,
    rx: 4,
  },
  { id: "bahu-kiri-belakang", label: "Bahu Kiri", shape: "circle", cx: 62, cy: 68, r: 12 },
  { id: "bahu-kanan-belakang", label: "Bahu Kanan", shape: "circle", cx: 138, cy: 68, r: 12 },
  {
    id: "punggung-atas",
    label: "Punggung Atas",
    shape: "rect",
    x: 74,
    y: 60,
    width: 52,
    height: 44,
    rx: 10,
  },
  {
    id: "punggung-bawah",
    label: "Punggung Bawah / Pinggang",
    shape: "rect",
    x: 76,
    y: 104,
    width: 48,
    height: 42,
    rx: 8,
  },
  {
    id: "lengan-atas-kiri-b",
    label: "Lengan Atas Kiri",
    shape: "rect",
    x: 44,
    y: 78,
    width: 18,
    height: 52,
    rx: 8,
  },
  {
    id: "lengan-atas-kanan-b",
    label: "Lengan Atas Kanan",
    shape: "rect",
    x: 138,
    y: 78,
    width: 18,
    height: 52,
    rx: 8,
  },
  {
    id: "lengan-bawah-kiri-b",
    label: "Lengan Bawah Kiri",
    shape: "rect",
    x: 38,
    y: 130,
    width: 18,
    height: 50,
    rx: 8,
  },
  {
    id: "lengan-bawah-kanan-b",
    label: "Lengan Bawah Kanan",
    shape: "rect",
    x: 144,
    y: 130,
    width: 18,
    height: 50,
    rx: 8,
  },
  {
    id: "bokong",
    label: "Bokong / Panggul",
    shape: "rect",
    x: 74,
    y: 146,
    width: 52,
    height: 26,
    rx: 8,
  },
  {
    id: "paha-kiri-b",
    label: "Paha Belakang Kiri",
    shape: "rect",
    x: 72,
    y: 174,
    width: 24,
    height: 62,
    rx: 9,
  },
  {
    id: "paha-kanan-b",
    label: "Paha Belakang Kanan",
    shape: "rect",
    x: 104,
    y: 174,
    width: 24,
    height: 62,
    rx: 9,
  },
  { id: "lutut-kiri-b", label: "Belakang Lutut Kiri", shape: "circle", cx: 84, cy: 246, r: 11 },
  { id: "lutut-kanan-b", label: "Belakang Lutut Kanan", shape: "circle", cx: 116, cy: 246, r: 11 },
  {
    id: "betis-kiri-b",
    label: "Betis Kiri",
    shape: "rect",
    x: 73,
    y: 258,
    width: 22,
    height: 68,
    rx: 8,
  },
  {
    id: "betis-kanan-b",
    label: "Betis Kanan",
    shape: "rect",
    x: 105,
    y: 258,
    width: 22,
    height: 68,
    rx: 8,
  },
];

function BodySilhouette() {
  return (
    <path
      d="M100 8
         C110 8 117 15 117 25
         C117 33 113 39 108 42
         C118 45 128 50 133 60
         C138 70 138 78 138 90
         L142 128 C144 140 144 150 140 160
         L136 158 C134 148 132 140 130 132
         L126 146 C128 160 128 172 126 184
         L128 240 C130 260 130 280 128 326
         L112 326 C111 290 110 264 108 240
         L106 190 C104 176 102 168 100 160
         C98 168 96 176 94 190
         L92 240 C90 264 89 290 88 326
         L72 326 C70 280 70 260 72 240
         L74 184 C72 172 72 160 74 146
         L70 132 C68 140 66 148 64 158
         L60 160 C56 150 56 140 58 128
         L62 90 C62 78 62 70 67 60
         C72 50 82 45 92 42
         C87 39 83 33 83 25
         C83 15 90 8 100 8 Z"
      className="fill-[color:var(--color-clinic-blue-soft)] stroke-[color:var(--color-clinic-blue)]/30"
      strokeWidth={1.5}
    />
  );
}

function RegionShape({
  region,
  isActive,
  onSelect,
}: {
  region: BodyRegion;
  isActive: boolean;
  onSelect: () => void;
}) {
  const fill = isActive
    ? "fill-[color:var(--color-clinic-blue)]/70"
    : "fill-[color:var(--color-clinic-blue)]/0";
  const common = `cursor-pointer transition-colors duration-150 stroke-[color:var(--color-clinic-blue)] ${
    isActive
      ? "stroke-2 fill-[color:var(--color-clinic-blue)]/60"
      : "stroke-0 hover:fill-[color:var(--color-clinic-blue)]/30"
  }`;

  const handleClick = () => onSelect();

  if (region.shape === "circle" && region.cx != null && region.cy != null && region.r != null) {
    return (
      <circle
        cx={region.cx}
        cy={region.cy}
        r={region.r}
        className={common}
        onClick={handleClick}
        role="button"
        aria-label={region.label}
      >
        <title>{region.label}</title>
      </circle>
    );
  }

  if (region.shape === "ellipse" && region.cx != null && region.cy != null) {
    return (
      <ellipse
        cx={region.cx}
        cy={region.cy}
        rx={18}
        ry={22}
        className={common}
        onClick={handleClick}
        role="button"
        aria-label={region.label}
      >
        <title>{region.label}</title>
      </ellipse>
    );
  }

  if (
    region.shape === "rect" &&
    region.x != null &&
    region.y != null &&
    region.width != null &&
    region.height != null
  ) {
    return (
      <rect
        x={region.x}
        y={region.y}
        width={region.width}
        height={region.height}
        rx={region.rx ?? 6}
        className={common}
        onClick={handleClick}
        role="button"
        aria-label={region.label}
      >
        <title>{region.label}</title>
      </rect>
    );
  }

  return null;
}

export function BodyPainSelector({
  onSelectPart,
  selectedPartId,
}: {
  onSelectPart: (label: string) => void;
  selectedPartId: string | null;
}) {
  const [view, setView] = useState<"depan" | "belakang">("depan");
  const regions = view === "depan" ? FRONT_REGIONS : BACK_REGIONS;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="inline-flex rounded-full bg-[color:var(--color-clinic-blue-soft)] p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setView("depan")}
          className={`rounded-full px-3 py-1.5 transition ${
            view === "depan"
              ? "bg-white shadow-sm text-[color:var(--color-clinic-blue)]"
              : "text-[color:var(--color-clinic-muted)]"
          }`}
        >
          Tampak Depan
        </button>
        <button
          type="button"
          onClick={() => setView("belakang")}
          className={`rounded-full px-3 py-1.5 transition ${
            view === "belakang"
              ? "bg-white shadow-sm text-[color:var(--color-clinic-blue)]"
              : "text-[color:var(--color-clinic-muted)]"
          }`}
        >
          Tampak Belakang
        </button>
      </div>

      <svg viewBox="0 0 200 334" className="h-[320px] w-auto touch-manipulation select-none">
        <BodySilhouette />
        {regions.map((region) => (
          <RegionShape
            key={region.id}
            region={region}
            isActive={selectedPartId === region.id}
            onSelect={() => onSelectPart(region.label)}
          />
        ))}
      </svg>

      <p className="text-center text-xs text-[color:var(--color-clinic-muted)]">
        Ketuk bagian tubuh yang terasa sakit. Pilihan akan langsung dikirim ke chat AI.
      </p>
    </div>
  );
}

"use client";

import type { LegendItem } from "@/lib/types";

interface LegendProps {
  items: LegendItem[];
}

const shapeSymbol: Record<string, string> = {
  circle: "\u25CF",
  square: "\u25A0",
  star: "\u2605",
  triangle: "\u25B2",
  diamond: "\u25C6",
};

export default function Legend({ items }: LegendProps) {
  if (items.length === 0) return null;

  return (
    <div className="absolute bottom-6 left-4 z-[1000] bg-white/90 backdrop-blur rounded-lg shadow-lg p-3 text-sm">
      <h4 className="font-semibold mb-2 text-gray-800">Legend</h4>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.name} className="flex items-center gap-2">
            <span style={{ color: item.color }} className="text-lg leading-none">
              {shapeSymbol[item.shape] || shapeSymbol.circle}
            </span>
            <span className="text-gray-700">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface Pin {
  id: string;
  lat: number | null;
  lng: number | null;
  title: string;
  description: string;
  category: string;
  created_at: string;
  visitor_id: string;
  start_date: string | null;
  end_date: string | null;
  address: string | null;
}

export type PinType = "location-only" | "permanent-event" | "temporary-event";

export function getPinType(pin: Pin): PinType {
  if (!pin.start_date) return "location-only";
  if (!pin.end_date) return "permanent-event";
  return "temporary-event";
}

export function isPinVisibleOnMap(pin: Pin): boolean {
  if (pin.lat === null || pin.lng === null) return false;
  const type = getPinType(pin);
  if (type === "location-only" || type === "permanent-event") return true;
  return new Date(pin.end_date!) >= new Date();
}

export function isPinVisibleOnCalendar(pin: Pin): boolean {
  return pin.start_date !== null;
}

export interface LegendItem {
  name: string;
  color: string;
  shape: "circle" | "square" | "star" | "triangle" | "diamond";
}

export interface SiteConfig {
  id: string;
  site_name: string;
  theme: {
    primary_color: string;
    background_color: string;
    font: string;
    dark_mode: boolean;
  };
  legend: LegendItem[];
}

export interface PageView {
  id: string;
  timestamp: string;
  path: string;
  visitor_hash: string;
}

export interface SiteStats {
  total_pins: number;
  total_visitors: number;
  pins_today: number;
  visitors_today: number;
  pins_by_category: { category: string; count: number }[];
  recent_views: { date: string; count: number }[];
}

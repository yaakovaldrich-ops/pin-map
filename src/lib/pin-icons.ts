import L from "leaflet";

const shapeSvgs: Record<string, (color: string) => string> = {
  circle: (color) =>
    `<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${color}" stroke="#fff" stroke-width="2"/></svg>`,
  square: (color) =>
    `<svg width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3" fill="${color}" stroke="#fff" stroke-width="2"/></svg>`,
  star: (color) =>
    `<svg width="24" height="24" viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 16.5,14 18.5,22 12,17.5 5.5,22 7.5,14 2,9 9,9" fill="${color}" stroke="#fff" stroke-width="1.5"/></svg>`,
  triangle: (color) =>
    `<svg width="24" height="24" viewBox="0 0 24 24"><polygon points="12,2 22,22 2,22" fill="${color}" stroke="#fff" stroke-width="2"/></svg>`,
  diamond: (color) =>
    `<svg width="24" height="24" viewBox="0 0 24 24"><polygon points="12,1 23,12 12,23 1,12" fill="${color}" stroke="#fff" stroke-width="2"/></svg>`,
};

export function createPinIcon(color: string, shape: string): L.DivIcon {
  const svgFn = shapeSvgs[shape] || shapeSvgs.circle;
  return L.divIcon({
    html: svgFn(color),
    className: "custom-pin-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}

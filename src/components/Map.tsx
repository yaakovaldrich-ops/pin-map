"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Pin, LegendItem, SiteConfig } from "@/lib/types";
import { isPinVisibleOnMap } from "@/lib/types";
import { createPinIcon } from "@/lib/pin-icons";
import PinForm from "./PinForm";
import Legend from "./Legend";
import Navigation from "./Navigation";

function getVisitorId() {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("pin-map-visitor-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("pin-map-visitor-id", id);
  }
  return id;
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Map() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [newPinCoords, setNewPinCoords] = useState<{ lat: number; lng: number } | null>(null);

  const fetchPins = useCallback(async () => {
    const res = await fetch("/api/pins");
    if (res.ok) {
      const data: Pin[] = await res.json();
      setPins(data.filter(isPinVisibleOnMap));
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    const res = await fetch("/api/config");
    if (res.ok) setConfig(await res.json());
  }, []);

  useEffect(() => {
    fetchPins();
    fetchConfig();
    const visitorId = getVisitorId();
    fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/", visitor_hash: visitorId }),
    });
  }, [fetchPins, fetchConfig]);

  const handleMapClick = (lat: number, lng: number) => {
    setNewPinCoords({ lat, lng });
  };

  const handlePinSubmit = async (data: {
    title: string;
    description: string;
    category: string;
    start_date: string | null;
    end_date: string | null;
    address: string | null;
  }) => {
    if (!newPinCoords) return;
    await fetch("/api/pins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newPinCoords,
        ...data,
        visitor_id: getVisitorId(),
      }),
    });
    setNewPinCoords(null);
    fetchPins();
  };

  const legendItems: LegendItem[] = config?.legend || [{ name: "Default", color: "#3b82f6", shape: "circle" }];

  const getLegendItem = (category: string) =>
    legendItems.find((l) => l.name === category) || legendItems[0];

  return (
    <div className="relative w-full h-screen">
      <Navigation />
      <MapContainer center={[20, 0]} zoom={3} className="w-full h-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onMapClick={handleMapClick} />
        {pins.map((pin) => {
          const legend = getLegendItem(pin.category);
          return (
            <Marker key={pin.id} position={[pin.lat!, pin.lng!]} icon={createPinIcon(legend.color, legend.shape)}>
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-lg">{pin.title}</h3>
                  {pin.description && <p className="text-sm mt-1 text-gray-600">{pin.description}</p>}
                  {pin.start_date && (
                    <p className="text-xs mt-1 text-blue-600">
                      Event: {new Date(pin.start_date).toLocaleString()}
                      {pin.end_date && ` - ${new Date(pin.end_date).toLocaleString()}`}
                      {!pin.end_date && " (permanent)"}
                    </p>
                  )}
                  {pin.address && <p className="text-xs mt-1 text-gray-500">{pin.address}</p>}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: legend.color }}
                    />
                    <span>{pin.category}</span>
                    <span>&middot;</span>
                    <span>{new Date(pin.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <Legend items={legendItems} />

      {newPinCoords && (
        <PinForm
          legendItems={legendItems}
          onSubmit={handlePinSubmit}
          onCancel={() => setNewPinCoords(null)}
        />
      )}
    </div>
  );
}

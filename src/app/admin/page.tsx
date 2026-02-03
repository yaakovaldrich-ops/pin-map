"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteConfig, LegendItem, Pin, SiteStats } from "@/lib/types";

const SHAPES = ["circle", "square", "star", "triangle", "diamond"] as const;

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"legend" | "settings" | "pins" | "events" | "stats">("legend");

  const fetchAll = useCallback(async () => {
    const [configRes, pinsRes, statsRes] = await Promise.all([
      fetch("/api/config"),
      fetch("/api/pins?include_expired=true"),
      fetch("/api/stats"),
    ]);
    if (configRes.ok) setConfig(await configRes.json());
    if (pinsRes.ok) setPins(await pinsRes.json());
    if (statsRes.ok) setStats(await statsRes.json());
  }, []);

  useEffect(() => {
    if (authed) fetchAll();
  }, [authed, fetchAll]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      setAuthError("");
    } else {
      setAuthError("Invalid password");
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
  };

  const deletePin = async (id: string) => {
    await fetch("/api/pins", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPins((prev) => prev.filter((p) => p.id !== id));
  };

  const updateLegend = (index: number, field: keyof LegendItem, value: string) => {
    if (!config) return;
    const legend = [...config.legend];
    legend[index] = { ...legend[index], [field]: value };
    setConfig({ ...config, legend });
  };

  const addLegendItem = () => {
    if (!config) return;
    setConfig({
      ...config,
      legend: [...config.legend, { name: "New Category", color: "#6b7280", shape: "circle" }],
    });
  };

  const removeLegendItem = (index: number) => {
    if (!config) return;
    const legend = config.legend.filter((_, i) => i !== index);
    setConfig({ ...config, legend });
  };

  const locationPins = pins.filter((p) => !p.start_date);
  const eventPins = pins.filter((p) => p.start_date);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-80">
          <h1 className="text-xl font-bold mb-4">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 border rounded-md mb-3"
          />
          {authError && <p className="text-red-500 text-sm mb-3">{authError}</p>}
          <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="flex gap-1 mb-6 bg-gray-200 rounded-lg p-1">
          {(["legend", "settings", "pins", "events", "stats"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                tab === t ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "legend" && config && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Map Legend</h2>
            <div className="space-y-3">
              {config.legend.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                  <input type="text" value={item.name} onChange={(e) => updateLegend(i, "name", e.target.value)} className="flex-1 px-2 py-1 border rounded text-sm" placeholder="Category name" />
                  <input type="color" value={item.color} onChange={(e) => updateLegend(i, "color", e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
                  <select value={item.shape} onChange={(e) => updateLegend(i, "shape", e.target.value)} className="px-2 py-1 border rounded text-sm">
                    {SHAPES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                  <button onClick={() => removeLegendItem(i)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addLegendItem} className="px-4 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200">+ Add Category</button>
              <button onClick={saveConfig} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : "Save Legend"}</button>
            </div>
          </div>
        )}

        {tab === "settings" && config && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">Site Settings</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Name</label>
              <input type="text" value={config.site_name} onChange={(e) => setConfig({ ...config, site_name: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary Color</label>
              <input type="color" value={config.theme.primary_color} onChange={(e) => setConfig({ ...config, theme: { ...config.theme, primary_color: e.target.value } })} className="mt-1 w-12 h-8 rounded cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Background Color</label>
              <input type="color" value={config.theme.background_color} onChange={(e) => setConfig({ ...config, theme: { ...config.theme, background_color: e.target.value } })} className="mt-1 w-12 h-8 rounded cursor-pointer" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={config.theme.dark_mode} onChange={(e) => setConfig({ ...config, theme: { ...config.theme, dark_mode: e.target.checked } })} className="rounded" />
              <label className="text-sm font-medium text-gray-700">Dark Mode</label>
            </div>
            <button onClick={saveConfig} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : "Save Settings"}</button>
          </div>
        )}

        {tab === "pins" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Location Pins ({locationPins.length})</h2>
            {locationPins.length === 0 ? (
              <p className="text-gray-500 text-sm">No location-only pins yet.</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {locationPins.map((pin) => (
                  <div key={pin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium">{pin.title}</span>
                      <span className="text-gray-400 text-sm ml-2">{pin.category}</span>
                      {pin.lat != null && pin.lng != null && (
                        <span className="text-gray-400 text-xs ml-2">({pin.lat.toFixed(3)}, {pin.lng.toFixed(3)})</span>
                      )}
                    </div>
                    <button onClick={() => deletePin(pin.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "events" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Events ({eventPins.length})</h2>
            {eventPins.length === 0 ? (
              <p className="text-gray-500 text-sm">No events yet.</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {eventPins.map((pin) => {
                  const isPast = pin.end_date && new Date(pin.end_date) < new Date();
                  return (
                    <div key={pin.id} className={`flex items-center justify-between p-3 rounded-md ${isPast ? "bg-gray-100 opacity-60" : "bg-gray-50"}`}>
                      <div>
                        <span className="font-medium">{pin.title}</span>
                        <span className="text-gray-400 text-sm ml-2">{pin.category}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(pin.start_date!).toLocaleString()}
                          {pin.end_date ? ` - ${new Date(pin.end_date).toLocaleString()}` : " (permanent)"}
                        </div>
                        {pin.address && <div className="text-xs text-gray-400">{pin.address}</div>}
                        {isPast && <span className="text-xs text-red-400">Expired</span>}
                      </div>
                      <button onClick={() => deletePin(pin.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "stats" && stats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total_pins}</div>
                <div className="text-xs text-gray-500">Total Pins/Events</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.total_visitors}</div>
                <div className="text-xs text-gray-500">Total Visitors</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.pins_today}</div>
                <div className="text-xs text-gray-500">Created Today</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.visitors_today}</div>
                <div className="text-xs text-gray-500">Visitors Today</div>
              </div>
            </div>
            {stats.pins_by_category.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">By Category</h3>
                <div className="space-y-1">
                  {stats.pins_by_category.map((c) => (
                    <div key={c.category} className="flex items-center gap-2 text-sm">
                      <span className="w-24 text-gray-600">{c.category}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4">
                        <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${Math.min(100, (c.count / stats.total_pins) * 100)}%` }} />
                      </div>
                      <span className="text-gray-500 w-8 text-right">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {stats.recent_views.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Page Views (Last 7 Days)</h3>
                <div className="flex items-end gap-1 h-32">
                  {stats.recent_views.map((v) => {
                    const max = Math.max(...stats.recent_views.map((r) => r.count), 1);
                    return (
                      <div key={v.date} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500">{v.count}</span>
                        <div className="w-full bg-blue-400 rounded-t" style={{ height: `${(v.count / max) * 100}%`, minHeight: v.count > 0 ? "4px" : "0" }} />
                        <span className="text-[10px] text-gray-400">{v.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

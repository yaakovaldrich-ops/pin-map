"use client";

import { useState, useEffect, useCallback } from "react";
import type { Pin, LegendItem, SiteConfig } from "@/lib/types";

interface CalendarEvent extends Pin {
  is_past: boolean;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState<string>("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchEvents = useCallback(async () => {
    const res = await fetch(`/api/events?year=${year}&month=${month + 1}`);
    if (res.ok) setEvents(await res.json());
  }, [year, month]);

  const fetchConfig = useCallback(async () => {
    const res = await fetch("/api/config");
    if (res.ok) setConfig(await res.json());
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchConfig();
  }, [fetchEvents, fetchConfig]);

  const legendItems: LegendItem[] = config?.legend || [{ name: "Default", color: "#3b82f6", shape: "circle" }];

  const getLegendColor = (category: string) =>
    legendItems.find((l) => l.name === category)?.color || "#3b82f6";

  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.start_date?.startsWith(dateStr));
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T12:00`;
    setFormDate(dateStr);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;
    const address = formData.get("address") as string;
    const permanent = formData.get("permanent") === "on";

    if (!title.trim() || !start_date) return;

    let visitorId = localStorage.getItem("pin-map-visitor-id");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("pin-map-visitor-id", visitorId);
    }

    await fetch("/api/pins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        category,
        start_date: new Date(start_date).toISOString(),
        end_date: permanent || !end_date ? null : new Date(end_date).toISOString(),
        address: address.trim() || null,
        lat: null,
        lng: null,
        visitor_id: visitorId,
      }),
    });

    setShowForm(false);
    fetchEvents();
  };

  return (
    <div className="max-w-5xl mx-auto p-6 pt-20 text-black">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {monthName} {year}
        </h1>
        <div className="flex gap-2">
          <button onClick={goToPreviousMonth} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm">
            Previous
          </button>
          <button onClick={goToToday} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
            Today
          </button>
          <button onClick={goToNextMonth} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm">
            Next
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center font-semibold text-black p-2 text-sm">
            {d}
          </div>
        ))}
        {calendarDays.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} className="bg-gray-50 h-28 rounded" />;
          const dayEvents = getEventsForDay(day);
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className={`bg-white border rounded p-2 h-28 overflow-hidden hover:shadow-md transition cursor-pointer ${
                isToday ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <div className={`text-sm font-semibold mb-1 ${isToday ? "text-blue-600" : "text-black"}`}>{day}</div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(ev);
                    }}
                    className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer ${
                      ev.is_past ? "bg-gray-200 text-gray-400 line-through" : ""
                    }`}
                    style={ev.is_past ? {} : { backgroundColor: getLegendColor(ev.category) + "20", color: getLegendColor(ev.category) }}
                  >
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-400">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2">{selectedEvent.title}</h2>
            {selectedEvent.description && <p className="text-gray-600 mb-4">{selectedEvent.description}</p>}
            <div className="space-y-2 text-sm">
              <div>
                <strong>Category:</strong>{" "}
                <span style={{ color: getLegendColor(selectedEvent.category) }}>{selectedEvent.category}</span>
              </div>
              <div>
                <strong>Start:</strong> {new Date(selectedEvent.start_date!).toLocaleString()}
              </div>
              {selectedEvent.end_date && (
                <div>
                  <strong>End:</strong> {new Date(selectedEvent.end_date).toLocaleString()}
                </div>
              )}
              {!selectedEvent.end_date && (
                <div className="text-blue-600 text-xs font-medium">Permanent event</div>
              )}
              {selectedEvent.address && (
                <div>
                  <strong>Location:</strong> {selectedEvent.address}
                </div>
              )}
              {selectedEvent.is_past && (
                <div className="text-gray-400 italic text-xs">This event has ended.</div>
              )}
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* New Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Add Event</h2>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input name="title" type="text" required className="mt-1 w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" rows={2} className="mt-1 w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select name="category" className="mt-1 w-full px-3 py-2 border rounded-md text-sm">
                  {legendItems.map((item) => (
                    <option key={item.name} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date/Time *</label>
                <input name="start_date" type="datetime-local" defaultValue={formDate} required className="mt-1 w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <input name="permanent" type="checkbox" className="rounded" />
                <label className="text-sm text-gray-700">Permanent (no end date)</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date/Time</label>
                <input name="end_date" type="datetime-local" className="mt-1 w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address (optional - adds to map)</label>
                <input name="address" type="text" placeholder="123 Main St, City" className="mt-1 w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700">
                  Add Event
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm hover:bg-gray-200">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

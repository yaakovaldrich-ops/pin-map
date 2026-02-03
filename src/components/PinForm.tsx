"use client";

import { useState } from "react";
import type { LegendItem } from "@/lib/types";

interface PinFormData {
  title: string;
  description: string;
  category: string;
  start_date: string | null;
  end_date: string | null;
  address: string | null;
}

interface PinFormProps {
  legendItems: LegendItem[];
  onSubmit: (data: PinFormData) => void;
  onCancel: () => void;
}

export default function PinForm({ legendItems, onSubmit, onCancel }: PinFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(legendItems[0]?.name || "Default");
  const [isEvent, setIsEvent] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      start_date: isEvent && startDate ? new Date(startDate).toISOString() : null,
      end_date: isEvent && !isPermanent && endDate ? new Date(endDate).toISOString() : null,
      address: address.trim() || null,
    });
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 w-80 max-h-[90vh] overflow-y-auto">
      <h3 className="font-bold text-lg mb-3">Drop a Pin</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Name this pin"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add details..."
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {legendItems.map((item) => (
              <option key={item.name} value={item.name}>{item.name}</option>
            ))}
          </select>
        </div>

        {/* Event toggle */}
        <div className="flex items-center gap-2 pt-1 border-t">
          <input
            type="checkbox"
            checked={isEvent}
            onChange={(e) => setIsEvent(e.target.checked)}
            className="rounded"
          />
          <label className="text-sm font-medium text-gray-700">This is an event (add to calendar)</label>
        </div>

        {isEvent && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date/Time *</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required={isEvent}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPermanent}
                onChange={(e) => setIsPermanent(e.target.checked)}
                className="rounded"
              />
              <label className="text-sm text-gray-700">Permanent (no end date)</label>
            </div>
            {!isPermanent && (
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date/Time</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="123 Main St, City"
              />
            </div>
          </>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition"
          >
            {isEvent ? "Add Event" : "Add Pin"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

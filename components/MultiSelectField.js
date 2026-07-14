"use client";

import { useMemo, useState } from "react";

export default function MultiSelectField({
  label,
  values = [],
  onChange,
  suggestions = [],
  placeholder = "أضف قيمة ثم Enter",
  hint = ""
}) {
  const [draft, setDraft] = useState("");
  const selected = useMemo(
    () => (Array.isArray(values) ? values.map((v) => String(v).trim()).filter(Boolean) : []),
    [values]
  );

  function addValue(raw) {
    const next = String(raw || "").trim();
    if (!next) return;
    if (selected.some((v) => v.toLowerCase() === next.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...selected, next]);
    setDraft("");
  }

  function removeValue(value) {
    onChange(selected.filter((v) => v !== value));
  }

  function toggleSuggestion(value) {
    if (selected.includes(value)) removeValue(value);
    else onChange([...selected, value]);
  }

  return (
    <div className="flex flex-col gap-2 text-sm font-semibold text-gray-700 md:col-span-2">
      <span>{label}</span>
      {hint && <p className="text-xs font-normal text-gray-500">{hint}</p>}

      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => {
          const active = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggleSuggestion(item)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                active
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-gray-700 border-gray-200 hover:border-brand/40"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {selected.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-xs"
          >
            {item}
            <button
              type="button"
              onClick={() => removeValue(item)}
              className="text-gray-400 hover:text-red-600 font-bold"
              aria-label={`حذف ${item}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <input
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addValue(draft);
          }
        }}
        onBlur={() => addValue(draft)}
        placeholder={placeholder}
      />
    </div>
  );
}

export { KNOWN_BRANDS, KNOWN_CATEGORIES } from "../lib/productFields";

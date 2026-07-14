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
    <div className="flex flex-col gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
      <span>{label}</span>
      {hint && <p className="text-xs font-normal text-slate-500">{hint}</p>}

      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => {
          const active = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggleSuggestion(item)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                active
                  ? "bg-brand text-white border-brand shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-brand/40 hover:bg-slate-50"
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
            className="inline-flex items-center gap-1 bg-brand/10 text-brand rounded-lg px-2.5 py-1 text-xs font-bold"
          >
            {item}
            <button
              type="button"
              onClick={() => removeValue(item)}
              className="text-brand/60 hover:text-rose-600 font-bold leading-none"
              aria-label={`حذف ${item}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <input
        className="admin-input"
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

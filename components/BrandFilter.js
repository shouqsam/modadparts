"use client";

export default function BrandFilter({ brands, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onChange("الكل")}
        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition ${
          active === "الكل" ? "bg-brand text-white" : "bg-white text-gray-700 border border-gray-200"
        }`}
      >
        الكل
      </button>
      {brands.map((brand) => (
        <button
          key={brand}
          onClick={() => onChange(brand)}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition ${
            active === brand ? "bg-brand text-white" : "bg-white text-gray-700 border border-gray-200"
          }`}
        >
          {brand}
        </button>
      ))}
    </div>
  );
}

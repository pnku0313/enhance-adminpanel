import React from "react";

export default function ColorPalette({
  color,
  onChange,
  colors = [],
  className = "",
  swatchSize = 28,
  swatchGap = 6,
}) {
  const selectedColor = /^#[0-9a-f]{6}$/i.test(color || "")
    ? color
    : "#000000";

  return (
    <div className={`min-w-0 ${className}`}>
      <div
        className="flex flex-wrap items-center"
        style={{ gap: swatchGap }}
      >
        {colors.map((hex) => {
          const selected =
            hex.toLowerCase() === (color || "").toLowerCase();

          return (
            <button
              key={hex}
              type="button"
              title={hex}
              aria-label={`Select color ${hex}`}
              aria-pressed={selected}
              onClick={() => onChange({ hex })}
              className="
                shrink-0 rounded-lg border border-black/15
                transition-transform hover:scale-110
                focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-primary
                focus-visible:ring-offset-2
                focus-visible:ring-offset-background
              "
              style={{
                width: swatchSize,
                height: swatchSize,
                backgroundColor: hex,
                outline: selected
                  ? "2px solid hsl(var(--primary))"
                  : undefined,
                outlineOffset: selected ? 2 : undefined,
              }}
            />
          );
        })}
      </div>

      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onChange({ hex: e.target.value })}
          className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
          aria-label="Choose a custom color"
        />
        <span>Custom color</span>
      </label>
    </div>
  );
}
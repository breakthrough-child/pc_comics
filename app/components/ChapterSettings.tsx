"use client";

import { CoinIcon } from "./StoryContent";

export type ChapterSettingsValue = {
  title: string;
  isFree: boolean;
  price: string;
};

/**
 * Returns an error message, or null when the settings are valid.
 */
export function validateChapterSettings(value: ChapterSettingsValue) {
  if (value.isFree) return null;

  const price = Number(value.price);

  if (!Number.isInteger(price) || price <= 0) {
    return "Enter a coin price (a whole number above 0) or mark the chapter as free";
  }

  return null;
}

export default function ChapterSettings({
  value,
  onChange,
  number,
}: {
  value: ChapterSettingsValue;
  onChange: (value: ChapterSettingsValue) => void;
  number?: number;
}) {
  const option = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "12px 14px",
    borderRadius: 12,
    cursor: "pointer",
    textAlign: "left",
    border: active ? "2px solid var(--primary)" : "1px solid var(--input-border)",
    background: active ? "rgba(255,77,166,0.08)" : "var(--input-bg)",
    color: "var(--text)",
    font: "inherit",
  });

  return (
    <div
      style={{
        display: "grid",
        gap: 14,
        padding: 16,
        borderRadius: 14,
        border: "1px solid var(--surface-border)",
        background: "rgba(128,128,128,0.05)",
      }}
    >
      <div>
        <label className="pc-label">
          Chapter {number ? `${number} ` : ""}title
        </label>
        <input
          className="pc-input"
          placeholder={number ? `Chapter ${number}` : "Chapter title"}
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </div>

      <div>
        <label className="pc-label">Access</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            style={option(value.isFree)}
            onClick={() => onChange({ ...value, isFree: true })}
          >
            <b>Free</b>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Anyone can read it</div>
          </button>

          <button
            type="button"
            style={option(!value.isFree)}
            onClick={() => onChange({ ...value, isFree: false })}
          >
            <b>Paid</b>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Readers unlock it with coins</div>
          </button>
        </div>
      </div>

      {!value.isFree && (
        <div>
          <label className="pc-label">Price in coins</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
              <CoinIcon size={18} />
            </span>
            <input
              className="pc-input"
              inputMode="numeric"
              placeholder="e.g. 10"
              value={value.price}
              onChange={(e) =>
                onChange({ ...value, price: e.target.value.replace(/[^0-9]/g, "") })
              }
              style={{ paddingLeft: 38 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

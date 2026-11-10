"use client";

import { useEffect, useState } from "react";

type CountData = { show: boolean; label?: string; count?: number };

/**
 * Public reader counter. Shows nothing unless the admin has switched it
 * on in Admin → Visitors.
 */
export default function ReaderCount({ style }: { style?: React.CSSProperties }) {
  const [data, setData] = useState<CountData | null>(null);

  useEffect(() => {
    fetch("/api/reader-count", { cache: "no-store" })
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data?.show || !data.count) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 14px 7px 10px",
        borderRadius: 999,
        background: "var(--surface)",
        border: "1px solid var(--surface-border)",
        fontSize: 14,
        fontWeight: 700,
        color: "var(--text)",
        ...style,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#00c48c",
          boxShadow: "0 0 0 4px rgba(0,196,140,0.18)",
        }}
      />
      <span>
        <b style={{ fontVariantNumeric: "tabular-nums" }}>
          {data.count.toLocaleString()}
        </b>{" "}
        {data.label || "readers"}
      </span>
    </div>
  );
}

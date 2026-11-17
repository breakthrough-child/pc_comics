"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Totals = { visitors: number; views: number };

type Stats = {
  days: number;
  totals: {
    today: Totals;
    yesterday: Totals;
    last7: Totals;
    last30: Totals;
    allTime: Totals;
  };
  onlineNow: number;
  series: { day: string; visitors: number; views: number }[];
  pages: { path: string; label: string; visitors: number; views: number }[];
  sources: { source: string; visitors: number }[];
  settings: { showReaderCount: boolean; readerCountLabel: string };
};

const RANGES = [7, 30, 90];

function formatDay(day: string, long = false) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString(undefined, {
    weekday: long ? "short" : undefined,
    day: "numeric",
    month: "short",
  });
}

export default function VisitorsPage() {
  const router = useRouter();

  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const [showReaderCount, setShowReaderCount] = useState(false);
  const [label, setLabel] = useState("readers");
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState("");
  const [origin, setOrigin] = useState("");

  const load = useCallback(
    async (range: number) => {
      try {
        const res = await fetch(`/api/admin/visitors?days=${range}`, {
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 403) {
          router.push("/comics");
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load visitor stats");
          return;
        }

        setStats(data);
        setError("");
        setShowReaderCount(data.settings.showReaderCount);
        setLabel(data.settings.readerCountLabel);
      } catch {
        setError("Failed to load visitor stats");
      }
    },
    [router]
  );

  useEffect(() => {
    load(days);
  }, [days, load]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function saveSettings(nextShow: boolean, nextLabel: string) {
    setSaving(true);
    setSavedNote("");

    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showReaderCount: nextShow,
          readerCountLabel: nextLabel,
        }),
      });

      if (!res.ok) {
        setSavedNote("Could not save. Please try again.");
        return;
      }

      setShowReaderCount(nextShow);
      setSavedNote(
        nextShow
          ? "The reader counter is now visible on the site."
          : "The reader counter is now hidden."
      );
    } finally {
      setSaving(false);
    }
  }

  if (error && !stats) {
    return (
      <div className="pc-page">
        <p style={{ color: "#ff5a5a" }}>{error}</p>
        <button className="pc-btn" onClick={() => load(days)}>
          Try again
        </button>
      </div>
    );
  }

  if (!stats) {
    return <div className="pc-page">Loading visitor stats...</div>;
  }

  const { totals } = stats;
  const max = Math.max(1, ...stats.series.map((d) => d.visitors));
  const rangeViews = stats.series.reduce((sum, d) => sum + d.views, 0);
  const topSource = Math.max(1, ...stats.sources.map((s) => s.visitors));
  const topPage = Math.max(1, ...stats.pages.map((p) => p.visitors));
  const todayChange = totals.today.visitors - totals.yesterday.visitors;
  const active = hovered !== null ? stats.series[hovered] : null;

  return (
    <div className="pc-page" style={{ maxWidth: 1080 }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 className="page-hero-title">Visitors</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            People visiting the site. Your own visits as admin are not counted.
          </p>
        </div>

        <span className="pc-chip pc-chip-free" style={{ fontSize: 13, padding: "6px 12px" }}>
          <span
            aria-hidden
            style={{ width: 8, height: 8, borderRadius: "50%", background: "#00c48c" }}
          />
          {stats.onlineNow} on the site now
        </span>
      </div>

      {/* HEADLINE NUMBERS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <StatTile
          title="Today"
          value={totals.today.visitors}
          views={totals.today.views}
          note={
            todayChange === 0
              ? "Same as yesterday"
              : `${todayChange > 0 ? "▲" : "▼"} ${Math.abs(todayChange)} vs yesterday (${totals.yesterday.visitors})`
          }
          noteTone={todayChange > 0 ? "up" : todayChange < 0 ? "down" : undefined}
        />
        <StatTile title="Last 7 days" value={totals.last7.visitors} views={totals.last7.views} />
        <StatTile title="Last 30 days" value={totals.last30.visitors} views={totals.last30.views} />
        <StatTile title="All time" value={totals.allTime.visitors} views={totals.allTime.views} />
      </div>

      {/* DAILY CHART */}
      <section className="pc-card" style={{ padding: "18px 18px 14px", marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <div>
            <h2 style={{ fontSize: 17, margin: 0 }}>Visitors per day</h2>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
              {rangeViews.toLocaleString()} page views in the last {stats.days} days
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {RANGES.map((range) => (
              <button
                key={range}
                type="button"
                className={`pc-btn ${days === range ? "" : "pc-btn-ghost"}`}
                style={{ padding: "7px 12px", fontSize: 13 }}
                onClick={() => setDays(range)}
              >
                {range} days
              </button>
            ))}
            <button
              type="button"
              className="pc-btn pc-btn-ghost"
              style={{ padding: "7px 12px", fontSize: 13 }}
              onClick={() => setShowTable((v) => !v)}
            >
              {showTable ? "Show chart" : "Show table"}
            </button>
          </div>
        </div>

        {showTable ? (
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                  <th style={cell}>Day</th>
                  <th style={{ ...cell, textAlign: "right" }}>Visitors</th>
                  <th style={{ ...cell, textAlign: "right" }}>Page views</th>
                </tr>
              </thead>
              <tbody>
                {[...stats.series].reverse().map((d) => (
                  <tr key={d.day} style={{ borderTop: "1px solid rgba(128,128,128,0.15)" }}>
                    <td style={cell}>{formatDay(d.day, true)}</td>
                    <td style={{ ...cell, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      {d.visitors.toLocaleString()}
                    </td>
                    <td style={{ ...cell, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      {d.views.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            {/* Tooltip */}
            <div
              aria-live="polite"
              style={{
                height: 40,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                color: "var(--muted)",
              }}
            >
              {active ? (
                <span>
                  <b style={{ color: "var(--text)" }}>{formatDay(active.day, true)}</b>
                  {" · "}
                  <b style={{ color: "var(--text)" }}>{active.visitors.toLocaleString()}</b> visitors
                  {" · "}
                  {active.views.toLocaleString()} page views
                </span>
              ) : (
                <span>Hover or tap a bar to see that day</span>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {/* Y axis */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: 200,
                  fontSize: 11,
                  color: "var(--muted)",
                  textAlign: "right",
                  minWidth: 22,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span>{max.toLocaleString()}</span>
                <span>{Math.round(max / 2).toLocaleString()}</span>
                <span>0</span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    height: 200,
                    display: "flex",
                    alignItems: "flex-end",
                    gap: stats.days > 30 ? 1 : 2,
                    borderBottom: "1px solid rgba(128,128,128,0.35)",
                    backgroundImage:
                      "linear-gradient(rgba(128,128,128,0.12) 1px, transparent 1px)",
                    backgroundSize: "100% 50%",
                  }}
                >
                  {stats.series.map((d, i) => (
                    <button
                      key={d.day}
                      type="button"
                      aria-label={`${formatDay(d.day, true)}: ${d.visitors} visitors, ${d.views} page views`}
                      onMouseEnter={() => setHovered(i)}
                      onFocus={() => setHovered(i)}
                      onClick={() => setHovered(i)}
                      style={{
                        flex: 1,
                        height: "100%",
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        display: "flex",
                        alignItems: "flex-end",
                        cursor: "pointer",
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          width: "100%",
                          height: d.visitors ? `${Math.max(2, (d.visitors / max) * 100)}%` : 0,
                          borderRadius: "4px 4px 0 0",
                          background: "var(--primary)",
                          opacity: hovered === null || hovered === i ? 1 : 0.45,
                          transition: "opacity 0.15s ease",
                        }}
                      />
                    </button>
                  ))}
                </div>

                {/* X axis */}
                {stats.days <= 7 ? (
                  <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
                    {stats.series.map((d) => (
                      <span key={d.day} style={{ ...axisLabel, flex: 1, minWidth: 0, textAlign: "center" }}>
                        {formatDay(d.day)}
                      </span>
                    ))}
                  </div>
                ) : (
                  // Longer ranges: first, middle and last day, kept inside the card.
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    {[0, Math.floor((stats.series.length - 1) / 2), stats.series.length - 1].map((i) => (
                      <span key={i} style={axisLabel}>
                        {formatDay(stats.series[i].day)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SOURCES + PAGES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <section className="pc-card" style={{ padding: 18 }}>
          <h2 style={{ fontSize: 17, margin: "0 0 4px" }}>Where visitors come from</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 14px" }}>
            Unique visitors, last {stats.days} days
          </p>

          {stats.sources.length === 0 && <Empty />}

          {stats.sources.map((s) => (
            <RankRow key={s.source} label={s.source} value={s.visitors} max={topSource} />
          ))}
        </section>

        <section className="pc-card" style={{ padding: 18 }}>
          <h2 style={{ fontSize: 17, margin: "0 0 4px" }}>Most visited pages</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 14px" }}>
            Unique visitors, last {stats.days} days
          </p>

          {stats.pages.length === 0 && <Empty />}

          {stats.pages.map((p) => (
            <RankRow
              key={p.path}
              label={p.label}
              value={p.visitors}
              max={topPage}
              hint={`${p.views.toLocaleString()} views`}
            />
          ))}
        </section>
      </div>

      {/* PUBLIC COUNTER */}
      <section className="pc-card" style={{ padding: 18, marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 280px" }}>
            <h2 style={{ fontSize: 17, margin: "0 0 4px" }}>Public reader counter</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
              Show the all-time number of readers on the Comics and Stories pages. It stays
              hidden until you switch it on, and you can hide it again at any time.
            </p>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 700,
              cursor: saving ? "wait" : "pointer",
            }}
          >
            <span>{showReaderCount ? "Visible" : "Hidden"}</span>
            <span
              style={{
                position: "relative",
                width: 50,
                height: 28,
                borderRadius: 999,
                background: showReaderCount ? "#00c48c" : "rgba(128,128,128,0.35)",
                transition: "background 0.2s ease",
              }}
            >
              <input
                type="checkbox"
                role="switch"
                checked={showReaderCount}
                disabled={saving}
                onChange={(e) => saveSettings(e.target.checked, label)}
                style={{ position: "absolute", inset: 0, opacity: 0, margin: 0, cursor: "inherit" }}
              />
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: showReaderCount ? 25 : 3,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  transition: "left 0.2s ease",
                  pointerEvents: "none",
                }}
              />
            </span>
          </label>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-end",
            flexWrap: "wrap",
            marginTop: 16,
          }}
        >
          <div style={{ flex: "1 1 200px" }}>
            <label className="pc-label">Word shown after the number</label>
            <input
              className="pc-input"
              value={label}
              maxLength={40}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="readers"
            />
          </div>
          <button
            type="button"
            className="pc-btn"
            disabled={saving}
            onClick={() => saveSettings(showReaderCount, label)}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <div style={{ marginTop: 14, fontSize: 13, color: "var(--muted)" }}>
          Preview:{" "}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 12px 5px 9px",
              borderRadius: 999,
              border: "1px solid var(--surface-border)",
              color: "var(--text)",
              fontWeight: 700,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00c48c" }} />
            {totals.allTime.visitors.toLocaleString()} {label.trim() || "readers"}
          </span>
        </div>

        {savedNote && (
          <p style={{ fontSize: 13, margin: "10px 0 0", fontWeight: 600 }}>{savedNote}</p>
        )}
      </section>

      {/* AD LINK TIP */}
      <section className="pc-card" style={{ padding: 18 }}>
        <h2 style={{ fontSize: 17, margin: "0 0 6px" }}>Tracking an ad</h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 10px" }}>
          Add a tag to the end of the link you use in an ad, and visitors from that ad will
          show up under that name in “Where visitors come from”. For example:
        </p>
        <code
          style={{
            display: "block",
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(128,128,128,0.12)",
            fontSize: 13,
            overflowWrap: "anywhere",
          }}
        >
          {origin || "https://yoursite.com"}/comics?utm_source=instagram_ad
        </code>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "10px 0 0" }}>
          Use a different name for each ad (for example <b>facebook_nov</b>,{" "}
          <b>whatsapp_status</b>) to compare which one brings more readers.
        </p>
      </section>
    </div>
  );
}

const cell: React.CSSProperties = { padding: "8px 6px" };

const axisLabel: React.CSSProperties = {
  fontSize: 11,
  color: "var(--muted)",
  whiteSpace: "nowrap",
};

function StatTile({
  title,
  value,
  views,
  note,
  noteTone,
}: {
  title: string;
  value: number;
  views: number;
  note?: string;
  noteTone?: "up" | "down";
}) {
  return (
    <div className="pc-card" style={{ padding: 16 }}>
      <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{title}</div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 900,
          lineHeight: 1.15,
          marginTop: 4,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value.toLocaleString()}
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)" }}>
        visitors · {views.toLocaleString()} page views
      </div>
      {note && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            marginTop: 6,
            color: noteTone === "up" ? "#00a676" : noteTone === "down" ? "#e6338c" : "var(--muted)",
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
}

function RankRow({
  label,
  value,
  max,
  hint,
}: {
  label: string;
  value: number;
  max: number;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          fontSize: 14,
          marginBottom: 5,
        }}
      >
        <span
          style={{
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={label}
        >
          {label}
        </span>
        <span style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
          <b>{value.toLocaleString()}</b>
          {hint && <span style={{ color: "var(--muted)", fontSize: 12 }}> · {hint}</span>}
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "rgba(128,128,128,0.14)" }}>
        <div
          style={{
            width: `${Math.max(3, (value / max) * 100)}%`,
            height: "100%",
            borderRadius: 999,
            background: "var(--primary)",
          }}
        />
      </div>
    </div>
  );
}

function Empty() {
  return (
    <p style={{ fontSize: 14, color: "var(--muted)", margin: "6px 0" }}>
      No visits recorded yet. Numbers appear here as people visit the site.
    </p>
  );
}

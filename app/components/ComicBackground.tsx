"use client";

export default function ComicBackground() {
  return (
    <>
      {/* BASE GRADIENT */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background:
            "var(--bg)",// "radial-gradient(circle at 20% 20%, #ffc1cc, #ff007f 70%)",
        }}
        data-theme-bg
      />

      {/* HALFTONE DOTS */}
      <div
  style={{
    position: "fixed",
    inset: 0,
    zIndex: -2,
    backgroundImage:
      "radial-gradient(circle, rgba(0,0,0,0.35) 2px, transparent 2px)",
    backgroundSize: "16px 16px",
    pointerEvents: "none",
  }}
/>

      {/* BURST LINES */}
      <div
  style={{
    position: "fixed",
    inset: 0,
    zIndex: -3,
    background: "var(--bg)",
  }}
/>
    </>
  );
}
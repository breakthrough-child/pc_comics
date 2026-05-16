"use client";

import { useEffect, useState } from "react";

type Comic = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

export default function LibraryPage() {
  const [comics, setComics] = useState<Comic[]>([]);

  useEffect(() => {
      fetch("/api/library", {
        credentials: "include",
      })
        .then(async (res) => {
          if (!res.ok) return [];
          return res.json();
        })
        .then(setComics)
        .catch(() => setComics([]));
    }, []);

  return (
  <div
    style={{
      minHeight: "100vh",
      padding: "40px 50px",
      background: "transparent",
      color: "var(--text)",
      fontFamily: "system-ui, sans-serif",
    }}
  >
    {/* HEADER */}
    <div style={{ marginBottom: 30 }}>
      <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1 }}>
        📚 My Library
      </h1>
      <p style={{ opacity: 0.6 }}>
        Your purchased comics collection
      </p>
    </div>

    {/* EMPTY STATE */}
    {comics.length === 0 ? (
      <p style={{ opacity: 0.7 }}>No purchases yet.</p>
    ) : (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        

  {comics.map((comic) => (
  <div
    key={comic.id}
    className="comics-card"
    style={{
      position: "relative",
      borderRadius: 16,
      overflow: "hidden",
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
      transition: "transform 0.25s ease, box-shadow 0.25s ease",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
    }}
    onMouseEnter={(e) => {
      if (window.innerWidth > 768) {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.5)";
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.25)";
    }}
  >
    {/* IMAGE */}
    <div style={{ position: "relative" }}>
      <img
        src={comic.imageUrl}
        style={{
          width: "100%",
          height: 260,
          objectFit: "cover",
        }}
      />
    </div>

    {/* CONTENT */}
    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
      
      <h2
        style={{
          fontSize: 16,
          margin: 0,
          fontWeight: 600,
          lineHeight: 1.3,
        }}
      >
        {comic.title}
      </h2>

      <p
        style={{
          fontSize: 13,
          opacity: 0.85,
          lineHeight: 1.4,
          maxHeight: 40,
          overflow: "hidden",
        }}
      >
        {comic.description}
      </p>

      {/* BUTTONS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginTop: 6,
        }}
      >
          <a href={`/read/${comic.id}`}>
            <button
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(90deg, #ff4da6, #ff85c1)",
                color: "#fff",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Read
            </button>
          </a>
      </div>
    </div>
  </div>
))}
      </div>
    )}
  </div>
);
}
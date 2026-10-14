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
  <div className="pc-page" style={{ minHeight: "100vh" }}>
    {/* HEADER */}
    <div style={{ marginBottom: 30 }}>
      <h1 className="page-hero-title">
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
      <div className="book-grid">
        {comics.map((comic) => (
          <a
            key={comic.id}
            href={`/read/${comic.id}`}
            className="book-card"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <div className="book-cover">
              <img src={comic.imageUrl} alt={comic.title} loading="lazy" />
            </div>

            <div className="book-body">
              <h2 className="book-title">{comic.title}</h2>
              <p className="book-desc">{comic.description}</p>
              <div className="book-actions">
                <span className="pc-btn">Read</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    )}
  </div>
);
}
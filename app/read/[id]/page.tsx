"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import CommentsSection from "../../components/CommentsSection";

type ComicContent = {
  title?: string;
  pages: string[];
};

type WidthMode = "fit" | "wide";

const WIDTHS: Record<WidthMode, number> = { fit: 820, wide: 1200 };
const PREFS_KEY = "comicReader:prefs";

function positionKey(id: string) {
  return `comicReader:${id}:page`;
}

export default function ReadComicPage() {
  const { id } = useParams() as { id: string };

  const [content, setContent] = useState<ComicContent | null>(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [uiHidden, setUiHidden] = useState(false);
  const [widthMode, setWidthMode] = useState<WidthMode>("fit");
  const [gaps, setGaps] = useState(false);
  const [resumePage, setResumePage] = useState<number | null>(null);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastScroll = useRef(0);

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`/api/comics/${id}/content`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Access denied");
          return;
        }

        setContent(data);
      } catch {
        setError("Failed to load comic");
      }
    }

    if (id) fetchContent();
  }, [id]);

  // Restore reader preferences and the last page read.
  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
      if (prefs.widthMode === "wide" || prefs.widthMode === "fit") setWidthMode(prefs.widthMode);
      if (typeof prefs.gaps === "boolean") setGaps(prefs.gaps);

      const saved = Number(localStorage.getItem(positionKey(id)));
      if (saved > 1) setResumePage(saved);
    } catch {}
  }, [id]);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ widthMode, gaps }));
    } catch {}
  }, [widthMode, gaps]);

  useEffect(() => {
    if (!content) return;
    try {
      localStorage.setItem(positionKey(id), String(current));
    } catch {}
  }, [current, content, id]);

  // Track which page is in view.
  useEffect(() => {
    if (!content?.pages.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setCurrent(Number((entry.target as HTMLElement).dataset.index));
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );

    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [content]);

  // Progress bar + hide the controls while scrolling down.
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      setProgress(max > 0 ? Math.min(100, (y / max) * 100) : 0);

      if (Math.abs(y - lastScroll.current) > 8) {
        setUiHidden(y > 140 && y > lastScroll.current);
        lastScroll.current = y;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToPage = useCallback((index: number, smooth = true) => {
    const el = pageRefs.current[index];
    if (!el) return;

    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 8,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // j / k or arrow keys jump between pages.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).closest("input, textarea")) return;
      if (!content) return;

      if (e.key === "j" || e.key === "ArrowRight") {
        scrollToPage(Math.min(current + 1, content.pages.length - 1));
      } else if (e.key === "k" || e.key === "ArrowLeft") {
        scrollToPage(Math.max(current - 1, 0));
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [content, current, scrollToPage]);

  function markLoaded(index: number) {
    setLoaded((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }

  async function submitReview() {
    if (rating < 1) {
      alert("Please select a rating");
      return;
    }

    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ comicId: id, rating, comment: reviewText }),
    });

    if (res.status === 401) {
      window.location.assign("/login");
      return;
    }

    if (res.ok) {
      setSubmitted(true);
    } else {
      alert("Failed to submit review");
    }
  }

  if (error) {
    return (
      <div className="comic-reader" style={{ display: "grid", placeItems: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <div style={{ fontSize: 42 }}>🔒</div>
          <h2 style={{ margin: "10px 0 6px" }}>This comic is locked</h2>
          <p style={{ opacity: 0.65, margin: "0 0 18px" }}>
            {error === "Unauthorized"
              ? "Log in to read this comic."
              : error === "Not purchased"
              ? "Buy this comic to start reading."
              : error}
          </p>
          <a className="pc-btn" href={error === "Unauthorized" ? "/login" : "/comics"}>
            {error === "Unauthorized" ? "Log in" : "Back to comics"}
          </a>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="comic-reader" style={{ display: "grid", placeItems: "center" }}>
        <p style={{ opacity: 0.6 }}>Opening comic...</p>
      </div>
    );
  }

  if (content.pages.length === 0) {
    return (
      <div className="comic-reader" style={{ display: "grid", placeItems: "center" }}>
        <p>No pages found for this comic.</p>
      </div>
    );
  }

  const total = content.pages.length;
  const atEnd = current >= total - 1;

  return (
    <div className="comic-reader">
      <div className="comic-progress" style={{ width: `${progress}%` }} />

      {/* TOP BAR */}
      <header className={`comic-topbar ${uiHidden ? "is-hidden" : ""}`}>
        <a className="reader-icon-btn" href="/comics" aria-label="Back to comics" style={{ background: "rgba(255,255,255,0.08)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </a>

        <div className="reader-heading">
          <small>Now reading</small>
          <strong>{content.title || "Comic"}</strong>
        </div>

        <span className="comic-hud-count" style={{ opacity: 0.75 }}>
          {current + 1} / {total}
        </span>
      </header>

      {resumePage !== null && resumePage < total && (
        <button
          type="button"
          onClick={() => {
            scrollToPage(resumePage, false);
            setResumePage(null);
          }}
          className="pc-btn"
          style={{
            position: "fixed",
            top: 70,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 65,
          }}
        >
          Resume from page {resumePage + 1}
          <span
            role="button"
            aria-label="Dismiss"
            onClick={(e) => {
              e.stopPropagation();
              setResumePage(null);
            }}
            style={{ marginLeft: 6, opacity: 0.8 }}
          >
            ✕
          </span>
        </button>
      )}

      {/* PAGES */}
      <main
        className={`comic-strip ${gaps ? "comic-gap" : ""}`}
        style={{ maxWidth: WIDTHS[widthMode] }}
        onClick={() => setUiHidden((hidden) => !hidden)}
      >
        {content.pages.map((src, index) => (
          <div
            key={src + index}
            ref={(el) => {
              pageRefs.current[index] = el;
            }}
            data-index={index}
            className={`comic-page ${loaded.has(index) ? "is-loaded" : ""}`}
          >
            {!loaded.has(index) && (
              <div className="comic-page-skeleton">Page {index + 1}</div>
            )}

            <img
              src={src}
              alt={`Page ${index + 1}`}
              loading={index < 3 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              ref={(img) => {
                // Cached images can finish before onLoad is attached.
                if (img?.complete && img.naturalWidth > 0) markLoaded(index);
              }}
              onLoad={() => markLoaded(index)}
              onError={() => markLoaded(index)}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        ))}
      </main>

      {/* THE END */}
      <section className="comic-end">
        <div style={{ textAlign: "center", margin: "10px 0 34px" }}>
          <div style={{ letterSpacing: "0.4em", fontSize: 12, fontWeight: 800, color: "#ff85c1" }}>
            THE END
          </div>
          <h2 style={{ fontSize: "clamp(24px, 6vw, 34px)", margin: "8px 0 0" }}>
            {content.title || "Thanks for reading"}
          </h2>
        </div>

        <div className="comic-panel" style={{ textAlign: "center" }}>
          {submitted ? (
            <p style={{ margin: 0 }}>Thanks for rating this comic!</p>
          ) : (
            <>
              <h3 style={{ margin: "0 0 6px" }}>Rate this comic</h3>
              <div style={{ marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} stars`}
                    onClick={() => setRating(n)}
                    style={{
                      fontSize: 30,
                      margin: 2,
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      color: n <= rating ? "#f5a623" : "rgba(255,255,255,0.25)",
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                placeholder="What did you think? (optional)"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <button type="button" className="pc-btn" onClick={submitReview} style={{ marginTop: 10 }}>
                Submit review
              </button>
            </>
          )}
        </div>

        <div className="comic-panel">
          <CommentsSection
            listUrl={`/api/comments/${id}`}
            postUrl="/api/comments"
            postBody={{ comicId: id }}
            tone="dark"
          />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" className="pc-btn pc-btn-ghost" style={{ color: "#fff" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            ↑ Back to top
          </button>
          <a className="pc-btn" href="/comics">
            More comics
          </a>
        </div>
      </section>

      {/* FLOATING CONTROLS */}
      <div className={`comic-hud ${uiHidden ? "is-hidden" : ""}`}>
        <button
          type="button"
          aria-label="Previous page"
          onClick={() => scrollToPage(Math.max(current - 1, 0))}
          disabled={current === 0}
        >
          ↑
        </button>

        <span className="comic-hud-count">
          {current + 1} / {total}
        </span>

        <button
          type="button"
          aria-label="Next page"
          onClick={() => scrollToPage(Math.min(current + 1, total - 1))}
          disabled={atEnd}
        >
          ↓
        </button>

        <button
          type="button"
          className={`hide-sm ${widthMode === "wide" ? "is-active" : ""}`}
          onClick={() => setWidthMode((m) => (m === "fit" ? "wide" : "fit"))}
        >
          {widthMode === "wide" ? "Wide" : "Fit"}
        </button>

        <button
          type="button"
          className={gaps ? "is-active" : ""}
          onClick={() => setGaps((g) => !g)}
          title="Space between pages"
        >
          {gaps ? "Gaps" : "Seamless"}
        </button>
      </div>
    </div>
  );
}

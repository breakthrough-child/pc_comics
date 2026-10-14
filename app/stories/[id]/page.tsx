"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CoinIcon,
  LockIcon,
  lastReadKey,
} from "../../components/StoryContent";
import CommentsSection from "../../components/CommentsSection";

type ChapterSummary = {
  id: string;
  number: number;
  title: string;
  isFree: boolean;
  price: number;
  isPublished: boolean;
  unlocked: boolean;
  canRead: boolean;
};

type Story = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverImage?: string | null;
  isPublished: boolean;
  chapters: ChapterSummary[];
  ownsStory: boolean;
};

export default function StoryBookPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params?.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [coins, setCoins] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastReadId, setLastReadId] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!storyId) return;

    async function load() {
      try {
        const [res, meRes] = await Promise.all([
          fetch(`/api/stories/${storyId}`, {
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/me", { credentials: "include", cache: "no-store" }),
        ]);

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load story");
          return;
        }

        setStory(data.story);
        setCoins(data.coins || 0);
        setIsLoggedIn(Boolean(data.isLoggedIn));

        if (meRes.ok) {
          const me = await meRes.json();
          setIsAdmin(me?.role === "ADMIN");
        }
      } catch (err) {
        console.error("STORY FETCH ERROR:", err);
        setError("Failed to load story");
      } finally {
        setLoading(false);
      }
    }

    load();

    try {
      setLastReadId(localStorage.getItem(lastReadKey(storyId)));
    } catch {
      // Storage unavailable; "continue reading" just won't show.
    }
  }, [storyId]);

  async function submitReview() {
    if (rating < 1) {
      alert("Please select a rating");
      return;
    }

    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ storyId, rating, comment: reviewComment }),
    });

    if (res.status === 401) {
      router.push("/login");
      return;
    }

    if (!res.ok) {
      alert("Failed to submit review");
      return;
    }

    setSubmitted(true);
  }

  if (loading) {
    return (
      <div className="pc-page" style={{ textAlign: "center", paddingTop: 80 }}>
        Loading story...
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="pc-page" style={{ textAlign: "center", paddingTop: 80 }}>
        <h2>{error || "Story not found"}</h2>
        <button className="pc-btn" onClick={() => router.push("/stories")}>
          Back to Stories
        </button>
      </div>
    );
  }

  const chapters = story.chapters;
  const firstChapter = chapters[0];
  const continueChapter = chapters.find((c) => c.id === lastReadId);
  const freeCount = chapters.filter((c) => c.isFree).length;

  return (
    <div style={{ color: "var(--text)", fontFamily: "system-ui, sans-serif" }}>
      {/* HERO */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid var(--surface-border)",
        }}
      >
        {story.coverImage && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: -40,
              backgroundImage: `url(${story.coverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(40px) saturate(1.2)",
              opacity: 0.45,
            }}
          />
        )}

        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 0%, var(--bg) 100%)",
            opacity: 0.85,
          }}
        />

        <div
          className="pc-page"
          style={{
            position: "relative",
            paddingBottom: 34,
            display: "flex",
            gap: "clamp(16px, 4vw, 36px)",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "clamp(130px, 34vw, 240px)",
              aspectRatio: "2 / 3",
              borderRadius: 14,
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: "0 24px 50px rgba(0,0,0,0.4)",
              background:
                "linear-gradient(135deg, rgba(255,77,166,0.4), rgba(75,0,130,0.4))",
            }}
          >
            {story.coverImage && (
              <img
                src={story.coverImage}
                alt={story.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            )}
          </div>

          <div style={{ flex: "1 1 300px", minWidth: 0 }}>
            {!story.isPublished && (
              <span className="pc-chip pc-chip-paid" style={{ marginBottom: 10 }}>
                Draft — only admins can see this
              </span>
            )}

            <h1
              style={{
                fontSize: "clamp(28px, 6vw, 48px)",
                lineHeight: 1.08,
                margin: "6px 0 0",
                fontWeight: 850,
                letterSpacing: -0.5,
                overflowWrap: "break-word",
              }}
            >
              {story.title}
            </h1>

            {story.subtitle && (
              <p
                style={{
                  fontSize: "clamp(15px, 3.5vw, 19px)",
                  fontStyle: "italic",
                  opacity: 0.75,
                  margin: "10px 0 0",
                }}
              >
                {story.subtitle}
              </p>
            )}

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
              <span className="pc-chip pc-chip-muted">
                {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"}
              </span>
              {freeCount > 0 && (
                <span className="pc-chip pc-chip-free">{freeCount} free</span>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
              {continueChapter ? (
                <a
                  className="pc-btn"
                  href={`/stories/${story.id}/chapters/${continueChapter.id}`}
                >
                  Continue · Chapter {continueChapter.number}
                </a>
              ) : (
                firstChapter && (
                  <a
                    className="pc-btn"
                    href={`/stories/${story.id}/chapters/${firstChapter.id}`}
                  >
                    Start reading
                  </a>
                )
              )}

              {isLoggedIn && (
                <a href={`/coins?returnTo=/stories/${story.id}`} className="pc-coin-pill">
                  <CoinIcon size={18} />
                  {coins.toLocaleString()} coins
                </a>
              )}

              {isAdmin && (
                <a className="pc-btn pc-btn-ghost" href={`/upload-story/${story.id}`}>
                  Manage chapters
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div
        className="pc-page"
        style={{ paddingTop: 26, maxWidth: 860 }}
      >
        {story.description && (
          <section style={{ marginBottom: 30 }}>
            <h2 style={{ fontSize: 18, margin: "0 0 10px" }}>About this story</h2>
            <p style={{ lineHeight: 1.7, opacity: 0.85, margin: 0, whiteSpace: "pre-wrap" }}>
              {story.description}
            </p>
          </section>
        )}

        {/* CHAPTERS */}
        <section className="pc-card" style={{ padding: 8, marginBottom: 30 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 10px 6px",
            }}
          >
            <h2 style={{ fontSize: 18, margin: 0 }}>Chapters</h2>
            {story.ownsStory && (
              <span className="pc-chip pc-chip-open">You own this book</span>
            )}
          </div>

          {chapters.length === 0 && (
            <p style={{ padding: 12, opacity: 0.6 }}>No chapters yet.</p>
          )}

          {chapters.map((chapter) => (
            <a
              key={chapter.id}
              href={`/stories/${story.id}/chapters/${chapter.id}`}
              className={`chapter-row ${chapter.id === lastReadId ? "is-current" : ""}`}
            >
              <span className="chapter-num">{chapter.number}</span>

              <span className="chapter-row-text">
                <strong>{chapter.title}</strong>
                <span>
                  {chapter.id === lastReadId
                    ? "Last read"
                    : `Chapter ${chapter.number}`}
                  {!chapter.isPublished && " · Draft"}
                </span>
              </span>

              <ChapterStatus chapter={chapter} />
            </a>
          ))}
        </section>

        {/* REVIEW */}
        <section className="pc-card" style={{ padding: 20, marginBottom: 24, textAlign: "center" }}>
          {submitted ? (
            <p style={{ margin: 0 }}>Thank you for reviewing this story.</p>
          ) : (
            <>
              <h2 style={{ fontSize: 18, margin: "0 0 8px" }}>Rate this story</h2>

              <div style={{ marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} stars`}
                    onClick={() => setRating(n)}
                    style={{
                      fontSize: 28,
                      margin: 2,
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      color: n <= rating ? "#f5a623" : "rgba(128,128,128,0.45)",
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                className="pc-input"
                placeholder="Leave a review (optional)..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                style={{ resize: "vertical" }}
              />

              <button type="button" className="pc-btn" onClick={submitReview} style={{ marginTop: 10 }}>
                Submit review
              </button>
            </>
          )}
        </section>

        <section className="pc-card" style={{ padding: 20 }}>
          <CommentsSection
            listUrl={`/api/stories/comments/${story.id}`}
            postUrl="/api/stories/comments"
            postBody={{ storyId: story.id }}
          />
        </section>
      </div>
    </div>
  );
}

function ChapterStatus({ chapter }: { chapter: ChapterSummary }) {
  if (chapter.isFree) {
    return <span className="pc-chip pc-chip-free">Free</span>;
  }

  if (chapter.unlocked) {
    return <span className="pc-chip pc-chip-open">Unlocked</span>;
  }

  if (chapter.canRead) {
    return <span className="pc-chip pc-chip-muted">Admin</span>;
  }

  return (
    <span className="pc-chip pc-chip-paid">
      <LockIcon /> {chapter.price}
      <CoinIcon size={13} />
    </span>
  );
}

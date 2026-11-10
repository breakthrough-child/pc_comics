"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StoryPreviewModal from "../components/StoryPreviewModal";
import SiteFooter from "../components/SiteFooter";
import ReaderCount from "../components/ReaderCount";
import { CoinIcon } from "../components/StoryContent";

type StorySummary = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverImage?: string | null;
  isPublished: boolean;
  chapterCount: number;
  freeChapterCount: number;
  firstChapterId: string | null;
  previewContent?: any;
  avgRating?: number | null;
};

function StoriesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stories, setStories] = useState<StorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [selectedStory, setSelectedStory] = useState<StorySummary | null>(null);
  const [highlightedStoryId, setHighlightedStoryId] = useState<string | null>(null);
  const [showUploadChoice, setShowUploadChoice] = useState(false);

  const role = user?.role || null;

  useEffect(() => {
    async function fetchStories() {
      try {
        const res = await fetch("/api/stories", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch stories");
          return;
        }

        setStories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("STORIES FETCH ERROR:", err);
        setError("Failed to load stories");
      } finally {
        setLoading(false);
      }
    }

    fetchStories();

    fetch("/api/me", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const previewId = searchParams.get("preview");

    if (!previewId || stories.length === 0) return;

    const found = stories.find((story) => story.id === previewId);

    if (found) {
      setSelectedStory(found);
      setHighlightedStoryId(previewId);
    }
  }, [searchParams, stories]);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  }

  async function deleteStory(storyId: string) {
    if (!window.confirm("Delete this story and all of its chapters?")) {
      return;
    }

    const res = await fetch(`/api/stories/${storyId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete story");
      return;
    }

    setStories((prev) => prev.filter((story) => story.id !== storyId));

    if (selectedStory?.id === storyId) setSelectedStory(null);
  }

  function openStory(storyId: string) {
    router.push(`/stories/${storyId}`);
  }

  return (
    <div className="pc-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <img src="/pclogo.png" alt="PC Comics" className="page-logo" />

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {user?.userId && (
            <a href="/coins" className="pc-coin-pill">
              <CoinIcon size={18} />
              {(user.coins ?? 0).toLocaleString()}
            </a>
          )}

          {!user?.userId ? (
            <>
              <a href="/login" className="pc-btn pc-btn-ghost">
                Login
              </a>
              <a href="/register" className="pc-btn">
                Register
              </a>
            </>
          ) : (
            <>
              {role === "ADMIN" && (
                <button
                  type="button"
                  className="pc-btn"
                  onClick={() => setShowUploadChoice(true)}
                >
                  Upload
                </button>
              )}
              <button type="button" className="pc-btn pc-btn-ghost" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 26 }}>
        <h1 className="page-hero-title">Stories Library</h1>
        <p style={{ color: "var(--muted)", margin: "8px 0 0" }}>
          Read chapter by chapter. Start free, unlock the rest with coins.
        </p>
        <ReaderCount style={{ marginTop: 14 }} />
      </div>

      {error && (
        <div
          style={{
            padding: 15,
            marginBottom: 20,
            borderRadius: 10,
            background: "rgba(255, 0, 0, 0.08)",
            color: "#ff5555",
          }}
        >
          {error}
        </div>
      )}

      {loading && <p style={{ opacity: 0.7 }}>Loading stories...</p>}

      {!loading && !error && stories.length === 0 && (
        <div className="pc-card" style={{ padding: 40, textAlign: "center" }}>
          <h2 style={{ marginTop: 0 }}>No stories yet</h2>
          <p style={{ opacity: 0.65, marginBottom: 0 }}>
            Check back later for new stories.
          </p>
        </div>
      )}

      {stories.length > 0 && (
        <div className="book-grid">
          {stories.map((story) => (
            <div
              key={story.id}
              className={`book-card ${
                highlightedStoryId === story.id ? "is-highlighted" : ""
              }`}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("button, a")) return;
                setSelectedStory(story);
                setHighlightedStoryId(story.id);
              }}
            >
              <div className="book-cover">
                {story.coverImage ? (
                  <img src={story.coverImage} alt={story.title} loading="lazy" />
                ) : (
                  <div className="book-cover-fallback">{story.title}</div>
                )}

                <span className="book-badge">
                  {story.chapterCount} {story.chapterCount === 1 ? "chapter" : "chapters"}
                </span>

                {!story.isPublished && (
                  <span className="book-badge book-badge-right" style={{ color: "#ffcc66" }}>
                    Draft
                  </span>
                )}
              </div>

              <div className="book-body">
                <h2 className="book-title">{story.title}</h2>

                <div className="book-meta">
                  {story.freeChapterCount > 0 && (
                    <span>{story.freeChapterCount} free</span>
                  )}
                  {story.avgRating ? <span>★ {story.avgRating.toFixed(1)}</span> : null}
                </div>

                {story.description && <p className="book-desc">{story.description}</p>}

                <div className="book-actions">
                  <button
                    type="button"
                    className="pc-btn"
                    onClick={() => openStory(story.id)}
                  >
                    Read
                  </button>

                  {role === "ADMIN" && (
                    <>
                      <button
                        type="button"
                        className="pc-btn pc-btn-ghost"
                        onClick={() => router.push(`/upload-story/${story.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="pc-btn pc-btn-danger"
                        onClick={() => deleteStory(story.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SiteFooter />

      {role === "ADMIN" && showUploadChoice && (
        <div
          onClick={() => setShowUploadChoice(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="pc-card"
            style={{
              width: "100%",
              maxWidth: 420,
              padding: 24,
              background: "var(--surface-strong)",
              display: "grid",
              gap: 12,
            }}
          >
            <h2 style={{ margin: 0 }}>Upload</h2>
            <button type="button" className="pc-btn" onClick={() => router.push("/upload")}>
              Upload Comic
            </button>
            <button
              type="button"
              className="pc-btn"
              style={{ background: "linear-gradient(90deg, #00c6ff, #0072ff)" }}
              onClick={() => router.push("/upload-story")}
            >
              Write a Story
            </button>
            <button
              type="button"
              className="pc-btn pc-btn-ghost"
              onClick={() => setShowUploadChoice(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <StoryPreviewModal
        story={selectedStory}
        open={!!selectedStory}
        onClose={() => setSelectedStory(null)}
        onRead={() => {
          if (selectedStory) openStory(selectedStory.id);
        }}
      />
    </div>
  );
}

export default function StoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="pc-page">
          <p>Loading stories...</p>
        </div>
      }
    >
      <StoriesPageContent />
    </Suspense>
  );
}

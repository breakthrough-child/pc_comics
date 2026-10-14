"use client";

import React from "react";
import StoryContent from "./StoryContent";

type Story = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverImage?: string | null;
  chapterCount?: number;
  freeChapterCount?: number;
  avgRating?: number | null;
  previewContent?: any;
};

type Props = {
  story: Story | null;
  open: boolean;
  onClose: () => void;
  onRead: () => void;
};

export default function StoryPreviewModal({
  story,
  open,
  onClose,
  onRead,
}: Props) {
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setShowShareMenu(false);
      setShowToast(false);
    }
  }, [open]);

  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  if (!open || !story) {
    return null;
  }

  const hasPreview = Boolean(story.previewContent?.content?.length);

  async function share() {
    if (!story) return;

    const shareUrl = `${window.location.origin}/stories?preview=${story.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: story.title,
          text: `Check out "${story.title}"`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShowShareMenu(true);
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 12,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 760,
          maxHeight: "92vh",
          borderRadius: 20,
          background: "var(--surface-strong)",
          color: "var(--text)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ overflowY: "auto", flex: 1 }}>
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              gap: 16,
              padding: 18,
              alignItems: "flex-start",
            }}
          >
            {story.coverImage && (
              <img
                src={story.coverImage}
                alt={story.title}
                style={{
                  width: "clamp(88px, 24vw, 140px)",
                  aspectRatio: "2 / 3",
                  objectFit: "cover",
                  borderRadius: 12,
                  flexShrink: 0,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                }}
              />
            )}

            <div style={{ minWidth: 0, flex: 1 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(20px, 5vw, 26px)",
                  fontWeight: 800,
                  lineHeight: 1.2,
                }}
              >
                {story.title}
              </h2>

              {story.subtitle && (
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 14,
                    opacity: 0.7,
                    fontStyle: "italic",
                  }}
                >
                  {story.subtitle}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginTop: 10,
                }}
              >
                <span className="pc-chip pc-chip-muted">
                  {story.chapterCount || 0} chapters
                </span>
                {story.freeChapterCount ? (
                  <span className="pc-chip pc-chip-free">
                    {story.freeChapterCount} free
                  </span>
                ) : null}
                {story.avgRating ? (
                  <span className="pc-chip pc-chip-paid">
                    ★ {story.avgRating.toFixed(1)}
                  </span>
                ) : null}
              </div>

              {story.description && (
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: 14,
                    lineHeight: 1.6,
                    opacity: 0.85,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {story.description}
                </p>
              )}
            </div>
          </div>

          {/* FIRST CHAPTER PREVIEW */}
          {hasPreview && (
            <div style={{ padding: "0 18px 18px" }}>
              <div
                style={{
                  position: "relative",
                  maxHeight: 340,
                  overflow: "hidden",
                  padding: "18px 18px 0",
                  borderRadius: 14,
                  background: "var(--reader-paper)",
                }}
              >
                <div className="reader-chapter-label" style={{ textAlign: "left", marginBottom: 10 }}>
                  Chapter 1 preview
                </div>
                <StoryContent
                  content={story.previewContent}
                  style={{ fontSize: 16 }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 120,
                    background:
                      "linear-gradient(transparent, var(--reader-paper))",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: 14,
            justifyContent: "flex-end",
            flexWrap: "wrap",
            borderTop: "1px solid rgba(128,128,128,0.15)",
          }}
        >
          <button type="button" className="pc-btn pc-btn-ghost" onClick={share}>
            Share
          </button>
          <button type="button" className="pc-btn pc-btn-ghost" onClick={onClose}>
            Close
          </button>
          <button type="button" className="pc-btn" onClick={onRead} style={{ flex: "1 1 160px", maxWidth: 260 }}>
            Start reading
          </button>
        </div>
      </div>

      {/* SHARE SHEET */}

      {showShareMenu && (
        <div
          onClick={() => setShowShareMenu(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 10000,
            padding:
              "env(safe-area-inset-bottom) 10px 10px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "var(--card-bg)",
              borderRadius: "20px 20px 12px 12px",
              padding: "16px 14px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              boxShadow:
                "0 -10px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                }}
              >
                Share Story
              </h3>

              <p
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  marginTop: 4,
                }}
              >
                Invite others to preview this story
              </p>
            </div>

            {(() => {
              const url = `${window.location.origin}/stories?preview=${story.id}`;

              const text = `🔥 Check out "${story.title}"\n\n${url}`;

              const buttonStyle = {
                padding: "12px",
                borderRadius: 12,
                color: "#fff",
                textAlign: "center" as const,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
              };

              return (
                <>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      text
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...buttonStyle,
                      background: "#25D366",
                    }}
                  >
                    WhatsApp
                  </a>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(
                      url
                    )}&text=${encodeURIComponent(text)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...buttonStyle,
                      background: "#0088cc",
                    }}
                  >
                    Telegram
                  </a>

                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      url
                    )}&text=${encodeURIComponent(text)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...buttonStyle,
                      background: "#000",
                    }}
                  >
                    Twitter
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      url
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...buttonStyle,
                      background: "#1877f2",
                    }}
                  >
                    Facebook
                  </a>

                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        url
                      );

                      setShowToast(true);
                      setShowShareMenu(false);
                    }}
                    style={{
                      padding: "12px",
                      borderRadius: 12,
                      border: "none",
                      background: "#333",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Copy Link
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* TOAST */}

      {showToast && (
        <div
          style={{
            position: "fixed",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "linear-gradient(90deg, #ff4da6, #ff85c1)",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 999,
            fontSize: 13,
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.3)",
            zIndex: 10001,
          }}
        >
          Link copied 🚀
        </div>
      )}
    </div>
  );
}
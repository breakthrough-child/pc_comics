"use client";

import React from "react";

type StoryNode = {
  type?: string;
  attrs?: Record<string, any>;
  content?: StoryNode[];
  text?: string;
};

type Story = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverImage?: string | null;
  price: number;
  content?: {
    type?: string;
    content?: StoryNode[];
  } | null;
  purchased?: boolean;
};

type Props = {
  story: Story | null;
  open: boolean;
  onClose: () => void;
  onBuy: () => void;
  onRead: () => void;

  /**
   * Number of text blocks to show in the preview.
   * Example:
   * previewParagraphs={3}
   */
  previewParagraphs?: number;

  /**
   * Image URLs that the admin has selected for the preview.
   * Only these images are displayed.
   */
  previewImages?: string[];
};

function extractText(node: StoryNode): string {
  if (node.text) {
    return node.text;
  }

  if (!node.content?.length) {
    return "";
  }

  return node.content.map(extractText).join("");
}

function getPreviewParagraphs(
  content: Story["content"],
  limit: number
): string[] {
  if (!content?.content) {
    return [];
  }

  const paragraphs: string[] = [];

  for (const node of content.content) {
    if (
      node.type === "paragraph" ||
      node.type === "heading" ||
      node.type === "blockquote"
    ) {
      const text = extractText(node).trim();

      if (text) {
        paragraphs.push(text);
      }
    }

    if (paragraphs.length >= limit) {
      break;
    }
  }

  return paragraphs;
}

export default function StoryPreviewModal({
  story,
  open,
  onClose,
  onBuy,
  onRead,
  previewParagraphs = 7,
  previewImages = [],
}: Props) {
  const [previewIndex, setPreviewIndex] = React.useState(0);
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setPreviewIndex(0);
      setShowShareMenu(false);
      setShowToast(false);
    }
  }, [open]);

  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  if (!open || !story) {
    return null;
  }

  const paragraphs = getPreviewParagraphs(
    story.content,
    previewParagraphs
  );

  const images = previewImages.filter(Boolean);

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
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 900,
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: 16,
          background: "var(--card-bg)",
          color: "var(--text)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* COVER IMAGE */}

        {story.coverImage && (
          <div
            style={{
              width: "100%",
              maxHeight: 420,
              overflow: "hidden",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <img
              src={story.coverImage}
              alt={story.title}
              style={{
                width: "100%",
                maxHeight: 420,
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        )}

        {/* HEADER */}

        <div style={{ padding: 18 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            {story.title}
          </h2>

          {story.subtitle && (
            <p
              style={{
                margin: "7px 0 0",
                fontSize: 15,
                opacity: 0.7,
                fontStyle: "italic",
              }}
            >
              {story.subtitle}
            </p>
          )}

          <p
            style={{
              margin: "10px 0 0",
              fontSize: 13,
              opacity: 0.75,
            }}
          >
            ₦{story.price}
          </p>
        </div>

        {/* DESCRIPTION */}

        {story.description && (
          <div
            style={{
              padding: "0 18px 18px",
            }}
          >
            <h4
              style={{
                margin: "0 0 8px",
                fontSize: 14,
              }}
            >
              About this story
            </h4>

            <p
              style={{
                margin: 0,
                opacity: 0.85,
                fontSize: 14,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {story.description}
            </p>
          </div>
        )}

        {/* STORY TEXT PREVIEW */}

        {paragraphs.length > 0 && (
          <div
            style={{
              padding: "0 18px 20px",
            }}
          >
            <h4
              style={{
                margin: "0 0 10px",
                fontSize: 14,
              }}
            >
              Story Preview
            </h4>

            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  style={{
                    margin:
                      index === paragraphs.length - 1
                        ? 0
                        : "0 0 14px",
                    fontSize: 15,
                    lineHeight: 1.8,
                    opacity: 0.9,
                  }}
                >
                  {paragraph}
                </p>
              ))}

              <p
                style={{
                  margin: "16px 0 0",
                  fontSize: 12,
                  opacity: 0.5,
                  fontStyle: "italic",
                }}
              >
                Continue reading to discover the rest of the
                story...
              </p>
            </div>
          </div>
        )}

        {/* PREVIEW IMAGES */}

        {images.length > 0 && (
          <div
            style={{
              padding: "0 18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: 14,
              }}
            >
              Story Preview
            </h4>

            {/* IMAGE */}

            <div
              style={{
                width: "100%",
                maxHeight: 500,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 12,
                overflow: "hidden",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <img
                src={images[previewIndex]}
                alt={`Story preview ${previewIndex + 1}`}
                style={{
                  width: "100%",
                  maxHeight: 500,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>

            {/* CONTROLS */}

            {images.length > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setPreviewIndex((current) =>
                      Math.max(current - 1, 0)
                    )
                  }
                  disabled={previewIndex === 0}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "none",
                    background:
                      previewIndex === 0
                        ? "rgba(100,100,100,0.2)"
                        : "rgba(255,77,166,0.6)",
                    color: "#fff",
                    cursor:
                      previewIndex === 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  ◀
                </button>

                <span
                  style={{
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  {previewIndex + 1} / {images.length}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPreviewIndex((current) =>
                      Math.min(
                        current + 1,
                        images.length - 1
                      )
                    )
                  }
                  disabled={
                    previewIndex === images.length - 1
                  }
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "none",
                    background:
                      previewIndex === images.length - 1
                        ? "rgba(100,100,100,0.2)"
                        : "rgba(255,77,166,0.6)",
                    color: "#fff",
                    cursor:
                      previewIndex === images.length - 1
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  ▶
                </button>
              </div>
            )}
          </div>
        )}

        {/* ACTIONS */}

        <div
          style={{
            display: "flex",
            gap: 10,
            padding: 18,
            justifyContent: "flex-end",
            flexWrap: "wrap",
            borderTop:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* SHARE */}

          <button
            type="button"
            onClick={async () => {
              const shareUrl = `${window.location.origin}/stories?preview=${story.id}`;

              const shareText = `🔥 Check out "${story.title}" on our platform!\n\nRead the story here:\n${shareUrl}`;

              try {
                if (navigator.share) {
                  await navigator.share({
                    title: story.title,
                    text: shareText,
                    url: shareUrl,
                  });
                } else {
                  await navigator.clipboard.writeText(
                    shareUrl
                  );

                  setShowShareMenu(true);
                }
              } catch (error) {
                console.error("Share failed:", error);
              }
            }}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "none",
              background:
                "linear-gradient(90deg, #00c6ff, #0072ff)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Share
          </button>

          {/* CLOSE */}

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "none",
              background: "rgba(100,100,100,0.3)",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            Close
          </button>

          {/* BUY / READ */}

          {story.purchased ? (
            <button
              type="button"
              onClick={onRead}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "none",
                background:
                  "linear-gradient(90deg, #ff4da6, #ff85c1)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Read
            </button>
          ) : (
            <button
              type="button"
              onClick={onBuy}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "none",
                background:
                  "linear-gradient(90deg, #ff4da6, #ff85c1)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Buy
            </button>
          )}
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
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StoryPreviewModal from "../components/StoryPreviewModal";

type Story = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverImage?: string | null;
  price: number;
  isPublished: boolean;
  purchased: boolean;
  content?: any;

  // Story preview data
  previewContent?: any;
  previewImages?: string[];

  avgRating?: number;
};

export default function StoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [role, setRole] = useState<string | null>(null);
const [user, setUser] = useState<any>(null);
const [selectedStory, setSelectedStory] = useState<Story | null>(null);
const [editingStory, setEditingStory] = useState<Story | null>(null);
const [menuOpen, setMenuOpen] = useState(false);
const [isMobile, setIsMobile] = useState(false);
const [showUploadChoice, setShowUploadChoice] = useState(false);
const [highlightedStoryId, setHighlightedStoryId] =
  useState<string | null>(null);

  async function fetchStories() {
    try {
      setLoading(true);
      setError("");

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

  useEffect(() => {
    fetchStories();
  }, []);


  useEffect(() => {
  const previewId = searchParams.get("preview");

  if (!previewId || stories.length === 0) {
    return;
  }

  const found = stories.find(
    (story) => story.id === previewId
  );

  if (found) {
    setSelectedStory(found);
    setHighlightedStoryId(previewId);
  }
}, [searchParams, stories]);


  useEffect(() => {
  fetch("/api/me", {
    credentials: "include",
    cache: "no-store",
  })
    .then((res) => res.json())
    .then((data) => {
      setUser(data);
      setRole(data?.role || null);
    })
    .catch((err) => {
      console.error("USER FETCH ERROR:", err);
    });
}, []);

  async function buyStory(storyId: string) {
    try {
      setBuyingId(storyId);

      const res = await fetch("/api/paystack/story-checkout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storyId,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        alert(data.error || "Checkout failed");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Payment URL was not returned");
      }
    } catch (err) {
      console.error("STORY CHECKOUT ERROR:", err);
      alert("Unable to start payment");
    } finally {
      setBuyingId(null);
    }
  }


  async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  setUser(null);
  setRole(null);
}


function updateStory() {
  if (!editingStory) return;

  router.push(`/upload-story/${editingStory.id}`);
  setEditingStory(null);
}


async function deleteStory(storyId: string) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this story?"
  );

  if (!confirmed) return;

  try {
    const res = await fetch(`/api/stories/${storyId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete story");
      return;
    }

    alert(data.message || "Story deleted");

    setStories((prev) =>
      prev.filter((story) => story.id !== storyId)
    );

    if (selectedStory?.id === storyId) {
      setSelectedStory(null);
    }
  } catch (error) {
    console.error("DELETE STORY ERROR:", error);
    alert("Failed to delete story");
  }
}


  function readStory(storyId: string) {
    router.push(`/stories/${storyId}`);
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "40px 20px",
          color: "var(--text)",
          textAlign: "center",
        }}
      >
        <p>Loading stories...</p>
      </div>
    );
  }

  return (

    
  <div
  className="comics-root"
  style={{
        minHeight: "100vh",
        padding: "40px 50px",
        //background: "var(--bg)",
        background: "transparent",
        color: "var(--text)",
        fontFamily: "system-ui, sans-serif",
        transition: "background 0.3s ease, color 0.3s ease",
        paddingBottom: "200px",
      }}
    >


       {/* ✅ ADD THIS RIGHT HERE */}
    <style jsx>{`
      @media (max-width: 768px) {
        .comics-header {
          flex-direction: column;
          align-items: flex-start !important;
          gap: 12px;
        }

        .comics-title {
          font-size: 32px !important;
        }

        .comics-grid {
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
        }

        .comics-card {
          transform: none !important;
        }

        .comics-btn {
          width: 100%;
        }

        .header-actions {
          display: none !important;
        }
      }
    `}</style>
    
  <div
  className="comics-header"
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  }}
>
  <img
  src="/pclogo.png"
  alt="PC Comics"
  style={{
    height: 200,
    width: "auto",
    objectFit: "contain",
  }}
/>

  <div
    className="header-actions"
    style={{ display: "flex", gap: 10 }}
  >
    {!user?.userId ? (
      <>
        <a href="/login">
          <button
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: "#ff85c1",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </a>

        <a href="/register">
          <button
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: "#ff4da6",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </a>
      </>
    ) : (
      <>
        {role === "ADMIN" && (
  <button
    type="button"
    onClick={() => setShowUploadChoice(true)}
    style={{
      width: "100%",
      padding: "12px",
      borderRadius: 8,
      border: "none",
      background: "#fca6d1",
      color: "var(--text)",
      cursor: "pointer",
      fontWeight: 600,
    }}
  >
    Upload
  </button>
)}

        <button
          onClick={logout}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: "#2b2b2b",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </>
    )}
  </div>
</div>

<div style={{ marginBottom: 30 }}>
  <h1
    style={{
      fontSize: 42,
      fontWeight: 800,
      letterSpacing: -1,
      margin: 0,
    }}
  >
    Stories Library
  </h1>

  <p
    style={{
      opacity: 0.6,
      marginTop: 8,
    }}
  >
    Discover written stories and immerse yourself
    in new worlds.
  </p>
</div>

        {/* ERROR */}
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

        {/* EMPTY STATE */}
        {!error && stories.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              borderRadius: 16,
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <h2>No stories yet</h2>

            <p style={{ opacity: 0.65 }}>
              Check back later for new stories.
            </p>
          </div>
        )}

        {/* STORY GRID */}
        {stories.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {stories.map((story) => (
  <div
    key={story.id}
    onClick={(e) => {
      const target = e.target as HTMLElement;

      if (
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.tagName === "A" ||
        target.closest("a")
      ) {
        return;
      }

      setSelectedStory(story);
      setHighlightedStoryId(story.id);
    }}
    style={{
                  overflow: "hidden",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(10px)",
                  boxShadow:
                    "0 10px 30px rgba(255,77,166,0.10)",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
transition: "all 0.3s ease",
position: "relative",
                }}
              >
                {/* COVER */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "3 / 4",
                    background: "rgba(0,0,0,0.15)",
                    overflow: "hidden",
                  }}
                >
                  {story.coverImage ? (
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0.5,
                        fontSize: 14,
                      }}
                    >
                      No Cover
                    </div>
                  )}
                </div>

                {/* STORY INFORMATION */}
                <div
                  style={{
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 19,
                      fontWeight: 750,
                    }}
                  >
                    {story.title}
                  </h2>

                  {story.subtitle && (
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: 13,
                        opacity: 0.65,
                        fontStyle: "italic",
                      }}
                    >
                      {story.subtitle}
                    </p>
                  )}

                  {story.description && (
                    <p
                      style={{
                        margin: "12px 0",
                        fontSize: 14,
                        lineHeight: 1.5,
                        opacity: 0.8,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {story.description}
                    </p>
                  )}

                  {/* PRICE + ACTION */}
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <strong
                      style={{
                        fontSize: 16,
                        color: "#00ffcc",
                      }}
                    >
                      ₦{story.price.toLocaleString()}
                    </strong>

                    {story.purchased ? (
                      <button
                        type="button"
                        onClick={() => readStory(story.id)}
                        style={{
                          padding: "9px 15px",
                          borderRadius: 9,
                          border: "none",
                          cursor: "pointer",
                          fontWeight: "bold",
                          background:
                            "linear-gradient(90deg, #ff4da6, #ff85c1)",
                          color: "#fff",
                        }}
                      >
                        Read
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => buyStory(story.id)}
                        disabled={buyingId === story.id}
                        style={{
                          padding: "9px 15px",
                          borderRadius: 9,
                          border: "none",
                          cursor:
                            buyingId === story.id
                              ? "not-allowed"
                              : "pointer",
                          fontWeight: "bold",
                          background:
                            buyingId === story.id
                              ? "#999"
                              : "linear-gradient(90deg, #ff4da6, #ff85c1)",
                          color: "#fff",
                        }}
                      >
                        {buyingId === story.id
                          ? "Processing..."
                          : "Buy"}
                      </button>
                    )}

                                        {role === "ADMIN" && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
  e.stopPropagation();
  router.push(`/upload-story/${story.id}`);
}}
                          style={{
                            padding: "9px 12px",
                            borderRadius: 9,
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold",
                            background: "#333",
                            color: "#fff",
                          }}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteStory(story.id);
                          }}
                          style={{
                            padding: "9px 12px",
                            borderRadius: 9,
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold",
                            background: "#ff3b3b",
                            color: "#fff",
                          }}
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

                <div
  style={{
    marginTop: 200,
    paddingTop: 30,
    borderTop:
      "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    textAlign: "center",
  }}
>
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "10px 18px",
      fontSize: 14,
    }}
  >
    <a href="/about" style={{ color: "var(--text)", textDecoration: "none", opacity: 0.85 }}>
      About us
    </a>

    <a href="/contact" style={{ color: "var(--text)", textDecoration: "none", opacity: 0.85 }}>
      Contact
    </a>

    <a href="/faq" style={{ color: "var(--text)", textDecoration: "none", opacity: 0.85 }}>
      FAQ
    </a>

    <a href="/terms" style={{ color: "var(--text)", textDecoration: "none", opacity: 0.85 }}>
      Terms & Conditions
    </a>

    <a href="/privacy" style={{ color: "var(--text)", textDecoration: "none", opacity: 0.85 }}>
      Privacy Policy
    </a>

    <a href="/refund-policy" style={{ color: "var(--text)", textDecoration: "none", opacity: 0.85 }}>
      Refund Policy
    </a>
  </div>

  <div
    style={{
      fontSize: 12,
      opacity: 0.55,
      color: "var(--text)",
    }}
  >
    © 2026 ComicVerse. All rights reserved.
  </div>
</div>



    {/* ADMIN UPLOAD CHOICE MODAL */}
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
          style={{
            width: "100%",
            maxWidth: 420,
            background: "var(--card-bg)",
            color: "var(--text)",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              Upload
            </h2>

            <button
              type="button"
              onClick={() => setShowUploadChoice(false)}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--text)",
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          <p
            style={{
              margin: "0 0 20px",
              opacity: 0.65,
              fontSize: 14,
            }}
          >
            What would you like to upload?
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setShowUploadChoice(false);
                setMenuOpen(false);
                router.push("/upload");
              }}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 12,
                border: "none",
                background:
                  "linear-gradient(90deg, #ff4da6, #ff85c1)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Upload Comic
            </button>

            <button
              type="button"
              onClick={() => {
                setShowUploadChoice(false);
                setMenuOpen(false);
                router.push("/upload-story");
              }}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 12,
                border: "none",
                background:
                  "linear-gradient(90deg, #00c6ff, #0072ff)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Upload Story
            </button>

            <button
              type="button"
              onClick={() => setShowUploadChoice(false)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "none",
                background: "rgba(100,100,100,0.25)",
                color: "var(--text)",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}



        <StoryPreviewModal
          story={selectedStory}
          open={!!selectedStory}
          onClose={() => {
            setSelectedStory(null);
          }}
          onBuy={() => {
            if (selectedStory) {
              buyStory(selectedStory.id);
            }
          }}
          onRead={() => {
            if (selectedStory) {
              readStory(selectedStory.id);
            }
          }}
        />
      </div>
  );
}
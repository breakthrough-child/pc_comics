"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import ComicPreviewModal from "../components/ComicPreviewModal";
import ReaderCount from "../components/ReaderCount";
import { useSearchParams } from "next/navigation";

type Comic = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  purchased: boolean;
};

function ComicsPageInner() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [editingComic, setEditingComic] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [loadingComics, setLoadingComics] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterName, setNewsletterName] = useState("");
  const [selectedComic, setSelectedComic] = useState<any | null>(null);
  const [previewComic, setPreviewComic] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const [highlightedComicId, setHighlightedComicId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
const [isMobile, setIsMobile] = useState(false);
  const [showUploadChoice, setShowUploadChoice] = useState(false);

async function subscribeNewsletter() {
  if (!newsletterEmail) {
    alert("Enter your email");
    return;
  }

  const res = await fetch("/api/newsletter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: newsletterEmail,
      name: newsletterName,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  alert("Subscribed 🎉");

  setNewsletterEmail("");
  setNewsletterName("");
}


useEffect(() => {
  const previewId = searchParams.get("preview");

  if (previewId && comics.length > 0) {
    const found = comics.find((c) => c.id === previewId);

    if (found) {
      setSelectedComic(found);
    }
  }
}, [searchParams, comics]);


  useEffect(() => {
      const fetchComics = async () => {
        setLoadingComics(true);

        try {
          const res = await fetch("/api/comics", {
            credentials: "include",
            cache: "no-store",
          });

          const data = await res.json();

          if (Array.isArray(data)) {
            setComics(data);
          }
        } catch (err) {
          console.error("Failed to fetch comics", err);
        } finally {
          setLoadingComics(false);
        }
      };

      fetchComics();

      // 🔥 THIS IS THE FIX
      const handleFocus = () => {
        fetchComics();
      };

      window.addEventListener("focus", handleFocus);

      return () => {
        window.removeEventListener("focus", handleFocus);
      };
    }, []);



    useEffect(() => {
      const previewId = searchParams.get("preview");

      if (!previewId) return;

      // wait until comics load
      if (comics.length === 0) return;

      const found = comics.find((c) => c.id === previewId);

      if (found) {
        setSelectedComic(found);
        setHighlightedComicId(previewId);
      }
    }, [searchParams, comics]);


  useEffect(() => {
          fetch("/api/me", { 
            credentials: "include",
            cache: "no-store",
          })
            .then((res) => res.json())
            .then((data) => {
              setUser(data);
              setRole(data?.role || null);
            });
        }, []);


async function buyComic(id: string) {
  const res = await fetch("/api/paystack/checkout", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comicId: id }),
  });

  const data = await res.json();

  if (res.status === 401) {
    window.location.href = "/login";
    return;
  }

  if (data.url) {
    window.location.href = data.url;
  } else {
    alert(data.error || "Unable to start payment");
  }
}


async function updateComic() {
  const res = await fetch(`/api/comics/${editingComic.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editingComic),
  });

  const data = await res.json();
  alert(data.message);

  setEditingComic(null);

  // refresh list
  setComics((prev) =>
  prev.map((c) => (c.id === editingComic.id ? editingComic : c))
);
}


async function subscribe() {
  alert("Subscription feature not implemented yet. Use Buy button for now.");
}

async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  setUser(null);
  setRole(null);
}


  return (

    
  <div
  className="comics-root pc-page"
  style={{ minHeight: "100vh", paddingBottom: 220 }}
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
  <img src="/pclogo.png" alt="PC Comics" className="page-logo" />

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
  <h1 className="page-hero-title">
    Comics Library
  </h1>
  <p style={{ opacity: 0.6 }}>
    Stream & own premium comics
  </p>
  <ReaderCount style={{ marginTop: 4 }} />
</div>

    {/* <button
  onClick={subscribe}
  style={{
    marginBottom: 30,
    padding: "10px 18px",
    background: "linear-gradient(90deg, #ff4da6, #ff85c1)",
    color: "#fff",
    boxShadow: "0 6px 15px rgba(255,77,166,0.3)",
    borderRadius: 8,
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  Subscribe for unlimited access
</button> */}



{loadingComics ? (
  <p style={{ padding: 20 }}>Loading comics...</p>
) : (
  <div className="book-grid">
    {comics.map((comic) => (
      <div
        key={comic.id}
        className={`book-card ${
          highlightedComicId === comic.id ? "is-highlighted" : ""
        }`}
        onClick={(e) => {
          // Buttons and links inside the card handle their own clicks.
          if ((e.target as HTMLElement).closest("button, a")) return;
          setSelectedComic(comic);
        }}
      >
        <div className="book-cover">
          <img src={comic.imageUrl} alt={comic.title} loading="lazy" />
          <span className="book-badge book-badge-right">
            ₦{comic.price.toLocaleString()}
          </span>
          {comic.purchased && <span className="book-badge">Owned</span>}
        </div>

        <div className="book-body">
          <h2 className="book-title">{comic.title}</h2>

          <div className="book-meta">
            ★ {(comic as any).avgRating
              ? (comic as any).avgRating.toFixed(1)
              : "No rating"}
          </div>

          <p className="book-desc">{comic.description}</p>

          <div className="book-actions">
            {comic.purchased ? (
              <a href={`/read/${comic.id}`} className="pc-btn">
                Read
              </a>
            ) : (
              <button
                type="button"
                className="pc-btn"
                onClick={() => buyComic(comic.id)}
              >
                Buy
              </button>
            )}

            {role === "ADMIN" && (
              <button
                type="button"
                className="pc-btn pc-btn-ghost"
                onClick={() => setEditingComic(comic)}
              >
                Edit
              </button>
            )}

            {role === "ADMIN" && (
              <button
                type="button"
                className="pc-btn pc-btn-danger"
                onClick={async () => {
                  if (!confirm("Are you sure you want to delete this comic?")) return;

                  const res = await fetch(`/api/comics/${comic.id}`, {
                    method: "DELETE",
                    credentials: "include",
                  });

                  const data = await res.json();

                  if (res.ok) {
                    alert(data.message);
                    setComics((prev) => prev.filter((c) => c.id !== comic.id));
                  } else {
                    alert(data.error);
                  }
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
)}

    {editingComic && (
  <div>
    <input
      value={editingComic.title}
      onChange={(e) =>
        setEditingComic({ ...editingComic, title: e.target.value })
      }
    />

    <input
      value={editingComic.description}
      onChange={(e) =>
        setEditingComic({ ...editingComic, description: e.target.value })
      }
    />

    <input
      value={editingComic.price}
      onChange={(e) =>
        setEditingComic({ ...editingComic, price: Number(e.target.value) })
      }
    />

    <input
      value={editingComic.imageUrl}
      onChange={(e) =>
        setEditingComic({ ...editingComic, imageUrl: e.target.value })
      }
    />

    <button
  style={{
    marginTop: 8,
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    background: "linear-gradient(90deg, #ff4da6, #ff85c1)",
    color: "#fff",
    boxShadow: "0 6px 15px rgba(255,77,166,0.3)",
    cursor: "pointer",
    fontSize: 12,
  }}
   onClick={updateComic}>Save</button>
    <button
  style={{
    marginTop: 8,
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    background: "linear-gradient(90deg, #ff4da6, #ff85c1)",
    color: "#fff",
    boxShadow: "0 6px 15px rgba(255,77,166,0.3)",
    cursor: "pointer",
    fontSize: 12,
  }}
  onClick={() => setEditingComic(null)}>Cancel</button>
  </div>
)}



<div
  style={{
    marginTop: 200,
    paddingTop: 30,
    borderTop: "1px solid rgba(255,255,255,0.12)",
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
    <a
      href="/about"
      style={{
        color: "var(--text)",
        textDecoration: "none",
        opacity: 0.85,
      }}
    >
      About us
    </a>

    <a
      href="/contact"
      style={{
        color: "var(--text)",
        textDecoration: "none",
        opacity: 0.85,
      }}
    >
      Contact
    </a>

    <a
      href="/faq"
      style={{
        color: "var(--text)",
        textDecoration: "none",
        opacity: 0.85,
      }}
    >
      FAQ
    </a>

    <a
      href="/terms"
      style={{
        color: "var(--text)",
        textDecoration: "none",
        opacity: 0.85,
      }}
    >
      Terms & Conditions
    </a>

    <a
      href="/privacy"
      style={{
        color: "var(--text)",
        textDecoration: "none",
        opacity: 0.85,
      }}
    >
      Privacy Policy
    </a>

    <a
      href="/refund-policy"
      style={{
        color: "var(--text)",
        textDecoration: "none",
        opacity: 0.85,
      }}
    >
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



<ComicPreviewModal
  comic={selectedComic}
  open={!!selectedComic}
  onClose={() => {
      setSelectedComic(null);
      // keep highlight
    }}
  onBuy={() => buyComic(selectedComic.id)}
  onRead={() => (window.location.href = `/read/${selectedComic.id}`)}
/>


<div
  style={{
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    padding: "14px 16px",
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(12px)",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    justifyContent: "center",
    zIndex: 100,
  }}
>
  <div
    style={{
      width: "100%",
      maxWidth: 900,
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center",
    }}
  >

    <p
  style={{
    width: "100%",
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
    textAlign: "center",
  }}
>
  Subscribe to receive emails on the latest uploads
</p>

    <input
      type="text"
      placeholder="👤 Name (optional)"
      value={newsletterName}
      onChange={(e) => setNewsletterName(e.target.value)}
      style={{
        flex: 1,
        minWidth: 140,
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.2)",
        background: "var(--card-bg)",
        color: "var(--text)",
        outline: "none",
      }}
    />

    <input
      type="email"
      placeholder="📧 Your email"
      value={newsletterEmail}
      onChange={(e) => setNewsletterEmail(e.target.value)}
      style={{
        flex: 2,
        minWidth: 180,
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.2)",
        background: "var(--card-bg)",
        color: "var(--text)",
        outline: "none",
      }}
    />

    <button
      onClick={subscribeNewsletter}
      style={{
        padding: "10px 16px",
        borderRadius: 8,
        border: "none",
        background: "linear-gradient(90deg, #ff4da6, #ff85c1)",
        color: "#fff",
        cursor: "pointer",
        boxShadow: "0 6px 15px rgba(255,77,166,0.25)",
        whiteSpace: "nowrap",
        fontWeight: 600,
      }}
    >
      Subscribe
    </button>
  </div>
</div>

  </div>
);
}

export default function ComicsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ComicsPageInner />
    </Suspense>
  );
}

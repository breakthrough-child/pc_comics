"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ComicPreviewModal from "../components/ComicPreviewModal";
import { useSearchParams } from "next/navigation";

type Comic = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  purchased: boolean;
};

export default function ComicsPage() {
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
  const res = await fetch("/api/stripe/checkout", {
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
      alert(data.error);
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
  <h1 style={{ fontSize: 28, fontWeight: 800 }}>
    💖 ComicVerse
  </h1>

  <div style={{ display: "flex", gap: 10 }}>
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
          <a href="/upload">
            <button
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                background: "#ffd6ec",
                color: "var(--text)",
                cursor: "pointer",
              }}
            >
              Upload
            </button>
          </a>
        )}

        <button
          onClick={logout}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: "#2b2b2b",
            color: "var(--text)",
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
  <h1 className="comics-title" style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1 }}>
    Comics Library
  </h1>
  <p style={{ opacity: 0.6 }}>
    Stream & own premium comics
  </p>
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
  
<div
  className="comics-grid"
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
      boxShadow:
        highlightedComicId === comic.id
          ? "0 0 0 2px #ff4da6, 0 20px 50px rgba(255,77,166,0.6)"
          : "0 10px 25px rgba(0,0,0,0.25)",
      transform:
        highlightedComicId === comic.id
          ? "scale(1.03)"
          : "none",
      transition: "all 0.3s ease", //"transform 0.25s ease, box-shadow 0.25s ease",
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

    onClick={(e) => {
  const target = e.target as HTMLElement;

  // prevent modal when clicking buttons or links
  if (
    target.tagName === "BUTTON" ||
    target.closest("button") ||
    target.tagName === "A" ||
    target.closest("a")
  ) return;

  setSelectedComic(comic);
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

      {/* PRICE BADGE */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "rgba(0,0,0,0.7)",
          padding: "4px 8px",
          borderRadius: 8,
          fontSize: 12,
          color: "#00ffcc",
          fontWeight: 600,
        }}
      >
        ${comic.price}
      </div>
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

      <div style={{ fontSize: 13, opacity: 0.8 }}>
        ⭐ {comic.avgRating ? comic.avgRating.toFixed(1) : "No rating"}
      </div>

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
        {comic.purchased ? (
          <a
            href={`/read/${comic.id}`}
            onClick={(e) => e.stopPropagation()}
          >
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
        ) : (
          <button
            className="comics-btn"
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(90deg, #ff4da6, #ff85c1)",
              color: "#fff",
              fontSize: 12,
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              buyComic(comic.id);
            }}
          >
            Buy
          </button>
        )}

        {role === "ADMIN" && (
          <button
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "none",
              background: "#333",
              color: "#fff",
              fontSize: 12,
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setEditingComic(comic);
            }}
          >
            Edit
          </button>
        )}

        {role === "ADMIN" && (
          <button
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "none",
              background: "#ff3b3b",
              color: "#fff",
              fontSize: 12,
              cursor: "pointer",
            }}
            onClick={async (e) => {
              e.stopPropagation();
              
              const confirmDelete = confirm("Are you sure you want to delete this comic?");
              if (!confirmDelete) return;

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

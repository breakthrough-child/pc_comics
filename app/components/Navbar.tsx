"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark";

    const initial = saved || "light";
    setTheme(initial);

    document.documentElement.setAttribute("data-theme", initial);
    }, []);

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
        .catch(() => {
          setUser(null);
          setRole(null);
        });
    }, []);


  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function toggleTheme() {
        const newTheme = theme === "light" ? "dark" : "light";

        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);

        document.documentElement.setAttribute("data-theme", newTheme);
        }

        const navBtn: React.CSSProperties = {
            padding: "8px 12px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(90deg, #ff4da6, #ff85c1)",
            color: "#fff",
            fontWeight: 600,
            boxShadow: "0 6px 15px rgba(255,77,166,0.25)",
            transition: "all 0.2s ease",
            };

        const mobileNavBtn: React.CSSProperties = {
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: "14px 16px",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.04)",
          color: "var(--text)",
          cursor: "pointer",
          fontWeight: 600,
          transition: "all .2s ease",
        };

            async function logout() {
              await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
              });

              setUser(null);
              setRole(null);

              router.push("/comics");
            }

  return (
  <>
    {isMobile && (
      <>
        {/* MENU BUTTON */}
        <button
          onClick={() => setMenuOpen(true)}
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1001,
            border: "none",
            background: "transparent",
            color: "var(--text)",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* OVERLAY */}
        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 1000,
            }}
          />
        )}

        {/* SIDEBAR */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: menuOpen ? 0 : "-320px",
            width: 300,
            height: "100vh",
            background: "var(--bg)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px)",
            transition: "left 0.3s ease",
            zIndex: 1001,
            padding: "24px 18px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              alignSelf: "flex-end",
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: "pointer",
            }}
          >
            ✕
          </button>

          <div
              style={{
                marginBottom: 30,
                paddingBottom: 18,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                }}
              >
                PC Comics
              </div>

              <div
                style={{
                  fontSize: 12,
                  opacity: 0.6,
                  marginTop: 4,
                }}
              >
                Read • Discover • Collect
              </div>
            </div>
          
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "100%",
        }}
      >


    {role === "ADMIN" && (
        <button
            onClick={() => {router.push("/admin/newsletter"); setMenuOpen(false);}}
            style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            background: "var(--primary)",
            color: "#fff",
            display: "flex",       // Forces items into a row
            alignItems: "center",
            }}
        >
            <>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ marginRight: 8 }}
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
  Subscribers
</>
        </button>
        )}

  {/* HOME */}
  <button
    onClick={() => {router.push("/comics"); setMenuOpen(false);}}
    style={mobileNavBtn}
  >
    <>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"   // Rounds out sharp path corners beautifully
    strokeLinejoin="round"  // Merges joint lines smoothly
    style={{ marginRight: 8 }}
  >
    {/* Modern, solid single-path house structure */}
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    {/* Clean, centered front door outline */}
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
  Home
</>
  </button>

  {/* LIBRARY */}
  <button
    onClick={() => {router.push("/library"); setMenuOpen(false);}}
    style={mobileNavBtn}
  >
    <>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ marginRight: 8 }}
  >
    {/* Clean, modern chat bubble path */}
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
  Mine
</>
  </button>
</div>

      {/* THEME */}
      <button
        onClick={toggleTheme}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: "14px 16px",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.04)",
          color: "var(--text)",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        <>
  {theme === "light" ? (
    <>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ marginRight: 8 }}
      >
        <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
      </svg>
      Dark
    </>
  ) : (
    <>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ marginRight: 8 }}
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
      </svg>
      Light
    </>
  )}
</>
      </button>

      <div
        style={{
          marginTop: "auto",
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
    {!user?.userId ? (
      <>
        <a href="/login">
          <button
            style={{
              width: "100%",
padding: "12px",
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
              width: "100%",
padding: "12px",
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
                width: "100%",
padding: "12px",
                borderRadius: 8,
                border: "none",
                background: "#fca6d1",
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
            width: "100%",
padding: "12px",
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
      </>
    )}

    {!isMobile && (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 20px",
      background: "transparent",
      color: "var(--text)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      transition: "all 0.3s ease",
      flexWrap: "wrap",
      gap: 10,
    }}
  >
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {role === "ADMIN" && (
        <button
          onClick={() => router.push("/admin/newsletter")}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            background: "var(--primary)",
            color: "#fff",
            display: "flex",       // Forces items into a row
            alignItems: "center",
          }}
        >
          <>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ marginRight: 8 }}
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
  Subscribers
</>
        </button>
      )}

      <button
        onClick={() => router.push("/comics")}
        style={{
    ...navBtn,
    display: "flex",
    alignItems: "center", // Perfectly centers the text vertically next to the SVG
    justifyContent: "center" // Optional: Centers the content inside the button
  }}

      >
        <>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"   // Rounds out sharp path corners beautifully
            strokeLinejoin="round"  // Merges joint lines smoothly
            style={{ marginRight: 8 }}
          >
            {/* Modern, solid single-path house structure */}
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            {/* Clean, centered front door outline */}
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </>
      </button>

      <button
        onClick={() => router.push("/library")}
        style={{
    ...navBtn,
    display: "flex",
    alignItems: "center", // Perfectly centers the text vertically next to the SVG
    justifyContent: "center" // Optional: Centers the content inside the button
  }}

      >
        <>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ marginRight: 8 }}
          >
            {/* Clean, modern chat bubble path */}
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Mine
        </>
      </button>
    </div>

    <button
      onClick={toggleTheme}
      style={{
        padding: "6px 10px",
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        background: "var(--primary)",
        color: "#fff",
        display: "flex",       // Forces items into a row
        alignItems: "center",
      }}
    >
      <>
  {theme === "light" ? (
    <>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ marginRight: 8 }}
      >
        <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
      </svg>
      Dark
    </>
  ) : (
    <>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ marginRight: 8 }}
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
      </svg>
      Light
    </>
  )}
</>
    </button>
  </div>
)}
  </>
  );
}
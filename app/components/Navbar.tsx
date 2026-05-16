"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark";

    const initial = saved || "light";
    setTheme(initial);

    document.documentElement.setAttribute("data-theme", initial);
    }, []);

    useEffect(() => {
  fetch("/api/me", {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      setRole(data.role);
    })
    .catch(() => setRole(null));
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

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        // background: "var(--bg)",
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
            }}
        >
            📧 Subscribers
        </button>
        )}

  {/* HOME */}
  <button
    onClick={() => router.push("/comics")}
    style={navBtn}
  >
    🏠 Home
  </button>

  {/* LIBRARY */}
  <button
    onClick={() => router.push("/library")}
    style={navBtn}
  >
    📚 Mine
  </button>
</div>

      {/* THEME */}
      <button
        onClick={toggleTheme}
        style={{
          padding: "6px 10px",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          background: "var(--primary)",
          color: "#fff",
        }}
      >
        {theme === "light" ? "🌙 Dark" : "☀ Light"}
      </button>
    </div>
  );
}
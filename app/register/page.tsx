"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // ✅ IMPORTANT
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/comics"); // auto-login behavior
    } else {
      alert(data.error);
    }
  }

  return (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "transparent",
      color: "var(--text)",
      fontFamily: "system-ui, sans-serif",
      transition: "all 0.3s ease",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: 380,
        padding: 30,
        borderRadius: 16,
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20 }}>
        💖 Create Account
      </h1>

      <p style={{ opacity: 0.7, marginBottom: 20 }}>
        Join ComicVerse and start your collection
      </p>

      <form
        onSubmit={handleRegister}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.1)",
            outline: "none",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.1)",
            outline: "none",
          }}
        />

        <button
          type="submit"
          style={{
            marginTop: 10,
            padding: "12px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            background: "linear-gradient(90deg, #ff4da6, #ff85c1)",
            color: "#fff",
            boxShadow: "0 10px 25px rgba(255,77,166,0.3)",
            transition: "transform 0.2s ease",
          }}
          onMouseDown={(e) =>
            (e.currentTarget.style.transform = "scale(0.97)")
          }
          onMouseUp={(e) =>
            (e.currentTarget.style.transform = "scale(1)")
          }
        >
          Create Account
        </button>

        <a
          href="/login"
          style={{
            fontSize: 12,
            opacity: 0.7,
            textAlign: "center",
            marginTop: 10,
            display: "block",
            color: "var(--text)",
            textDecoration: "none",
            cursor: "pointer",
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        >
          Already have an account? Login instead →
        </a>
      </form>
    </div>
  </div>
);
}
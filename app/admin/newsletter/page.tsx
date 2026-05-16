"use client";

import { useEffect, useState } from "react";

type Subscriber = {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
};

export default function AdminNewsletterPage() {
  const [data, setData] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/newsletter", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ padding: 20 }}>Loading subscribers...</p>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 20,
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <h1 style={{ marginBottom: 20 }}>📧 Newsletter Subscribers</h1>

      {data.length === 0 && <p>No subscribers yet.</p>}

      <div
        style={{
          display: "grid",
          gap: 12,
        }}
      >
        {data.map((user) => (
          <div
            key={user.id}
            style={{
              padding: 14,
              borderRadius: 10,
              background: "var(--card-bg)",
              boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              {user.name || "Anonymous"}
            </div>

            <div style={{ fontSize: 14, opacity: 0.8 }}>
              {user.email}
            </div>

            <div style={{ fontSize: 12, opacity: 0.6 }}>
              {new Date(user.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
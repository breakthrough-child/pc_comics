"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ComicContent = {
  pages: string[];
};

export default function ReadComicPage() {
  const { id } = useParams();

  const [content, setContent] = useState<ComicContent | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [newComment, setNewComment] = useState("");

  const isLastPage =
  page === (content?.pages.length || 0) - 1;

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`/api/comics/${id}/content`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Access denied");
          return;
        }

        setContent(data);
        setPage(0);
      } catch {
        setError("Failed to load comic");
      }
    }

    if (id) fetchContent();
  }, [id]);


  useEffect(() => {
  let interval: NodeJS.Timeout;

  async function loadComments() {
    const res = await fetch(`/api/comments/${id}`, {
      cache: "no-store", // 🔥 prevent stale data
    });

    const data = await res.json();

    setComments([]); // 🔥 force re-render
    setTimeout(() => {
      setComments(data);
    }, 0);
  }

  if (id) loadComments(); // initial load
}, [id]);


    async function refreshComments() {
  const res = await fetch(`/api/comments/${id}`, {
    cache: "no-store", // 🔥 FORCE fresh data
  });

  const data = await res.json();

  // setComments([]);        // 🔥 force React reset
  // setTimeout(() => {
  //   setComments(data);    // 🔥 ensures re-render
  // }, 0);

  setComments(data);
}


    async function likeComment(commentId: string) {

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                likes: c.likes?.length
                  ? [] // toggle (simple version)
                  : [{}],
              }
            : c
        )
      );
      
      await fetch("/api/comments/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ commentId }),
      });

      await refreshComments();
    }


          async function postComment() {
        await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            comicId: id,
            text: newComment,
            parentId: replyTo?.id || null,
          }),
        });

        setNewComment("");
        setReplyTo(null);
        await refreshComments();
      }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h2>🚫 Access Denied</h2>
        <p>{error}</p>
      </div>
    );
  }

if (!content?.pages || content.pages.length === 0) {
  return (
    <div style={{ padding: 20 }}>
      <h2>No pages found for this comic</h2>
    </div>
  );
}

return (
  <div
    style={{
      minHeight: "100vh",
      padding: "20px",
      background: "transparent",
      color: "var(--text)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: 900,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        backdropFilter: "blur(10px)",
      }}
    >
      <h1
        style={{
          fontSize: 22,
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        📖 Read Comic
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={content.pages[page]}
          style={{
            width: "100%",
            maxHeight: "75vh",
            objectFit: "contain",
            borderRadius: 12,
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          }}
        />
      </div>

      {/* NAVIGATION */}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            border: "none",
            cursor: page === 0 ? "not-allowed" : "pointer",
            background: page === 0 ? "#ccc" : "#ff4da6",
            color: "#fff",
          }}
        >
          ⬅ Prev
        </button>

        <span style={{ fontSize: 14, opacity: 0.8 }}>
          Page {page + 1} / {content.pages.length}
        </span>

        <button
          onClick={() =>
            setPage((p) => Math.min(p + 1, content.pages.length - 1))
          }
          disabled={page === content.pages.length - 1}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            border: "none",
            cursor:
              page === content.pages.length - 1 ? "not-allowed" : "pointer",
            background:
              page === content.pages.length - 1 ? "#ccc" : "#ff4da6",
            color: "#fff",
          }}
        >
          Next ➡
        </button>
      </div>


      {isLastPage && !submitted && (
  <div style={{ marginTop: 25, textAlign: "center" }}>
    <h3>⭐ Rate this comic</h3>

    <div style={{ marginBottom: 10 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => setRating(n)}
          style={{
            fontSize: 22,
            margin: 4,
            cursor: "pointer",
            background: "none",
            border: "none",
          }}
        >
          {n <= rating ? "⭐" : "☆"}
        </button>
      ))}
    </div>

    <textarea
      placeholder="Leave a comment..."
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      style={{
        width: "100%",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
      }}
    />

    <button
      onClick={async () => {
        const res = await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            comicId: id,
            rating,
            comment,
          }),
        });

        if (res.ok) {
          setSubmitted(true);
        } else {
          alert("Failed to submit review");
        }
      }}
      style={{
        padding: "10px 16px",
        borderRadius: 8,
        background: "#ff4da6",
        color: "#fff",
        border: "none",
        cursor: "pointer",
      }}
    >
      Submit Review
    </button>
  </div>
)}

<div style={{ marginTop: 40, width: "100%" }}>
  <h3>💬 Comments</h3>
</div>


<div style={{ marginTop: 10 }}>
  {replyTo && (
    <p style={{ fontSize: 13, opacity: 0.7 }}>
      Replying to <b>{replyTo.user?.email}</b>
    </p>
  )}

  <textarea
    value={newComment}
    onChange={(e) => setNewComment(e.target.value)}
    placeholder="Write a comment..."
    style={{
      width: "100%",
      padding: 10,
      borderRadius: 8,
      marginTop: 5,
    }}
  />

  <button
    onClick={postComment}
    style={{
      marginTop: 8,
      padding: "8px 14px",
      background: "#ff4da6",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
    }}
  >
    Post
  </button>
</div>



<div style={{ marginTop: 20 }}>
  {comments
  .filter((c) => !c.parentId) // 🔥 ONLY ROOT COMMENTS
  .map((c) => (
    <div
      key={c.id}
      style={{
        padding: 12,
        marginBottom: 10,
        borderRadius: 10,
        background: "rgba(255,255,255,0.05)",
      }}
    >
      <p style={{ marginBottom: 5 }}>
        <b>{c.user?.email}</b>
      </p>

      <p>{c.text}</p>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button
          onClick={() => setReplyTo(c)}
          style={{ fontSize: 12 }}
        >
          Reply
        </button>

        <button
          onClick={() => likeComment(c.id)}
          style={{ fontSize: 12 }}
        >
          ❤️ {c.likes?.length || 0}
        </button>
      </div>

      {/* REPLIES */}
      <div style={{ marginLeft: 20, marginTop: 10 }}>
        {comments
          .filter((r) => r.parentId === c.id)
          .map((r) => (
            <div key={r.id} style={{ marginTop: 8 }}>
              <p style={{ fontSize: 13 }}>
                <b>{r.user?.email}</b> → replying to {c.user?.email}
              </p>

              <p style={{ fontSize: 13 }}>{r.text}</p>

              <button
                onClick={() => likeComment(r.id)}
                style={{ fontSize: 12 }}
              >
                ❤️ {r.likes?.length || 0}
              </button>
            </div>
          ))}
      </div>
    </div>
  ))}
</div>


    </div>
  </div>
);
}
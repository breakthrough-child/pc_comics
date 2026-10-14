"use client";

import { useCallback, useEffect, useState } from "react";

type Comment = {
  id: string;
  text: string;
  parentId?: string | null;
  user?: { email?: string };
  likes?: any[];
};

type Props = {
  /** GET endpoint returning a flat list of comments */
  listUrl: string;
  /** POST endpoint for new comments */
  postUrl: string;
  /** Extra fields sent with every new comment, e.g. { storyId } */
  postBody: Record<string, string>;
  /** "dark" for the comic reader, "auto" follows the site theme */
  tone?: "auto" | "dark";
};

function displayName(email?: string) {
  return email ? email.split("@")[0] : "Reader";
}

export default function CommentsSection({
  listUrl,
  postUrl,
  postBody,
  tone = "auto",
}: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(listUrl, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("COMMENTS FETCH ERROR:", err);
    }
  }, [listUrl]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function like(commentId: string) {
    const res = await fetch("/api/comments/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ commentId }),
    });

    if (res.status === 401) {
      window.location.assign("/login");
      return;
    }

    refresh();
  }

  async function post() {
    if (!text.trim() || posting) return;

    setPosting(true);

    try {
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...postBody,
          text: text.trim(),
          parentId: replyTo?.id || null,
        }),
      });

      if (res.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || "Failed to post comment");
        return;
      }

      setText("");
      setReplyTo(null);
      refresh();
    } finally {
      setPosting(false);
    }
  }

  const bubble =
    tone === "dark"
      ? "rgba(255,255,255,0.05)"
      : "rgba(128,128,128,0.08)";

  const roots = comments.filter((c) => !c.parentId);

  return (
    <div>
      <h3 style={{ margin: "0 0 14px", fontSize: 18 }}>
        Comments{" "}
        <span style={{ opacity: 0.5, fontWeight: 500 }}>
          {comments.length || ""}
        </span>
      </h3>

      {replyTo && (
        <p style={{ fontSize: 13, opacity: 0.75, margin: "0 0 6px" }}>
          Replying to <b>{displayName(replyTo.user?.email)}</b>{" "}
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            style={{
              border: "none",
              background: "none",
              color: "var(--primary)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            cancel
          </button>
        </p>
      )}

      <textarea
        className={tone === "dark" ? undefined : "pc-input"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share your thoughts..."
        rows={3}
        style={{ resize: "vertical" }}
      />

      <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          className="pc-btn"
          onClick={post}
          disabled={posting || !text.trim()}
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </div>

      <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
        {roots.length === 0 && (
          <p style={{ opacity: 0.55, textAlign: "center", margin: "10px 0" }}>
            No comments yet. Be the first.
          </p>
        )}

        {roots.map((c) => (
          <div
            key={c.id}
            style={{ padding: 14, borderRadius: 14, background: bubble }}
          >
            <b style={{ fontSize: 13 }}>{displayName(c.user?.email)}</b>
            <p
              style={{
                margin: "6px 0 0",
                lineHeight: 1.55,
                fontSize: 14,
                overflowWrap: "anywhere",
              }}
            >
              {c.text}
            </p>

            <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 12 }}>
              <button type="button" onClick={() => setReplyTo(c)} style={linkBtn}>
                Reply
              </button>
              <button type="button" onClick={() => like(c.id)} style={linkBtn}>
                ♥ {c.likes?.length || 0}
              </button>
            </div>

            {comments
              .filter((r) => r.parentId === c.id)
              .reverse()
              .map((r) => (
                <div
                  key={r.id}
                  style={{
                    marginTop: 10,
                    marginLeft: 14,
                    paddingLeft: 12,
                    borderLeft: "2px solid rgba(255,77,166,0.35)",
                  }}
                >
                  <b style={{ fontSize: 12.5 }}>{displayName(r.user?.email)}</b>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {r.text}
                  </p>
                  <button
                    type="button"
                    onClick={() => like(r.id)}
                    style={{ ...linkBtn, fontSize: 12, marginTop: 4 }}
                  >
                    ♥ {r.likes?.length || 0}
                  </button>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  border: "none",
  background: "none",
  padding: 0,
  color: "inherit",
  opacity: 0.75,
  cursor: "pointer",
  fontWeight: 600,
};

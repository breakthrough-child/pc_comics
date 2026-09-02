"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Story = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverImage?: string | null;
  price: number;
  content: any;
  isPublished: boolean;
  purchased: boolean;
};

function renderNode(node: any, key: string | number): React.ReactNode {
  if (!node) return null;

  const marks = node.marks || [];

  const renderText = (text: string) => {
    let result: React.ReactNode = text;

    for (const mark of marks) {
      switch (mark.type) {
        case "bold":
          result = <strong>{result}</strong>;
          break;

        case "italic":
          result = <em>{result}</em>;
          break;

        case "underline":
          result = <u>{result}</u>;
          break;

        case "strike":
          result = <s>{result}</s>;
          break;

        case "link":
          result = (
            <a
              href={mark.attrs?.href}
              target={
                mark.attrs?.target === "_blank"
                  ? "_blank"
                  : undefined
              }
              rel={
                mark.attrs?.target === "_blank"
                  ? "noopener noreferrer"
                  : undefined
              }
              style={{
                color: "#ff4da6",
                textDecoration: "underline",
              }}
            >
              {result}
            </a>
          );
          break;

        case "textStyle":
          result = (
            <span
              style={{
                color: mark.attrs?.color || undefined,
                fontSize: mark.attrs?.fontSize || undefined,
              }}
            >
              {result}
            </span>
          );
          break;

        case "highlight":
          result = (
            <mark
              style={{
                backgroundColor:
                  mark.attrs?.color || "#fff59d",
              }}
            >
              {result}
            </mark>
          );
          break;

        default:
          break;
      }
    }

    return result;
  };

  switch (node.type) {
    case "text":
      return (
        <span key={key}>
          {renderText(node.text || "")}
        </span>
      );

    case "paragraph":
      return (
        <p
          key={key}
          style={{
  margin: "0 0 1.2em",
  lineHeight: 1.85,
  fontSize: "clamp(16px, 2.5vw, 18px)",
  overflowWrap: "break-word",
}}
        >
          {node.content?.map((child: any, index: number) =>
            renderNode(child, `${key}-${index}`)
          )}
        </p>
      );

    case "heading": {
      const level = node.attrs?.level || 1;

      const headingStyles: Record<number, React.CSSProperties> = {
  1: {
    fontSize: "clamp(26px, 5vw, 32px)",
    lineHeight: 1.25,
    margin: "1.8em 0 0.7em",
    fontWeight: 800,
    overflowWrap: "break-word",
  },
  2: {
    fontSize: "clamp(22px, 4.5vw, 26px)",
    lineHeight: 1.3,
    margin: "1.6em 0 0.6em",
    fontWeight: 750,
    overflowWrap: "break-word",
  },
  3: {
    fontSize: "clamp(19px, 4vw, 22px)",
    lineHeight: 1.35,
    margin: "1.4em 0 0.5em",
    fontWeight: 700,
    overflowWrap: "break-word",
  },
};

      const style = headingStyles[level] || headingStyles[1];

      if (level === 1) {
        return (
          <h1 key={key} style={style}>
            {node.content?.map((child: any, index: number) =>
              renderNode(child, `${key}-${index}`)
            )}
          </h1>
        );
      }

      if (level === 2) {
        return (
          <h2 key={key} style={style}>
            {node.content?.map((child: any, index: number) =>
              renderNode(child, `${key}-${index}`)
            )}
          </h2>
        );
      }

      return (
        <h3 key={key} style={style}>
          {node.content?.map((child: any, index: number) =>
            renderNode(child, `${key}-${index}`)
          )}
        </h3>
      );
    }

    case "blockquote":
      return (
        <blockquote
          key={key}
          style={{
            margin: "1.5em 0",
            padding: "12px clamp(12px, 4vw, 20px)",
            borderLeft: "4px solid #ff4da6",
            background: "rgba(255,77,166,0.08)",
            borderRadius: "0 8px 8px 0",
            fontStyle: "italic",
            lineHeight: 1.7,
          }}
        >
          {node.content?.map((child: any, index: number) =>
            renderNode(child, `${key}-${index}`)
          )}
        </blockquote>
      );

    case "bulletList":
      return (
        <ul
          key={key}
          style={{
            margin: "1em 0",
            fontSize: "clamp(16px, 2.5vw, 18px)",
lineHeight: 1.8,
paddingLeft: "clamp(20px, 5vw, 30px)",
overflowWrap: "break-word",
          }}
        >
          {node.content?.map((child: any, index: number) =>
            renderNode(child, `${key}-${index}`)
          )}
        </ul>
      );

    case "orderedList":
      return (
        <ol
          key={key}
          style={{
            margin: "1em 0",
            fontSize: "clamp(16px, 2.5vw, 18px)",
lineHeight: 1.8,
paddingLeft: "clamp(20px, 5vw, 30px)",
overflowWrap: "break-word",
          }}
        >
          {node.content?.map((child: any, index: number) =>
            renderNode(child, `${key}-${index}`)
          )}
        </ol>
      );

    case "listItem":
      return (
        <li key={key}>
          {node.content?.map((child: any, index: number) =>
            renderNode(child, `${key}-${index}`)
          )}
        </li>
      );

    case "horizontalRule":
      return (
        <hr
          key={key}
          style={{
            border: 0,
            borderTop:
              "1px solid rgba(128,128,128,0.3)",
            margin: "2em 0",
          }}
        />
      );

    case "image":
      return (
        <figure
          key={key}
          style={{
            margin: "2em 0",
            textAlign:
              node.attrs?.align === "center"
                ? "center"
                : node.attrs?.align === "right"
                ? "right"
                : "left",
          }}
        >
          <img
            src={node.attrs?.src}
            alt={node.attrs?.alt || ""}
            style={{
              width: node.attrs?.width || "auto",
              maxWidth: "100%",
              height: "auto",
              borderRadius: 10,
              display: "inline-block",
            }}
          />

          {node.attrs?.title && (
            <figcaption
              style={{
                marginTop: 8,
                fontSize: 13,
                opacity: 0.6,
              }}
            >
              {node.attrs.title}
            </figcaption>
          )}
        </figure>
      );

    case "hardBreak":
      return <br key={key} />;

    default:
      return (
        <div key={key}>
          {node.content?.map((child: any, index: number) =>
            renderNode(child, `${key}-${index}`)
          )}
        </div>
      );
  }
}

export default function StoryReaderPage() {
  const params = useParams();
  const router = useRouter();

  const storyId = params?.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");
    const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [comments, setComments] = useState<any[]>([]);
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!storyId) return;

    async function fetchStory() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `/api/stories/${storyId}`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(
            data.error || "Failed to load story"
          );
          return;
        }

        setStory(data.story || data);
      } catch (err) {
        console.error("STORY FETCH ERROR:", err);
        setError("Failed to load story");
      } finally {
        setLoading(false);
      }
    }

    fetchStory();
  }, [storyId]);



    useEffect(() => {
    if (!storyId || !story?.purchased) return;

    async function loadComments() {
      try {
        const res = await fetch(`/api/stories/comments/${storyId}`, {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          setComments(data);
        } else {
          setComments([]);
        }
      } catch (err) {
        console.error("STORY COMMENTS FETCH ERROR:", err);
      }
    }

    loadComments();
  }, [storyId, story?.purchased]);

  async function refreshComments() {
    try {
      const res = await fetch(`/api/stories/comments/${storyId}`, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();

      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("STORY COMMENTS REFRESH ERROR:", err);
    }
  }

  async function likeComment(commentId: string) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              likes: c.likes?.length ? [] : [{}],
            }
          : c
      )
    );

    try {
      await fetch("/api/stories/comments/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          commentId,
        }),
      });

      await refreshComments();
    } catch (err) {
      console.error("STORY COMMENT LIKE ERROR:", err);
      await refreshComments();
    }
  }

  async function postComment() {
    if (!newComment.trim()) return;

    try {
      const res = await fetch("/api/stories/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          storyId,
          text: newComment.trim(),
          parentId: replyTo?.id || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to post comment");
        return;
      }

      setNewComment("");
      setReplyTo(null);

      await refreshComments();
    } catch (err) {
      console.error("STORY COMMENT POST ERROR:", err);
      alert("Failed to post comment");
    }
  }

  async function submitReview() {
    if (rating < 1) {
      alert("Please select a rating");
      return;
    }

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          storyId,
          rating,
          comment: reviewComment,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);

        alert(data?.error || "Failed to submit review");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("STORY REVIEW ERROR:", err);
      alert("Failed to submit review");
    }
  }



  async function buyStory() {
    try {
      setBuying(true);

      const res = await fetch(
        "/api/paystack/story-checkout",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storyId,
          }),
        }
      );

      const data = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        alert(
          data.error || "Checkout failed"
        );
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(
          "Payment URL was not returned"
        );
      }
    } catch (err) {
      console.error(
        "STORY CHECKOUT ERROR:",
        err
      );

      alert(
        "Unable to start payment"
      );
    } finally {
      setBuying(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text)",
        }}
      >
        Loading story...
      </div>
    );
  }

  if (error || !story) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: 40,
          textAlign: "center",
          color: "var(--text)",
        }}
      >
        <h2>
          {error || "Story not found"}
        </h2>

        <button
          onClick={() => router.push("/stories")}
          style={{
            marginTop: 15,
            padding: "10px 18px",
            border: "none",
            borderRadius: 9,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Back to Stories
        </button>
      </div>
    );
  }

  /*
   * The story itself should only be visible to
   * users who have purchased it.
   */
  if (!story.purchased) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "clamp(24px, 6vw, 40px) clamp(14px, 5vw, 20px)",
          color: "var(--text)",
          fontFamily:
            "system-ui, sans-serif",
        }}
      >
        <article
          style={{
            maxWidth: 850,
            margin: "0 auto",
          }}
        >
          {story.coverImage && (
            <img
              src={story.coverImage}
              alt={story.title}
              style={{
                width: "100%",
                maxHeight: 520,
                objectFit: "cover",
                borderRadius: 16,
                display: "block",
                marginBottom: 30,
              }}
            />
          )}

          <h1
  style={{
    fontSize: "clamp(30px, 7vw, 42px)",
    lineHeight: 1.15,
    marginBottom: 10,
    fontWeight: 850,
    overflowWrap: "break-word",
  }}
>
            {story.title}
          </h1>

          {story.subtitle && (
  <p
    style={{
      fontSize: "clamp(17px, 4vw, 20px)",
      lineHeight: 1.5,
      opacity: 0.65,
      fontStyle: "italic",
      marginBottom: 20,
      overflowWrap: "break-word",
    }}
  >
    {story.subtitle}
  </p>
)}

          {story.description && (
  <p
    style={{
      fontSize: "clamp(16px, 3vw, 17px)",
      lineHeight: 1.7,
      opacity: 0.8,
      overflowWrap: "break-word",
    }}
  >
    {story.description}
  </p>
)}

          <div
            style={{
              marginTop: 30,
              padding: "clamp(18px, 5vw, 24px)",
              borderRadius: 14,
              background:
                "rgba(255,255,255,0.06)",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              This story is locked
            </h2>

            <p
              style={{
                opacity: 0.65,
              }}
            >
              Purchase this story to read
              the complete article.
            </p>

            <button
              type="button"
              onClick={buyStory}
              disabled={buying}
              style={{
                marginTop: 10,
                padding: "13px clamp(18px, 5vw, 24px)",
maxWidth: "100%",
                borderRadius: 10,
                border: "none",
                cursor: buying
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "bold",
                background: buying
                  ? "#999"
                  : "linear-gradient(90deg, #ff4da6, #ff85c1)",
                color: "#fff",
                boxShadow:
                  "0 6px 15px rgba(255,77,166,0.3)",
              }}
            >
              {buying
                ? "Processing..."
                : `Buy for ₦${story.price.toLocaleString()}`}
            </button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div
  style={{
    minHeight: "100vh",
    padding: "clamp(24px, 6vw, 40px) clamp(14px, 5vw, 20px) 80px",
    color: "var(--text)",
    fontFamily:
      "system-ui, sans-serif",
  }}
>
      <article
  style={{
    width: "100%",
    maxWidth: 850,
    margin: "0 auto",
  }}
>
        {/* COVER */}
        {story.coverImage && (
          <img
            src={story.coverImage}
            alt={story.title}
            style={{
  width: "100%",
  maxWidth: "100%",
  maxHeight: 560,
  objectFit: "cover",
  borderRadius: "clamp(10px, 3vw, 16px)",
  display: "block",
  marginBottom: "clamp(24px, 6vw, 35px)",
}}
          />
        )}

        {/* TITLE */}
        <header
          style={{
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize:
                "clamp(30px, 6vw, 56px)",
              lineHeight: 1.1,
              margin: 0,
              fontWeight: 850,
              overflowWrap: "break-word",
            }}
          >
            {story.title}
          </h1>

          {story.subtitle && (
            <p
              style={{
                fontSize: "clamp(16px, 3.5vw, 20px)",
                lineHeight: 1.5,
                opacity: 0.65,
                fontStyle: "italic",
                margin:
                  "14px auto 0",
                maxWidth: 650,
                overflowWrap: "break-word",
              }}
            >
              {story.subtitle}
            </p>
          )}
        </header>

        {/* DIVIDER */}
        <div
          style={{
            width: "100%",
            height: 1,
            background:
              "rgba(128,128,128,0.25)",
            marginBottom: 40,
          }}
        />

        {/* STORY CONTENT */}
        <div
  style={{
    width: "100%",
    maxWidth: 780,
    margin: "0 auto",
    overflowWrap: "break-word",
    wordBreak: "break-word",
  }}
>
          {story.content?.content?.map(
            (node: any, index: number) =>
              renderNode(node, index)
          )}
        </div>

        {/* END OF STORY */}
        <div
          style={{
            marginTop: 60,
            paddingTop: 25,
            borderTop:
              "1px solid rgba(128,128,128,0.25)",
            textAlign: "center",
            opacity: 0.55,
          }}
        >
          End of story
        </div>

                {/* STORY REVIEW */}
        {!submitted && (
          <div
            style={{
              marginTop: 50,
              paddingTop: 30,
              borderTop:
                "1px solid rgba(128,128,128,0.25)",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                marginBottom: 10,
              }}
            >
              ⭐ Rate this story
            </h3>

            <div
              style={{
                marginBottom: 12,
              }}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  style={{
                    fontSize: 24,
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
              placeholder="Leave a review..."
              value={reviewComment}
              onChange={(e) =>
                setReviewComment(e.target.value)
              }
              style={{
                width: "100%",
                minHeight: 100,
                boxSizing: "border-box",
maxWidth: "100%",
                padding: 12,
                borderRadius: 10,
                border:
                  "1px solid rgba(128,128,128,0.25)",
                background:
                  "rgba(255,255,255,0.05)",
                color: "var(--text)",
                resize: "vertical",
              }}
            />

            <button
              type="button"
              onClick={submitReview}
              style={{
                marginTop: 10,
                padding: "10px 18px",
                borderRadius: 9,
                background: "#ff4da6",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Submit Review
            </button>
          </div>
        )}

        {submitted && (
          <div
            style={{
              marginTop: 40,
              padding: 18,
              borderRadius: 12,
              background:
                "rgba(255,77,166,0.08)",
              textAlign: "center",
            }}
          >
            ⭐ Thank you for reviewing this story.
          </div>
        )}

        {/* COMMENTS */}
        <div
          style={{
            marginTop: 50,
            paddingTop: 30,
            borderTop:
              "1px solid rgba(128,128,128,0.25)",
          }}
        >
          <h3
            style={{
              marginBottom: 18,
            }}
          >
            💬 Comments
          </h3>

          {replyTo && (
            <p
              style={{
                fontSize: 13,
                opacity: 0.7,
                marginBottom: 8,
              }}
            >
              Replying to{" "}
              <b>{replyTo.user?.email}</b>
            </p>
          )}

          <textarea
            value={newComment}
            onChange={(e) =>
              setNewComment(e.target.value)
            }
            placeholder="Write a comment..."
            style={{
              width: "100%",
              minHeight: 90,
              boxSizing: "border-box",
maxWidth: "100%",
              padding: 12,
              borderRadius: 10,
              border:
                "1px solid rgba(128,128,128,0.25)",
              background:
                "rgba(255,255,255,0.05)",
              color: "var(--text)",
              resize: "vertical",
            }}
          />

          <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  }}
>
            <button
              type="button"
              onClick={postComment}
              style={{
                padding: "9px 15px",
                background: "#ff4da6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Post
            </button>

            {replyTo && (
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setNewComment("");
                }}
                style={{
                  padding: "9px 15px",
                  background:
                    "rgba(128,128,128,0.2)",
                  color: "var(--text)",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Cancel Reply
              </button>
            )}
          </div>

          <div
            style={{
              marginTop: 25,
            }}
          >
            {comments.length === 0 ? (
              <p
                style={{
                  opacity: 0.55,
                  textAlign: "center",
                }}
              >
                No comments yet. Be the first to
                comment.
              </p>
            ) : (
              comments
                .filter((c) => !c.parentId)
                .map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: 14,
                      marginBottom: 12,
                      borderRadius: 12,
                      background:
                        "rgba(255,255,255,0.05)",
                    }}
                  >
                    <p
                      style={{
  margin: "0 0 6px",
  overflowWrap: "anywhere",
}}
                    >
                      <b>{c.user?.email}</b>
                    </p>

                    <p
                      style={{
  margin: 0,
  lineHeight: 1.6,
  overflowWrap: "anywhere",
}}
                    >
                      {c.text}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 10,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setReplyTo(c)
                        }
                        style={{
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        Reply
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          likeComment(c.id)
                        }
                        style={{
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        ❤️ {c.likes?.length || 0}
                      </button>
                    </div>

                    {/* REPLIES */}
                    <div
                      style={{
                        marginLeft: 20,
                        marginTop: 12,
                      }}
                    >
                      {comments
                        .filter(
                          (r) =>
                            r.parentId === c.id
                        )
                        .map((r) => (
                          <div
                            key={r.id}
                            style={{
                              marginTop: 10,
                              padding: 10,
                              borderRadius: 8,
                              background:
                                "rgba(255,255,255,0.04)",
                            }}
                          >
                            <p
                              style={{
  fontSize: 13,
  margin: "0 0 5px",
  overflowWrap: "anywhere",
}}
                            >
                              <b>
                                {r.user?.email}
                              </b>{" "}
                              → replying to{" "}
                              {c.user?.email}
                            </p>

                            <p
                              style={{
  fontSize: 14,
  margin: 0,
  lineHeight: 1.5,
  overflowWrap: "anywhere",
}}
                            >
                              {r.text}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                likeComment(
                                  r.id
                                )
                              }
                              style={{
                                marginTop: 7,
                                fontSize: 12,
                                cursor: "pointer",
                              }}
                            >
                              ❤️{" "}
                              {r.likes?.length ||
                                0}
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
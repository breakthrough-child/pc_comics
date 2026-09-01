"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import StoryEditor from "../../components/StoryEditor";

type StoryContent = {
  type: string;
  content?: any[];
  attrs?: Record<string, any>;
};

type Story = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverImage?: string | null;
  price: number;
  content: StoryContent;
  isPublished: boolean;
};

export default function EditStoryPage() {
  const router = useRouter();
  const params = useParams();

  const storyId = params.id as string;

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [sendNewsletter, setSendNewsletter] = useState(false);

  const [content, setContent] = useState<StoryContent>({
    type: "doc",
    content: [
      {
        type: "paragraph",
      },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    async function loadStory() {
      try {
        const meRes = await fetch("/api/me", {
          credentials: "include",
          cache: "no-store",
        });

        const me = await meRes.json();

        if (me.role !== "ADMIN") {
          router.push("/comics");
          return;
        }

        const res = await fetch(`/api/stories/${storyId}`, {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to load story");
          router.push("/stories");
          return;
        }

        const story: Story = data.story || data;

        setTitle(story.title || "");
        setSubtitle(story.subtitle || "");
        setDescription(story.description || "");
        setPrice(
          story.price !== undefined && story.price !== null
            ? String(story.price)
            : ""
        );
        setCoverImage(story.coverImage || "");
        setContent(
          story.content || {
            type: "doc",
            content: [
              {
                type: "paragraph",
              },
            ],
          }
        );
        setIsPublished(Boolean(story.isPublished));
      } catch (error) {
        console.error("LOAD STORY ERROR:", error);
        alert("Failed to load story");
        router.push("/stories");
      } finally {
        setLoading(false);
      }
    }

    if (storyId) {
      loadStory();
    }
  }, [router, storyId]);

  async function uploadCover(): Promise<string | null> {
    if (!coverFile) {
      return coverImage || null;
    }

    const formData = new FormData();
    formData.append("files", coverFile);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Cover upload failed");
    }

    if (!data.pages || !data.pages[0]) {
      throw new Error("Cover upload did not return an image URL");
    }

    return data.pages[0];
  }

  async function saveStory(publish: boolean) {
    if (!title.trim()) {
      alert("Enter a story title");
      return;
    }

    if (!description.trim()) {
      alert("Enter a story description/excerpt");
      return;
    }

    if (!content || content.type !== "doc") {
      alert("Add some story content");
      return;
    }

    const numericPrice = Number(price);

    if (
      price.trim() === "" ||
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      alert("Enter a valid price");
      return;
    }

    setSaving(true);

    try {
      const uploadedCoverUrl = await uploadCover();

      const res = await fetch(`/api/stories/${storyId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          description: description.trim(),
          coverImage: uploadedCoverUrl,
          price: numericPrice,
          content,
          isPublished: publish,
          sendNewsletter,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update story");
        return;
      }

      setIsPublished(publish);

      alert(
        data.message ||
          (publish
            ? "Story published successfully"
            : "Story saved as draft")
      );

      if (publish) {
        router.push("/stories");
      }
    } catch (error: any) {
      console.error("UPDATE STORY ERROR:", error);

      alert(
        error?.message ||
          "Something went wrong while saving the story"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteStory() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this story?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

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
      router.push("/stories");
    } catch (error) {
      console.error("DELETE STORY ERROR:", error);
      alert("Failed to delete story");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: "12px",
    borderRadius: 10,
    border:
      "1px solid var(--input-border, rgba(0,0,0,0.15))",
    background:
      "var(--input-bg, rgba(255,255,255,0.6))",
    color: "var(--text)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const fileStyle: React.CSSProperties = {
    padding: "10px",
    borderRadius: 10,
    border: "1px dashed rgba(255,77,166,0.5)",
    background: "rgba(255,255,255,0.03)",
    color: "inherit",
    width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 6,
    marginBottom: 4,
  };

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
        <p>Loading story...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "transparent",
        color: "var(--text)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1000,
          margin: "0 auto",
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          borderRadius: 16,
          padding: 24,
          boxShadow:
            "0 10px 30px rgba(255,77,166,0.15)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                margin: 0,
                marginBottom: 6,
              }}
            >
              Edit Story
            </h1>

            <p
              style={{
                margin: 0,
                opacity: 0.65,
                fontSize: 14,
              }}
            >
              Continue writing, update the story, save the
              draft, or publish it.
            </p>
          </div>

          <span
            style={{
              padding: "7px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              background: isPublished
                ? "rgba(0,255,180,0.12)"
                : "rgba(255,180,0,0.12)",
              color: isPublished
                ? "#00ffcc"
                : "#ffcc66",
            }}
          >
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* TITLE */}
          <div>
            <label style={labelStyle}>Title</label>

            <input
              placeholder="Story title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                ...inputStyle,
                fontSize: 18,
                fontWeight: 600,
              }}
            />
          </div>

          {/* SUBTITLE */}
          <div>
            <label style={labelStyle}>Subtitle</label>

            <input
              placeholder="Story subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label style={labelStyle}>
              Description / Excerpt
            </label>

            <textarea
              placeholder="Short description or excerpt for the story..."
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={4}
              style={{
                ...inputStyle,
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* PRICE */}
          <div>
            <label style={labelStyle}>Price</label>

            <input
              placeholder="Price in ₦"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              style={inputStyle}
            />
          </div>

          {/* COVER IMAGE URL */}
          <div>
            <label style={labelStyle}>
              Cover Image URL
            </label>

            <input
              placeholder="https://..."
              value={coverImage}
              onChange={(e) =>
                setCoverImage(e.target.value)
              }
              inputMode="url"
              style={inputStyle}
            />
          </div>

          {/* COVER IMAGE UPLOAD */}
          <div>
            <label style={labelStyle}>
              Replace cover image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setCoverFile(
                  e.target.files?.[0] || null
                )
              }
              style={fileStyle}
            />
          </div>

          {/* COVER PREVIEW */}
          {(coverImage || coverFile) && (
            <div
              style={{
                marginTop: 4,
                padding: 12,
                borderRadius: 12,
                background: "rgba(0,0,0,0.08)",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  marginTop: 0,
                }}
              >
                Cover Preview
              </p>

              <img
                src={
                  coverFile
                    ? URL.createObjectURL(coverFile)
                    : coverImage
                }
                alt="Story cover preview"
                style={{
                  width: "100%",
                  maxWidth: 320,
                  maxHeight: 420,
                  objectFit: "cover",
                  borderRadius: 10,
                  display: "block",
                }}
              />
            </div>
          )}

          {/* STORY EDITOR */}
          <div style={{ marginTop: 8 }}>
            <label style={labelStyle}>
              Story Content
            </label>

            <StoryEditor
              content={content}
              onChange={setContent}
            />
          </div>

          {/* NEWSLETTER */}

<label
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    cursor: "pointer",
  }}
>
  <input
    type="checkbox"
    checked={sendNewsletter}
    onChange={(e) =>
      setSendNewsletter(e.target.checked)
    }
  />

  Send newsletter to subscribers when published
</label>

          {/* ACTIONS */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 14,
            }}
          >
            {/* SAVE DRAFT */}
            <button
              type="button"
              onClick={() => saveStory(false)}
              disabled={saving}
              style={{
                flex: "1 1 180px",
                padding: "13px 18px",
                borderRadius: 10,
                border:
                  "1px solid rgba(255,255,255,0.15)",
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "bold",
                background: saving ? "#999" : "#444",
                color: "#fff",
              }}
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>

            {/* PUBLISH */}
            <button
              type="button"
              onClick={() => saveStory(true)}
              disabled={saving}
              style={{
                flex: "1 1 180px",
                padding: "13px 18px",
                borderRadius: 10,
                border: "none",
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "bold",
                background: saving
                  ? "#999"
                  : "linear-gradient(90deg, #ff4da6, #ff85c1)",
                color: "#fff",
                boxShadow:
                  "0 6px 15px rgba(255,77,166,0.3)",
              }}
            >
              {saving
                ? "Publishing..."
                : "Publish Story"}
            </button>

            {/* DELETE */}
            <button
              type="button"
              onClick={deleteStory}
              disabled={saving}
              style={{
                flex: "1 1 140px",
                padding: "13px 18px",
                borderRadius: 10,
                border: "1px solid rgba(255,80,80,0.35)",
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "bold",
                background:
                  "rgba(255,60,60,0.12)",
                color: "#ff7777",
              }}
            >
              Delete Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
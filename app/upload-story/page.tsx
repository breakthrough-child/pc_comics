"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StoryEditor from "../components/StoryEditor";

type StoryContent = {
  type: string;
  content?: any[];
  attrs?: Record<string, any>;
};

export default function UploadStoryPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [content, setContent] = useState<StoryContent>({
    type: "doc",
    content: [
      {
        type: "paragraph",
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (data.role !== "ADMIN") {
          router.push("/comics");
        }
      } catch (error) {
        console.error("Admin check failed:", error);
        router.push("/comics");
      }
    }

    checkAdmin();
  }, [router]);

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

  async function saveStory(isPublished: boolean) {
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

    if (price.trim() === "" || Number.isNaN(numericPrice) || numericPrice < 0) {
      alert("Enter a valid price");
      return;
    }

    setLoading(true);

    try {
      const uploadedCoverUrl = await uploadCover();

      const res = await fetch("/api/stories", {
        method: "POST",
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
          isPublished,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create story");
        return;
      }

      setPublished(isPublished);

      alert(
        data.message ||
          (isPublished
            ? "Story published successfully"
            : "Story saved as draft")
      );

      if (isPublished) {
        setTitle("");
        setSubtitle("");
        setDescription("");
        setPrice("");
        setCoverImage("");
        setCoverFile(null);

        setContent({
          type: "doc",
          content: [
            {
              type: "paragraph",
            },
          ],
        });
      } else if (data.story?.id) {
        router.push(`/upload-story/${data.story.id}`);
      }
    } catch (error: any) {
      console.error("STORY SAVE ERROR:", error);

      alert(
        error?.message ||
          "Something went wrong while saving the story"
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: "12px",
    borderRadius: 10,
    border: "1px solid var(--input-border, rgba(0,0,0,0.15))",
    background: "var(--input-bg, rgba(255,255,255,0.6))",
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
          boxShadow: "0 10px 30px rgba(255,77,166,0.15)",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 6,
          }}
        >
          Write a Story
        </h1>

        <p
          style={{
            marginTop: 0,
            marginBottom: 24,
            opacity: 0.65,
            fontSize: 14,
          }}
        >
          Create a rich written story with images, formatting,
          links and more.
        </p>

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
              onChange={(e) => setDescription(e.target.value)}
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
              onChange={(e) => setCoverImage(e.target.value)}
              inputMode="url"
              style={inputStyle}
            />
          </div>

          {/* COVER IMAGE UPLOAD */}
          <div>
            <label style={labelStyle}>
              Or upload a cover image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setCoverFile(e.target.files?.[0] || null)
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
              disabled={loading}
              style={{
                flex: "1 1 180px",
                padding: "13px 18px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "bold",
                background: loading
                  ? "#999"
                  : "#444",
                color: "#fff",
              }}
            >
              {loading
                ? "Saving..."
                : "Save Draft"}
            </button>

            {/* PUBLISH */}
            <button
              type="button"
              onClick={() => saveStory(true)}
              disabled={loading}
              style={{
                flex: "1 1 180px",
                padding: "13px 18px",
                borderRadius: 10,
                border: "none",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "bold",
                background: loading
                  ? "#999"
                  : "linear-gradient(90deg, #ff4da6, #ff85c1)",
                color: "#fff",
                boxShadow:
                  "0 6px 15px rgba(255,77,166,0.3)",
              }}
            >
              {loading
                ? "Publishing..."
                : "Publish Story"}
            </button>
          </div>

          {published && (
            <p
              style={{
                marginBottom: 0,
                fontSize: 13,
                opacity: 0.7,
              }}
            >
              Story published successfully.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
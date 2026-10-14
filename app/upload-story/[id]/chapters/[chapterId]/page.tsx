"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StoryEditor from "../../../../components/StoryEditor";
import ChapterSettings, {
  ChapterSettingsValue,
  validateChapterSettings,
} from "../../../../components/ChapterSettings";

type StoryContent = {
  type: string;
  content?: any[];
  attrs?: Record<string, any>;
};

const emptyDoc: StoryContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export default function ChapterEditorPage() {
  const router = useRouter();
  const params = useParams();

  const storyId = params.id as string;
  const chapterId = params.chapterId as string;
  const isNew = chapterId === "new";

  const [storyTitle, setStoryTitle] = useState("");
  const [number, setNumber] = useState<number | undefined>();
  const [settings, setSettings] = useState<ChapterSettingsValue>({
    title: "",
    isFree: false,
    price: "",
  });
  const [content, setContent] = useState<StoryContent>(emptyDoc);
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
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

        const storyRes = await fetch(`/api/stories/${storyId}`, {
          credentials: "include",
          cache: "no-store",
        });
        const storyData = await storyRes.json();

        if (!storyRes.ok) {
          alert(storyData.error || "Story not found");
          router.push("/stories");
          return;
        }

        setStoryTitle(storyData.story.title);

        if (isNew) {
          const chapters = storyData.story.chapters || [];
          const nextNumber =
            chapters.reduce(
              (max: number, c: { number: number }) => Math.max(max, c.number),
              0
            ) + 1;
          const previous = chapters[chapters.length - 1];

          setNumber(nextNumber);
          setSettings({
            title: `Chapter ${nextNumber}`,
            isFree: false,
            // Default to the price of the previous paid chapter.
            price:
              previous && !previous.isFree ? String(previous.price) : "",
          });
          return;
        }

        const res = await fetch(`/api/chapters/${chapterId}`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Chapter not found");
          router.push(`/upload-story/${storyId}`);
          return;
        }

        setNumber(data.chapter.number);
        setSettings({
          title: data.chapter.title,
          isFree: data.chapter.isFree,
          price: data.chapter.isFree ? "" : String(data.chapter.price),
        });
        setContent(data.chapter.content || emptyDoc);
        setIsPublished(data.chapter.isPublished);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [chapterId, isNew, router, storyId]);

  async function save(publish: boolean) {
    const settingsError = validateChapterSettings(settings);

    if (settingsError) {
      alert(settingsError);
      return;
    }

    setSaving(true);

    try {
      const body = {
        title: settings.title.trim(),
        content,
        isFree: settings.isFree,
        price: settings.isFree ? 0 : Number(settings.price),
        isPublished: publish,
      };

      const res = await fetch(
        isNew
          ? `/api/stories/${storyId}/chapters`
          : `/api/chapters/${chapterId}`,
        {
          method: isNew ? "POST" : "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save chapter");
        return;
      }

      router.push(`/upload-story/${storyId}`);
    } catch (error) {
      console.error("SAVE CHAPTER ERROR:", error);
      alert("Something went wrong while saving the chapter");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="pc-page" style={{ textAlign: "center", paddingTop: 80 }}>
        Loading chapter...
      </div>
    );
  }

  return (
    <div className="pc-page" style={{ maxWidth: 1000 }}>
      <div
        className="pc-card"
        style={{ padding: "clamp(14px, 4vw, 24px)", display: "grid", gap: 16 }}
      >
        <div>
          <a
            href={`/upload-story/${storyId}`}
            style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none" }}
          >
            ← {storyTitle || "Back to book"}
          </a>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 28px)", margin: "8px 0 0" }}>
            {isNew ? `New chapter${number ? ` (${number})` : ""}` : `Edit chapter ${number}`}
          </h1>
          {!isNew && (
            <span
              className={`pc-chip ${isPublished ? "pc-chip-free" : "pc-chip-muted"}`}
              style={{ marginTop: 8 }}
            >
              {isPublished ? "Visible to readers" : "Hidden from readers"}
            </span>
          )}
        </div>

        <ChapterSettings value={settings} onChange={setSettings} number={number} />

        <div>
          <label className="pc-label">Chapter content</label>
          <StoryEditor content={content} onChange={setContent} />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            className="pc-btn pc-btn-ghost"
            onClick={() => save(false)}
            disabled={saving}
            style={{ flex: "1 1 180px" }}
          >
            {saving ? "Saving..." : "Save as hidden"}
          </button>
          <button
            type="button"
            className="pc-btn"
            onClick={() => save(true)}
            disabled={saving}
            style={{ flex: "1 1 180px" }}
          >
            {saving ? "Saving..." : "Save & publish chapter"}
          </button>
        </div>
      </div>
    </div>
  );
}

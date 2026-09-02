"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEffect, useState } from "react";

type StoryEditorProps = {
  content?: any;
  onChange?: (content: any) => void;
};

export default function StoryEditor({
  content,
  onChange,
}: StoryEditorProps) {
  const [preview, setPreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit,

      Underline,

      TextStyle,

      Color,

      Highlight.configure({
        multicolor: true,
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),

      Image.configure({
        inline: false,
        allowBase64: false,
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    content: content || {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
},

    onUpdate({ editor }) {
      onChange?.(editor.getJSON());
    },
    });

  useEffect(() => {
    if (!editor || !content) {
      return;
    }

    const currentContent = editor.getJSON();

    if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
      editor.commands.setContent(content, {
        emitUpdate: false,
      });
    }
  }, [editor, content]);

  if (!editor) {
    return (
      <div
        style={{
          padding: 20,
          borderRadius: 12,
          background: "rgba(255,255,255,0.05)",
        }}
      >
        Loading editor...
      </div>
    );
  }

  async function uploadImage(file: File) {
    setUploadingImage(true);

    try {
      const formData = new FormData();

      formData.append("files", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Image upload failed");
        return;
      }

      const imageUrl = data.pages?.[0];

      if (!imageUrl) {
        alert("Image URL was not returned");
        return;
      }

            if (!editor) {
        alert("Editor is not ready");
        return;
      }

      editor
        .chain()
        .focus()
        .setImage({
          src: imageUrl,
        })
        .run();
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  }

  function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    uploadImage(file);

    event.target.value = "";
  }

  function addLink() {
  if (!editor) {
    alert("Editor is not ready");
    return;
  }

  const previousUrl = editor.getAttributes("link").href;

    const url = window.prompt(
      "Enter URL:",
      previousUrl || "https://"
    );

    if (url === null) return;

    if (url === "") {
      editor
        .chain()
        .focus()
        .unsetLink()
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url,
        target: "_blank",
      })
      .run();
  }

  function setFontSize(size: string) {
  if (!editor) {
    alert("Editor is not ready");
    return;
  }

  editor
    .chain()
    .focus()
    .setMark("textStyle", {
      fontSize: size,
    })
    .run();
}

function setTextColor(color: string) {
  if (!editor) {
    alert("Editor is not ready");
    return;
  }

  editor
    .chain()
    .focus()
    .setColor(color)
    .run();
}

function setHighlight(color: string) {
  if (!editor) {
    alert("Editor is not ready");
    return;
  }

  editor
    .chain()
    .focus()
    .toggleHighlight({
      color,
    })
    .run();
}

  const buttonStyle: React.CSSProperties = {
    border: "1px solid var(--input-border, rgba(0,0,0,0.15))",
    background: "var(--input-bg, rgba(255,255,255,0.7))",
    color: "var(--text)",
    borderRadius: 7,
    padding: "7px 9px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "var(--primary, #ff4da6)",
    color: "#fff",
  };

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 14,
        overflow: "hidden",
        border:
          "1px solid var(--input-border, rgba(0,0,0,0.15))",
        background: "var(--card-bg, rgba(255,255,255,0.7))",
        boxShadow:
          "var(--card-shadow, 0 10px 30px rgba(255,77,166,0.12))",
      }}
    >
      {/* TOOLBAR */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          padding: 10,
          borderBottom:
            "1px solid var(--input-border, rgba(0,0,0,0.15))",
          background: "rgba(255,255,255,0.08)",
        }}
      >
        {/* HEADINGS */}

        <button
          type="button"
          style={
            editor.isActive("heading", { level: 1 })
              ? activeButtonStyle
              : buttonStyle
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 1 })
              .run()
          }
        >
          H1
        </button>

        <button
          type="button"
          style={
            editor.isActive("heading", { level: 2 })
              ? activeButtonStyle
              : buttonStyle
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 2 })
              .run()
          }
        >
          H2
        </button>

        <button
          type="button"
          style={
            editor.isActive("heading", { level: 3 })
              ? activeButtonStyle
              : buttonStyle
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 3 })
              .run()
          }
        >
          H3
        </button>

        <button
          type="button"
          style={
            editor.isActive("paragraph")
              ? activeButtonStyle
              : buttonStyle
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .setParagraph()
              .run()
          }
        >
          P
        </button>

        {/* TEXT FORMATTING */}

        <button
          type="button"
          style={
            editor.isActive("bold")
              ? activeButtonStyle
              : buttonStyle
          }
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          style={
            editor.isActive("italic")
              ? activeButtonStyle
              : buttonStyle
          }
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
        >
          <em>I</em>
        </button>

        <button
          type="button"
          style={
            editor.isActive("underline")
              ? activeButtonStyle
              : buttonStyle
          }
          onClick={() =>
            editor.chain().focus().toggleUnderline().run()
          }
        >
          <u>U</u>
        </button>

        <button
          type="button"
          style={
            editor.isActive("strike")
              ? activeButtonStyle
              : buttonStyle
          }
          onClick={() =>
            editor.chain().focus().toggleStrike().run()
          }
        >
          <s>S</s>
        </button>

        {/* LISTS */}

        <button
          type="button"
          style={
            editor.isActive("bulletList")
              ? activeButtonStyle
              : buttonStyle
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
        >
          • List
        </button>

        <button
          type="button"
          style={
            editor.isActive("orderedList")
              ? activeButtonStyle
              : buttonStyle
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
        >
          1. List
        </button>

        {/* QUOTE */}

        <button
          type="button"
          style={
            editor.isActive("blockquote")
              ? activeButtonStyle
              : buttonStyle
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBlockquote()
              .run()
          }
        >
          Quote
        </button>

        {/* HORIZONTAL RULE */}

        <button
          type="button"
          style={buttonStyle}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setHorizontalRule()
              .run()
          }
        >
          Divider
        </button>

        {/* ALIGNMENT */}

        <button
          type="button"
          style={buttonStyle}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("left")
              .run()
          }
        >
          Left
        </button>

        <button
          type="button"
          style={buttonStyle}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("center")
              .run()
          }
        >
          Center
        </button>

        <button
          type="button"
          style={buttonStyle}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("right")
              .run()
          }
        >
          Right
        </button>

        <button
          type="button"
          style={buttonStyle}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("justify")
              .run()
          }
        >
          Justify
        </button>

        {/* FONT SIZE */}

        <select
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) {
              setFontSize(event.target.value);
            }
          }}
          style={{
            ...buttonStyle,
            minWidth: 90,
          }}
        >
          <option value="">Font Size</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="28px">28px</option>
          <option value="32px">32px</option>
          <option value="40px">40px</option>
        </select>

        {/* TEXT COLOR */}

        <label
          style={{
            ...buttonStyle,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          Text
          <input
            type="color"
            defaultValue="#000000"
            onChange={(event) =>
              setTextColor(event.target.value)
            }
            style={{
              width: 28,
              height: 24,
              padding: 0,
              border: "none",
              cursor: "pointer",
            }}
          />
        </label>

        {/* HIGHLIGHT */}

        <label
          style={{
            ...buttonStyle,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          Highlight
          <input
            type="color"
            defaultValue="#fff59d"
            onChange={(event) =>
              setHighlight(event.target.value)
            }
            style={{
              width: 28,
              height: 24,
              padding: 0,
              border: "none",
              cursor: "pointer",
            }}
          />
        </label>

        {/* LINK */}

        <button
          type="button"
          style={
            editor.isActive("link")
              ? activeButtonStyle
              : buttonStyle
          }
          onClick={addLink}
        >
          Link
        </button>

        {/* IMAGE */}

        <label
          style={{
            ...buttonStyle,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {uploadingImage
            ? "Uploading..."
            : "Insert Image"}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage}
            style={{ display: "none" }}
          />
        </label>

        {/* PREVIEW */}

        <button
          type="button"
          style={
            preview ? activeButtonStyle : buttonStyle
          }
          onClick={() => setPreview((value) => !value)}
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {/* EDITOR / PREVIEW */}

      <div
        style={{
          padding: 20,
          minHeight: 450,
          background: "rgba(255,255,255,0.04)",
        }}
      >
        {preview ? (
          <div
            style={{
              maxWidth: 800,
              margin: "0 auto",
            }}
          >
            <div
              className="story-preview-content"
              dangerouslySetInnerHTML={{
                __html: editor.getHTML(),
              }}
            />
          </div>
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      {/* EDITOR HELP */}

      <div
        style={{
          padding: "8px 12px",
          fontSize: 11,
          opacity: 0.55,
          borderTop:
            "1px solid var(--input-border, rgba(0,0,0,0.1))",
        }}
      >
        Select text and use the toolbar to format your story.
        Images are uploaded to your existing Cloudinary upload
        system.
      </div>
    </div>
  );
}
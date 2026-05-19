"use client";

import { useState, useRef } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewIndexes, setPreviewIndexes] = useState<number[]>([]);
  const [sendNewsletter, setSendNewsletter] = useState(false);

  useEffect(() => {
  async function checkAdmin() {
    const res = await fetch("/api/me", {
      credentials: "include",
    });

    const data = await res.json();

    if (data.role !== "ADMIN") {
      router.push("/comics");
    }
  }

  checkAdmin();
}, []);

  async function submit() {
    setLoading(true);

    if (!files || files.length === 0) {
      alert("Select comic pages first");
      setLoading(false);
      return;
    }


    let uploadedCoverUrl = imageUrl;

    // If user uploaded a cover file → upload it
    if (coverFile) {
      const coverForm = new FormData();
      coverForm.append("files", coverFile);

      const coverRes = await fetch("/api/upload", {
        method: "POST",
        body: coverForm,
      });

      const coverData = await coverRes.json();

      if (!coverRes.ok) {
        alert(coverData.error);
        setLoading(false);
        return;
      }

      uploadedCoverUrl = coverData.pages[0]; // first image = cover
    }

    // 1. Upload images first
    // const formData = new FormData();

    // Array.from(files || []).forEach((file) => {
    //   formData.append("files", file);
    // });

    // const uploadRes = await fetch("/api/upload", {
    //   method: "POST",
    //   body: formData,
    // });

    // const uploadData = await uploadRes.json();

    // if (!uploadRes.ok) {
    //   alert(uploadData.error);
    //   setLoading(false);
    //   return;
    // }


    const uploadedPages: string[] = [];

for (const file of Array.from(files || [])) {
  const formData = new FormData();

  formData.append("files", file);

  const uploadRes = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const uploadData = await uploadRes.json();

  if (!uploadRes.ok) {
    alert(uploadData.error || "Upload failed");

    setLoading(false);

    return;
  }

  uploadedPages.push(uploadData.pages[0]);
}

    // 2. Save comic
    const res = await fetch("/api/comics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title,
        description,
        price: Number(price),
        imageUrl: uploadedCoverUrl,
        // pages: uploadData.pages,
        pages: uploadedPages,
        // previewPages: previewIndexes.map((i) => uploadData.pages[i]),
        previewPages: previewIndexes.map((i) => uploadedPages[i]),
      }),
    });

    const data = await res.json();

    if (res.ok && sendNewsletter) {
      await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comicId: data.comic.id,
          title: data.comic.title,
        }),
      });
    }

    alert(data.message || data.error);

    // RESET FORM STATE AFTER SUCCESS
    setTitle("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setFiles(null);
    setCoverFile(null);
    fileInputRef.current && (fileInputRef.current.value = "");

    setLoading(false);
  }


  const inputStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: 10,
  border: "1px solid var(--input-border, rgba(0,0,0,0.15))",
  background: "var(--input-bg, rgba(255,255,255,0.6))",
  color: "var(--text)",
  outline: "none",
};

const fileStyle: React.CSSProperties = {
  padding: "10px",
  borderRadius: 10,
  border: "1px dashed rgba(255,77,166,0.5)",
  background: "rgba(255,255,255,0.03)",
  color: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.7,
  marginTop: 6,
};


  return (
  <div
    style={{
      minHeight: "100vh",
      padding: "24px",
      //background: "var(--bg)",
      background: "transparent",
      color: "var(--text)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "system-ui, sans-serif",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: 520,
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 10px 30px rgba(255,77,166,0.15)",
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>
        Upload Comic
      </h1>

      {/* FORM GRID */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
          inputMode="text"
        />

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={inputStyle}
          inputMode="text"
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={inputStyle}
          inputMode="numeric"
        />

        <input
          placeholder="Cover Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={inputStyle}
          inputMode="url"
        />

        <label style={labelStyle}>Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          style={fileStyle}
        />

        <label style={labelStyle}>Comic Pages</label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(e.target.files)}
          style={fileStyle}
        />

        {/* PREVIEW */}
        {files && (
          <div style={{ marginTop: 10 }}>
            <h3 style={{ fontSize: 14, opacity: 0.7 }}>Preview</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                gap: 8,
              }}
            >
              {Array.from(files).map((file, i) => (

                
                <div
  key={i}
  onClick={() => {
    setPreviewIndexes((prev) =>
      prev.includes(i)
        ? prev.filter((x) => x !== i)
        : [...prev, i]
    );
  }}
  style={{
    position: "relative",
    cursor: "pointer",
    border:
      previewIndexes.includes(i)
        ? "3px solid #ff4da6"
        : "2px solid transparent",
    borderRadius: 8,
  }}
>

  <img
  src={URL.createObjectURL(file)}
  style={{
    width: "100%",
    height: 80,
    objectFit: "cover",
    borderRadius: 8,
  }}
/> </div>
              ))}
            </div>
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={submit}
          disabled={loading}
          style={{
            marginTop: 10,
            padding: "12px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            background: loading
              ? "#999"
              : "linear-gradient(90deg, #ff4da6, #ff85c1)",
            color: "#fff",
            boxShadow: "0 6px 15px rgba(255,77,166,0.3)",
          }}
        >
          {loading ? "Uploading..." : "Upload Comic"}
        </button>

        <label style={{ fontSize: 12 }}>
          <input
            type="checkbox"
            checked={sendNewsletter}
            onChange={(e) => setSendNewsletter(e.target.checked)}
          />
          Send newsletter to subscribers
        </label>
      </div>
    </div>
  </div>
);
}
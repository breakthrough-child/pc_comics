"use client";

import React from "react";

type Comic = {
  id: string;
  title: string;
  description: string;
  price: number;
  avgRating?: number;
  purchased?: boolean;
  pages?: string[];
};

type Props = {
  comic: Comic | null;
  open: boolean;
  onClose: () => void;
  onBuy: () => void;
  onRead: () => void;
};

export default function ComicPreviewModal({
  comic,
  open,
  onClose,
  onBuy,
  onRead,
}: Props) {
  if (!open || !comic) return null;

  const [previewIndex, setPreviewIndex] = React.useState(0);
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);

  const previewImages = (comic.previewPages?.length
        ? comic.previewPages
        : comic.pages
        )?.slice(0, 3) || [];


        React.useEffect(() => {
            if (showToast) {
                const t = setTimeout(() => setShowToast(false), 2000);
                return () => clearTimeout(t);
            }
            }, [showToast]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 900,
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: 16,

          // 🌗 THEME AWARE (works with your CSS variables)
          background: "var(--card-bg)",
          color: "var(--text)",

          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* HEADER */}
        <div style={{ padding: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{comic.title}</h2>

          <p style={{ opacity: 0.8, fontSize: 13, marginTop: 6 }}>
            ⭐ {comic.avgRating?.toFixed(1) || "No rating"} • ${comic.price}
          </p>
        </div>


        {/* PREVIEW IMAGES
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 8,
            padding: 10,
          }}
        >
          {(comic.previewPages?.length
  ? comic.previewPages
  : comic.pages || []
).slice(0, 3).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`preview-${i}`}
              style={{
                width: "100%",
                height: 180,
                objectFit: "cover",
                borderRadius: 10,
              }}
            />
          ))}
        </div> */}


                {/* PREVIEW SLIDER */}
{previewImages.length > 0 && (
  <div
    style={{
      padding: 12,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
    }}
  >
    {/* IMAGE DISPLAY */}
    <div
      style={{
        width: "100%",
        maxHeight: 420,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        overflow: "hidden",
        background: "rgba(0,0,0,0.2)",
      }}
    >
      <img
        src={previewImages[previewIndex]}
        alt={`preview-${previewIndex}`}
        style={{
          width: "100%",
          maxHeight: 420,
          objectFit: "contain",
          transition: "all 0.3s ease",
        }}
      />
    </div>

    {/* CONTROLS */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <button
        onClick={() =>
          setPreviewIndex((p) => Math.max(p - 1, 0))
        }
        disabled={previewIndex === 0}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          border: "none",
          background: previewIndex === 0
            ? "rgba(100,100,100,0.2)"
            : "rgba(255,77,166,0.6)",
          color: "#fff",
          cursor: previewIndex === 0 ? "not-allowed" : "pointer",
        }}
      >
        ◀
      </button>

      <span style={{ fontSize: 12, opacity: 0.8 }}>
        {previewIndex + 1} / {previewImages.length}
      </span>

      <button
        onClick={() =>
          setPreviewIndex((p) =>
            Math.min(p + 1, previewImages.length - 1)
          )
        }
        disabled={previewIndex === previewImages.length - 1}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          border: "none",
          background:
            previewIndex === previewImages.length - 1
              ? "rgba(100,100,100,0.2)"
              : "rgba(255,77,166,0.6)",
          color: "#fff",
          cursor:
            previewIndex === previewImages.length - 1
              ? "not-allowed"
              : "pointer",
        }}
      >
        ▶
      </button>
    </div>
  </div>
)}



        {/* DESCRIPTION */}
        <div style={{ padding: 16 }}>
          <h4 style={{ marginBottom: 8 }}>Description</h4>

          <p
            style={{
              opacity: 0.85,
              fontSize: 14,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {comic.description}
          </p>
        </div>

        {/* ACTIONS */}
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: 16,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >


            <button
                onClick={async () => {
                    const shareUrl = `${window.location.origin}/comics?preview=${comic.id}`;

                    const shareText = `🔥 Check out "${comic.title}" on our platform!\n\nRead premium comics here:\n${shareUrl}`;

                    try {
                    if (navigator.share) {
                        await navigator.share({
                        title: comic.title,
                        text: shareText,
                        url: shareUrl,
                        });
                    } else {
                        await navigator.clipboard.writeText(shareUrl);
                        //alert("Link copied to clipboard!");
                        setShowShareMenu(true); // 👈 open custom UI
                    }
                    } catch (err) {
                    console.error(err);
                    }
                }}
                style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(90deg, #00c6ff, #0072ff)",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                }}
                >
                Share
                </button>

          <button
            onClick={onClose}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "none",
              background: "rgba(100,100,100,0.3)",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            Close
          </button>

          {comic.purchased ? (
            <button
              onClick={onRead}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(90deg, #ff4da6, #ff85c1)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Read
            </button>
          ) : (
            <button
              onClick={onBuy}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(90deg, #ff4da6, #ff85c1)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Buy
            </button>
          )}
        </div>
      </div>

{showShareMenu && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.65)",
      display: "flex",
      alignItems: "flex-end", // 👈 better mobile UX (bottom sheet)
      justifyContent: "center",
      zIndex: 10000,
      padding: "env(safe-area-inset-bottom) 10px 10px",
    }}
    onClick={() => setShowShareMenu(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        maxWidth: 420,
        maxHeight: "90vh",
        overflowY: "auto",

        background: "var(--card-bg)",
        borderRadius: "20px 20px 12px 12px",
        padding: "16px 14px 20px",

        display: "flex",
        flexDirection: "column",
        gap: 12,

        boxShadow: "0 -10px 40px rgba(0,0,0,0.5)",
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center" }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>Share Comic</h3>
        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
          Invite others to preview this comic
        </p>
      </div>

      {(() => {
        const url = `${window.location.origin}/comics?preview=${comic.id}`;
        const text = `🔥 Check out "${comic.title}"\n\n${url}`;

        const btnStyle = {
          padding: "12px",
          borderRadius: 12,
          color: "#fff",
          textAlign: "center" as const,
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 500,
        };

        return (
          <>
            {/* WhatsApp */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(text)}`}
              target="_blank"
              style={{ ...btnStyle, background: "#25D366" }}
            >
              WhatsApp
            </a>

            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(
                url
              )}&text=${encodeURIComponent(text)}`}
              target="_blank"
              style={{ ...btnStyle, background: "#0088cc" }}
            >
              Telegram
            </a>

            {/* Twitter */}
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                url
              )}&text=${encodeURIComponent(text)}`}
              target="_blank"
              style={{ ...btnStyle, background: "#000" }}
            >
              Twitter
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                url
              )}`}
              target="_blank"
              style={{ ...btnStyle, background: "#1877f2" }}
            >
              Facebook
            </a>

            {/* Instagram workaround */}
            <div
              onClick={async () => {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              style={{
                ...btnStyle,
                background: "#E1306C",
                cursor: "pointer",
              }}
            >
              Instagram (Copy Link)
            </div>

            {/* Copy */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(url);
                setShowToast(true);
              }}
              style={{
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: "#333",
                color: "#fff",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Copy Link
            </button>
          </>
        );
      })()}
    </div>
  </div>
)}


{showToast && (
  <div
    style={{
      position: "fixed",
      bottom: 30,
      left: "50%",
      transform: "translateX(-50%)",
      background: "linear-gradient(90deg, #ff4da6, #ff85c1)",
      color: "#fff",
      padding: "10px 18px",
      borderRadius: 999,
      fontSize: 13,
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      animation: "fadeSlide 0.3s ease",
      zIndex: 10001,
    }}
  >
    Link copied 🚀
  </div>
)}



    </div>
  );
}
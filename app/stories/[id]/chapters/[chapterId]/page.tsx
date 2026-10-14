"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import StoryContent, {
  CoinIcon,
  LockIcon,
  lastReadKey,
} from "../../../../components/StoryContent";

type ChapterLink = {
  id: string;
  number: number;
  title: string;
  isFree: boolean;
  price: number;
  canRead: boolean;
};

type ChapterData = {
  chapter: {
    id: string;
    storyId: string;
    number: number;
    title: string;
    isFree: boolean;
    price: number;
    isPublished: boolean;
    canRead: boolean;
    content: any;
  };
  story: { id: string; title: string; coverImage?: string | null };
  chapters: ChapterLink[];
  prev: ChapterLink | null;
  next: ChapterLink | null;
  coins: number;
  isLoggedIn: boolean;
};

const FONT_SIZES = [16, 17, 18, 19, 20, 22, 24];
const FONT_KEY = "reader:fontSize";

function ChapterReader() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const storyId = params?.id as string;
  const chapterId = params?.chapterId as string;

  const [data, setData] = useState<ChapterData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [barHidden, setBarHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fontIndex, setFontIndex] = useState(3);
  const [toast, setToast] = useState("");
  const lastScroll = useRef(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/chapters/${chapterId}`, {
        credentials: "include",
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to load chapter");
        return;
      }

      setData(json);
      setError("");
    } catch {
      setError("Failed to load chapter");
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    if (chapterId) load();
  }, [chapterId, load]);

  // Remember reading position and preferences.
  useEffect(() => {
    if (!data?.chapter.canRead) return;

    try {
      localStorage.setItem(lastReadKey(storyId), data.chapter.id);
    } catch {}
  }, [data, storyId]);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(FONT_KEY));
      const index = FONT_SIZES.indexOf(saved);
      if (index >= 0) setFontIndex(index);
    } catch {}
  }, []);

  function changeFont(delta: number) {
    setFontIndex((current) => {
      const next = Math.min(Math.max(current + delta, 0), FONT_SIZES.length - 1);
      try {
        localStorage.setItem(FONT_KEY, String(FONT_SIZES[next]));
      } catch {}
      return next;
    });
  }

  // Coins just bought on Paystack.
  useEffect(() => {
    const status = searchParams.get("coins");

    if (status === "success") {
      setToast(`${searchParams.get("added") || ""} coins added to your wallet`);
    } else if (status === "failed" || status === "error") {
      setToast("Coin payment was not completed");
    }

    if (status) {
      const timer = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Hide the top bar while scrolling down, show it when scrolling up.
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      setProgress(max > 0 ? Math.min(100, (y / max) * 100) : 0);
      setBarHidden(y > 120 && y > lastScroll.current);
      lastScroll.current = y;
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [data]);

  // Arrow keys move between chapters.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea")) return;

      if (e.key === "ArrowRight" && data?.next) goTo(data.next.id);
      if (e.key === "ArrowLeft" && data?.prev) goTo(data.prev.id);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function goTo(id: string) {
    setDrawerOpen(false);
    router.push(`/stories/${storyId}/chapters/${id}`);
    window.scrollTo({ top: 0 });
  }

  async function unlock(target: ChapterLink | ChapterData["chapter"]) {
    if (!data) return;

    if (!data.isLoggedIn) {
      router.push("/login");
      return;
    }

    setUnlocking(target.id);
    setUnlockError("");

    try {
      const res = await fetch(`/api/chapters/${target.id}/unlock`, {
        method: "POST",
        credentials: "include",
      });

      const json = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        setUnlockError(json.error || "Could not unlock chapter");
        return;
      }

      if (target.id === chapterId) {
        await load();
      } else {
        goTo(target.id);
      }
    } finally {
      setUnlocking(null);
    }
  }

  if (loading) {
    return (
      <div className="reader-shell" style={{ display: "grid", placeItems: "center" }}>
        <p style={{ opacity: 0.6 }}>Opening chapter...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="reader-shell" style={{ display: "grid", placeItems: "center", padding: 20 }}>
        <div style={{ textAlign: "center" }}>
          <h2>{error || "Chapter not found"}</h2>
          <a className="pc-btn" href={`/stories/${storyId}`}>
            Back to the book
          </a>
        </div>
      </div>
    );
  }

  const { chapter, story, chapters, prev, next, coins } = data;
  const returnTo = `/stories/${storyId}/chapters/${chapterId}`;

  return (
    <div
      className="reader-shell"
      style={{ ["--reader-size" as any]: `${FONT_SIZES[fontIndex]}px` }}
    >
      {/* TOP BAR */}
      <header className={`reader-topbar ${barHidden && !drawerOpen ? "is-hidden" : ""}`}>
        <a className="reader-icon-btn" href={`/stories/${storyId}`} aria-label="Back to the book">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </a>

        <div className="reader-heading">
          <small>{story.title}</small>
          <strong>
            Ch. {chapter.number} · {chapter.title}
          </strong>
        </div>

        <button className="reader-icon-btn" onClick={() => changeFont(-1)} aria-label="Smaller text">
          A−
        </button>
        <button className="reader-icon-btn" onClick={() => changeFont(1)} aria-label="Larger text">
          A+
        </button>
        <button className="reader-icon-btn" onClick={() => setDrawerOpen(true)} aria-label="Chapters">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
          </svg>
        </button>

        <div className="reader-progress" style={{ width: `${progress}%` }} />
      </header>

      {/* CHAPTER */}
      <article className="reader-article">
        <div className="reader-chapter-label">Chapter {chapter.number}</div>
        <h1 className="reader-chapter-title">{chapter.title}</h1>
        <div className="reader-ornament">✦ ✦ ✦</div>

        {!chapter.isPublished && (
          <p className="pc-chip pc-chip-paid" style={{ margin: "0 auto 24px", display: "table" }}>
            Draft chapter — only admins can see this
          </p>
        )}

        {chapter.canRead ? (
          <StoryContent content={chapter.content} className="drop-cap" />
        ) : (
          <UnlockCard
            target={chapter}
            coins={coins}
            isLoggedIn={data.isLoggedIn}
            busy={unlocking === chapter.id}
            error={unlockError}
            returnTo={returnTo}
            onUnlock={() => unlock(chapter)}
          />
        )}
      </article>

      {/* END OF CHAPTER */}
      {chapter.canRead && (
        <section className="reader-end">
          <div className="reader-ornament" style={{ marginTop: 0 }}>
            End of Chapter {chapter.number}
          </div>

          {next ? (
            next.canRead ? (
              <button
                type="button"
                onClick={() => goTo(next.id)}
                className="unlock-card"
                style={{
                  width: "100%",
                  cursor: "pointer",
                  color: "inherit",
                  font: "inherit",
                  border: "1px solid var(--surface-border)",
                }}
              >
                <div className="reader-chapter-label">Up next · Chapter {next.number}</div>
                <div style={{ fontSize: 22, fontWeight: 800, margin: "8px 0 14px" }}>{next.title}</div>
                <span className="pc-btn">Continue reading →</span>
              </button>
            ) : (
              <UnlockCard
                target={next}
                coins={coins}
                isLoggedIn={data.isLoggedIn}
                busy={unlocking === next.id}
                error={unlockError}
                returnTo={returnTo}
                onUnlock={() => unlock(next)}
                upNext
              />
            )
          ) : (
            <div className="unlock-card" style={{ border: "1px solid var(--surface-border)" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>You&apos;re all caught up</div>
              <p style={{ opacity: 0.7, margin: "8px 0 16px" }}>
                New chapters will appear here as soon as they are published.
              </p>
              <a className="pc-btn" href={`/stories/${storyId}`}>
                Rate & discuss this story
              </a>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 22 }}>
            {prev ? (
              <button className="pc-btn pc-btn-ghost" onClick={() => goTo(prev.id)}>
                ← Chapter {prev.number}
              </button>
            ) : (
              <span />
            )}
            <a className="pc-btn pc-btn-ghost" href={`/stories/${storyId}`}>
              All chapters
            </a>
          </div>
        </section>
      )}

      {/* CHAPTER DRAWER */}
      {drawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <aside className="drawer" aria-label="Chapters">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "16px 16px 10px",
                borderBottom: "1px solid rgba(128,128,128,0.15)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, opacity: 0.6 }}>Chapters</div>
                <div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {story.title}
                </div>
              </div>

              {data.isLoggedIn && (
                <a href={`/coins?returnTo=${encodeURIComponent(returnTo)}`} className="pc-coin-pill">
                  <CoinIcon size={16} />
                  {coins}
                </a>
              )}

              <button className="reader-icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <div style={{ overflowY: "auto", padding: 8, flex: 1 }}>
              {chapters.map((c) => (
                <button
                  key={c.id}
                  className={`chapter-row ${c.id === chapter.id ? "is-current" : ""}`}
                  onClick={() => goTo(c.id)}
                >
                  <span className="chapter-num">{c.number}</span>
                  <span className="chapter-row-text">
                    <strong>{c.title}</strong>
                    <span>{c.id === chapter.id ? "Reading now" : `Chapter ${c.number}`}</span>
                  </span>
                  {c.isFree ? (
                    <span className="pc-chip pc-chip-free">Free</span>
                  ) : c.canRead ? (
                    <span className="pc-chip pc-chip-open">Unlocked</span>
                  ) : (
                    <span className="pc-chip pc-chip-paid">
                      <LockIcon /> {c.price}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </aside>
        </>
      )}

      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(90deg, #ff4da6, #ff85c1)",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            zIndex: 300,
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            maxWidth: "90vw",
            textAlign: "center",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function UnlockCard({
  target,
  coins,
  isLoggedIn,
  busy,
  error,
  returnTo,
  onUnlock,
  upNext = false,
}: {
  target: { number: number; title: string; price: number };
  coins: number;
  isLoggedIn: boolean;
  busy: boolean;
  error: string;
  returnTo: string;
  onUnlock: () => void;
  upNext?: boolean;
}) {
  const enough = coins >= target.price;
  const coinsHref = `/coins?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <div className="unlock-card" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 16,
          margin: "0 auto 12px",
          display: "grid",
          placeItems: "center",
          background: "rgba(245,166,35,0.18)",
          color: "#d98a00",
        }}
      >
        <LockIcon size={24} />
      </div>

      <div className="reader-chapter-label">
        {upNext ? "Up next · " : ""}Chapter {target.number}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, margin: "6px 0 6px" }}>{target.title}</div>

      <p style={{ opacity: 0.75, margin: "0 0 18px", lineHeight: 1.5 }}>
        Unlock this chapter for{" "}
        <b style={{ whiteSpace: "nowrap" }}>
          <CoinIcon size={15} /> {target.price} coins
        </b>
        . It stays unlocked forever.
      </p>

      {!isLoggedIn ? (
        <a className="pc-btn" href="/login">
          Log in to unlock
        </a>
      ) : enough ? (
        <button className="pc-btn pc-btn-gold" onClick={onUnlock} disabled={busy} style={{ minWidth: 220 }}>
          {busy ? "Unlocking..." : `Unlock for ${target.price} coins`}
        </button>
      ) : (
        <a className="pc-btn pc-btn-gold" href={coinsHref} style={{ minWidth: 220 }}>
          Get coins
        </a>
      )}

      {isLoggedIn && (
        <p style={{ fontSize: 13, opacity: 0.7, margin: "14px 0 0" }}>
          Your balance: <b>{coins} coins</b>
          {!enough && <> · you need {target.price - coins} more</>}
          {enough && (
            <>
              {" · "}
              <a href={coinsHref} style={{ color: "var(--primary)" }}>
                Buy more
              </a>
            </>
          )}
        </p>
      )}

      {error && <p style={{ color: "#ff5a5a", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
    </div>
  );
}

export default function ChapterReaderPage() {
  return (
    <Suspense fallback={<div className="reader-shell" />}>
      <ChapterReader />
    </Suspense>
  );
}

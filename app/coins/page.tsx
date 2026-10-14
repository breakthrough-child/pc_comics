"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CoinIcon } from "../components/StoryContent";

type CoinPackage = {
  id: string;
  name: string;
  coins: number;
  priceNaira: number;
};

type CoinTransaction = {
  id: string;
  type: string;
  coins: number;
  amountNaira?: number | null;
  description?: string | null;
  createdAt: string;
};

function naira(amount: number) {
  return `₦${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function CoinsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTo = searchParams.get("returnTo");
  const status = searchParams.get("coins");
  const added = searchParams.get("added");

  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/coins", { credentials: "include", cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setPackages(data.packages || []);
        setTransactions(data.transactions || []);
        setBalance(data.balance || 0);
        setIsLoggedIn(Boolean(data.isLoggedIn));
      })
      .catch((err) => console.error("COINS LOAD ERROR:", err))
      .finally(() => setLoading(false));
  }, []);

  async function buy(pkg: CoinPackage) {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setBuyingId(pkg.id);

    try {
      const res = await fetch("/api/coins/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id, returnTo: returnTo || "/coins" }),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok || !data.url) {
        alert(data.error || "Unable to start payment");
        return;
      }

      window.location.assign(data.url);
    } catch {
      alert("Unable to start payment");
    } finally {
      setBuyingId(null);
    }
  }

  // Best coins-per-naira gets the "best value" tag.
  const bestValueId =
    packages.length > 1
      ? packages.reduce((best, pkg) =>
          pkg.coins / pkg.priceNaira > best.coins / best.priceNaira ? pkg : best
        ).id
      : null;

  return (
    <div className="pc-page" style={{ maxWidth: 980 }}>
      {status === "success" && (
        <div
          className="pc-card"
          style={{
            padding: "14px 18px",
            marginBottom: 20,
            borderColor: "rgba(0,200,140,0.4)",
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <CoinIcon size={22} />
          <b style={{ flex: 1 }}>
            Payment successful{added ? ` — ${added} coins added` : ""}.
          </b>
          {returnTo && (
            <a className="pc-btn" href={returnTo}>
              Back to reading
            </a>
          )}
        </div>
      )}

      {(status === "failed" || status === "error") && (
        <div
          className="pc-card"
          style={{ padding: "14px 18px", marginBottom: 20, color: "#ff5a5a" }}
        >
          The payment was not completed. You have not been charged coins — please try again.
        </div>
      )}

      {/* WALLET */}
      <section
        style={{
          borderRadius: 22,
          padding: "clamp(20px, 5vw, 32px)",
          marginBottom: 28,
          color: "#3a2300",
          background:
            "radial-gradient(circle at 85% 20%, rgba(255,255,255,0.55), transparent 45%), linear-gradient(120deg, #ffd36e, #f7a531 60%, #ff85c1)",
          boxShadow: "0 20px 50px rgba(245,166,35,0.35)",
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <CoinIcon size={64} />
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Your wallet
          </div>
          <div style={{ fontSize: "clamp(34px, 8vw, 48px)", fontWeight: 900, lineHeight: 1.1 }}>
            {isLoggedIn ? balance.toLocaleString() : "—"}{" "}
            <span style={{ fontSize: "0.45em", fontWeight: 800 }}>coins</span>
          </div>
          <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
            Use coins to unlock story chapters. Unlocked chapters are yours forever.
          </div>
        </div>
        {!isLoggedIn && !loading && (
          <a className="pc-btn" href="/login">
            Log in to buy coins
          </a>
        )}
      </section>

      <h1 style={{ fontSize: "clamp(22px, 5vw, 28px)", margin: "0 0 6px" }}>Buy coins</h1>
      <p style={{ color: "var(--muted)", margin: "0 0 18px" }}>
        Pay securely with your debit card via Paystack.
      </p>

      {loading && <p style={{ opacity: 0.7 }}>Loading packages...</p>}

      {!loading && packages.length === 0 && (
        <div className="pc-card" style={{ padding: 24, textAlign: "center" }}>
          No coin packages are available right now. Please check back soon.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 210px), 1fr))",
          gap: 14,
        }}
      >
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="pc-card"
            style={{
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              position: "relative",
              borderColor: pkg.id === bestValueId ? "rgba(245,166,35,0.6)" : undefined,
            }}
          >
            {pkg.id === bestValueId && (
              <span className="pc-chip pc-chip-paid" style={{ position: "absolute", top: 12, right: 12 }}>
                Best value
              </span>
            )}

            <div style={{ fontWeight: 700, opacity: 0.75 }}>{pkg.name}</div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CoinIcon size={30} />
              <span style={{ fontSize: 32, fontWeight: 900 }}>{pkg.coins.toLocaleString()}</span>
            </div>

            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {naira(pkg.priceNaira / pkg.coins)} per coin
            </div>

            <button
              type="button"
              className="pc-btn"
              onClick={() => buy(pkg)}
              disabled={buyingId !== null}
              style={{ marginTop: "auto" }}
            >
              {buyingId === pkg.id ? "Redirecting..." : `Pay ${naira(pkg.priceNaira)}`}
            </button>
          </div>
        ))}
      </div>

      {isLoggedIn && transactions.length > 0 && (
        <section className="pc-card" style={{ padding: 18, marginTop: 30 }}>
          <h2 style={{ fontSize: 18, margin: "0 0 10px" }}>Coin history</h2>

          {transactions.map((tx) => (
            <div
              key={tx.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderTop: "1px solid rgba(128,128,128,0.14)",
                fontSize: 14,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, overflowWrap: "anywhere" }}>
                  {tx.description || tx.type}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {new Date(tx.createdAt).toLocaleString()}
                  {tx.amountNaira ? ` · ${naira(tx.amountNaira)}` : ""}
                </div>
              </div>
              <b style={{ color: tx.coins > 0 ? "#00a676" : "#e6338c", whiteSpace: "nowrap" }}>
                {tx.coins > 0 ? "+" : ""}
                {tx.coins}
              </b>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default function CoinsPage() {
  return (
    <Suspense fallback={<div className="pc-page">Loading...</div>}>
      <CoinsPageContent />
    </Suspense>
  );
}

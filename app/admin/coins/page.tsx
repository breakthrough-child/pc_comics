"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CoinIcon } from "../../components/StoryContent";

type CoinPackage = {
  id: string;
  name: string;
  coins: number;
  priceNaira: number;
  isActive: boolean;
  sortOrder: number;
};

type Draft = {
  name: string;
  coins: string;
  priceNaira: string;
  isActive: boolean;
  sortOrder: string;
};

const emptyDraft: Draft = {
  name: "",
  coins: "",
  priceNaira: "",
  isActive: true,
  sortOrder: "0",
};

function toDraft(pkg: CoinPackage): Draft {
  return {
    name: pkg.name,
    coins: String(pkg.coins),
    priceNaira: String(pkg.priceNaira),
    isActive: pkg.isActive,
    sortOrder: String(pkg.sortOrder),
  };
}

export default function AdminCoinsPage() {
  const router = useRouter();

  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [stats, setStats] = useState({ coinsSold: 0, revenueNaira: 0, coinsSpent: 0 });
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [newDraft, setNewDraft] = useState<Draft>(emptyDraft);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/coin-packages", {
      credentials: "include",
      cache: "no-store",
    });

    if (res.status === 403) {
      router.push("/comics");
      return;
    }

    const data = await res.json();
    setPackages(data.packages || []);
    setStats(data.stats || { coinsSold: 0, revenueNaira: 0, coinsSpent: 0 });
    setDrafts(
      Object.fromEntries((data.packages || []).map((p: CoinPackage) => [p.id, toDraft(p)]))
    );
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  function payload(draft: Draft) {
    return {
      name: draft.name,
      coins: Number(draft.coins),
      priceNaira: Number(draft.priceNaira),
      isActive: draft.isActive,
      sortOrder: Number(draft.sortOrder) || 0,
    };
  }

  async function save(id: string) {
    setSavingId(id);

    try {
      const res = await fetch(`/api/admin/coin-packages/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(drafts[id])),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save package");
        return;
      }

      await load();
    } finally {
      setSavingId(null);
    }
  }

  async function create() {
    setSavingId("new");

    try {
      const res = await fetch("/api/admin/coin-packages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(newDraft)),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create package");
        return;
      }

      setNewDraft(emptyDraft);
      await load();
    } finally {
      setSavingId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this coin package? Past purchases are kept.")) return;

    const res = await fetch(`/api/admin/coin-packages/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Failed to delete package");
      return;
    }

    await load();
  }

  if (loading) {
    return <div className="pc-page">Loading...</div>;
  }

  return (
    <div className="pc-page" style={{ maxWidth: 980 }}>
      <h1 className="page-hero-title" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <CoinIcon size={40} /> Coin Packages
      </h1>
      <p style={{ color: "var(--muted)", margin: "8px 0 22px" }}>
        Decide how many coins readers get for each amount they pay. Chapter prices are set in
        coins on each story&apos;s chapter manager.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 26,
        }}
      >
        {[
          ["Revenue from coins", `₦${stats.revenueNaira.toLocaleString()}`],
          ["Coins sold", stats.coinsSold.toLocaleString()],
          ["Coins spent on chapters", stats.coinsSpent.toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} className="pc-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {packages.map((pkg) => (
          <PackageForm
            key={pkg.id}
            draft={drafts[pkg.id] || toDraft(pkg)}
            onChange={(draft) => setDrafts((prev) => ({ ...prev, [pkg.id]: draft }))}
            footer={
              <>
                <button className="pc-btn" onClick={() => save(pkg.id)} disabled={savingId === pkg.id}>
                  {savingId === pkg.id ? "Saving..." : "Save"}
                </button>
                <button className="pc-btn pc-btn-danger" onClick={() => remove(pkg.id)}>
                  Delete
                </button>
              </>
            }
          />
        ))}

        <PackageForm
          title="Add a new package"
          draft={newDraft}
          onChange={setNewDraft}
          footer={
            <button className="pc-btn" onClick={create} disabled={savingId === "new"}>
              {savingId === "new" ? "Creating..." : "Create package"}
            </button>
          }
        />
      </div>
    </div>
  );
}

function PackageForm({
  draft,
  onChange,
  footer,
  title,
}: {
  draft: Draft;
  onChange: (draft: Draft) => void;
  footer: React.ReactNode;
  title?: string;
}) {
  const coins = Number(draft.coins);
  const price = Number(draft.priceNaira);
  const rate = coins > 0 && price > 0 ? price / coins : null;

  return (
    <div
      className="pc-card"
      style={{
        padding: 16,
        opacity: draft.isActive ? 1 : 0.7,
        borderStyle: title ? "dashed" : undefined,
      }}
    >
      {title && <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>{title}</h2>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        <div>
          <label className="pc-label">Name</label>
          <input
            className="pc-input"
            value={draft.name}
            placeholder="e.g. Starter"
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
          />
        </div>
        <div>
          <label className="pc-label">Amount paid (₦)</label>
          <input
            className="pc-input"
            inputMode="decimal"
            value={draft.priceNaira}
            placeholder="500"
            onChange={(e) => onChange({ ...draft, priceNaira: e.target.value })}
          />
        </div>
        <div>
          <label className="pc-label">Coins received</label>
          <input
            className="pc-input"
            inputMode="numeric"
            value={draft.coins}
            placeholder="50"
            onChange={(e) => onChange({ ...draft, coins: e.target.value })}
          />
        </div>
        <div>
          <label className="pc-label">Display order</label>
          <input
            className="pc-input"
            inputMode="numeric"
            value={draft.sortOrder}
            onChange={(e) => onChange({ ...draft, sortOrder: e.target.value })}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 14,
          flexWrap: "wrap",
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(e) => onChange({ ...draft, isActive: e.target.checked })}
          />
          Visible to readers
        </label>

        {rate && (
          <span className="pc-chip pc-chip-muted">
            ₦{rate.toLocaleString(undefined, { maximumFractionDigits: 2 })} per coin
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>{footer}</div>
      </div>
    </div>
  );
}

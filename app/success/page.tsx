"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function SuccessPageInner() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const comicId = params.get("comicId");

    if (!comicId) return;

    fetch("/api/purchase", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comicId }),
    })
      .then((res) => res.json().catch(() => null))
      .then(() => {
        router.push("/comics");
      });
  }, []);

  return <p>Processing payment...</p>;
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPageInner />
    </Suspense>
  );
}
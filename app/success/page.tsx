"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SuccessPage() {
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
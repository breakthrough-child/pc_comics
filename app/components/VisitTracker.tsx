"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VISITOR_KEY = "pc:visitorId";
const SESSION_KEY = "pc:visitSource";

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  // randomUUID needs HTTPS; fall back for plain-HTTP previews.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);

    if (!id) {
      id = newId();
      localStorage.setItem(VISITOR_KEY, id);
    }

    return id;
  } catch {
    // Storage blocked (private mode): count this page load on its own.
    return newId();
  }
}

/**
 * Where this browsing session started (ad link tag or referring site).
 * Kept for the whole tab session so every page of an ad visit is
 * credited to the ad, not just the first.
 */
function getSessionSource() {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}

  const params = new URLSearchParams(window.location.search);
  const source = {
    utmSource: params.get("utm_source") || params.get("ref") || null,
    referrer: document.referrer || null,
  };

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(source));
  } catch {}

  return source;
}

/**
 * Records one visit per page shown. Renders nothing.
 */
export default function VisitTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const body = JSON.stringify({
      visitorId: getVisitorId(),
      path: pathname,
      ...getSessionSource(),
    });

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}

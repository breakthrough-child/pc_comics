const links = [
  ["/about", "About us"],
  ["/contact", "Contact"],
  ["/faq", "FAQ"],
  ["/terms", "Terms & Conditions"],
  ["/privacy", "Privacy Policy"],
  ["/refund-policy", "Refund Policy"],
];

export default function SiteFooter() {
  return (
    <footer
      style={{
        marginTop: 120,
        paddingTop: 30,
        borderTop: "1px solid rgba(128,128,128,0.18)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        textAlign: "center",
      }}
    >
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px 18px",
          fontSize: 14,
        }}
      >
        {links.map(([href, label]) => (
          <a
            key={href}
            href={href}
            style={{
              color: "var(--text)",
              textDecoration: "none",
              opacity: 0.85,
            }}
          >
            {label}
          </a>
        ))}
      </nav>

      <div style={{ fontSize: 12, opacity: 0.55 }}>
        © 2026 ComicVerse. All rights reserved.
      </div>
    </footer>
  );
}

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with ComicVerse.",
};

export default function ContactPage() {
  return (
    <main
      style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: "60px 24px",
        color: "var(--text)",
      }}
    >
      <h1
        style={{
          fontSize: 40,
          fontWeight: 800,
          marginBottom: 10,
        }}
      >
        Contact Us
      </h1>

      <p
        style={{
          opacity: 0.75,
          marginBottom: 40,
          lineHeight: 1.7,
        }}
      >
        If you have any questions, need support, or experience any issues with
        your purchases, we're happy to help.
      </p>

      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 24,
          lineHeight: 2,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 20,
            fontSize: 24,
          }}
        >
          Contact Information
        </h2>

        <p>
          <strong>Email:</strong> 04adakings@gmail.com
        </p>
        <p>
          <strong>Support Hours:</strong>
          <br />
          Monday – Friday
          <br />
          9:00 AM – 5:00 PM (WAT)
        </p>
      </div>

      <p
        style={{
          marginTop: 40,
          opacity: 0.65,
          textAlign: "center",
          fontSize: 14,
        }}
      >
        We aim to respond to all enquiries within 24–48 hours.
      </p>
    </main>
  );
}
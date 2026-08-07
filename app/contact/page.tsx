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
    lineHeight: 1.8,
  }}
>
  PC Comics is an online platform that offers digital comics for readers around
  the world. Customers can browse our collection, securely purchase digital
  comics, and enjoy instant access to their purchases through their accounts.
  If you have questions about your account, purchases, or our services, our
  support team is here to assist you.
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
<div
  style={{
    marginTop: 30,
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 24,
    lineHeight: 1.9,
  }}
>
  <h2
    style={{
      marginTop: 0,
      marginBottom: 20,
      fontSize: 24,
    }}
  >
    About Our Business
  </h2>

  <p>
    <strong>Business Name:</strong> PC Comics
  </p>

  <p>
    <strong>Business Type:</strong> Online Digital Comic Store
  </p>

  <p>
    <strong>Services:</strong> We publish and sell digital comics that customers
    can purchase and read online through their accounts.
  </p>

  <p>
    <strong>Delivery:</strong> Purchased comics become available digitally after
    successful payment. No physical products are shipped.
  </p>

  <p>
    <strong>Payments:</strong> Payments are securely processed through Paystack.
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
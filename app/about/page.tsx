export const metadata = {
  title: "About Us",
  description: "Learn more about PC Comics and our digital comic platform.",
};

export default function AboutPage() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "60px 24px",
        color: "var(--text)",
        lineHeight: 1.8,
      }}
    >
      <h1
        style={{
          fontSize: 42,
          fontWeight: 800,
          marginBottom: 12,
        }}
      >
        About PC Comics
      </h1>

      <p
  style={{
    fontSize: 18,
    opacity: 0.85,
    marginBottom: 40,
    lineHeight: 1.9,
  }}
>
  PC Comics is an online digital comic platform dedicated to making engaging Romantic and High School comic stories accessible to readers around the world. Our platform provides a
  secure and convenient way for users to browse, purchase, and enjoy digital
  comics from a growing collection of titles. We focus exclusively on digital
  comic distribution, allowing readers to access their purchased comics
  instantly through their personal accounts without waiting for physical
  delivery. Our goal is to provide a seamless reading experience while
  supporting original storytelling and digital publishing.
</p>

      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 28,
          marginBottom: 30,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 18,
            fontSize: 28,
          }}
        >
          What We Do
        </h2>

        <p>
  PC Comics operates as an online marketplace for digital comic books. Our
  platform showcases a curated library of comics, each with its own title,
  description, cover artwork, and transparent pricing so customers can make
  informed purchasing decisions before checkout.
</p>

<p>
  Customers can create a personal account, browse our available collection,
  preview comic information, and securely purchase the comics they are
  interested in. Once payment has been successfully processed through Paystack,
  purchased comics become available in the customer's account, where they can be
  accessed and read online at any time.
</p>

<p>
  We continually expand our collection by publishing new titles and making them
  available to readers through our platform. Since all products are digital,
  customers receive immediate access after purchase without shipping fees or
  delivery delays.
</p>

<p>
  Our services are available entirely online, allowing readers to enjoy comics
  from anywhere with an internet connection and a supported web browser.
</p>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 28,
          marginBottom: 30,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 18,
            fontSize: 28,
          }}
        >
          How It Works
        </h2>

        <ol
  style={{
    paddingLeft: 24,
    lineHeight: 2,
    margin: 0,
  }}
>
  <li>Browse our library of available digital comics.</li>

  <li>
    Open any comic to view its cover image, description, and purchase price.
  </li>

  <li>
    Create an account or sign in to your existing account before making a
    purchase.
  </li>

  <li>
    Select the comic you wish to purchase and proceed to our secure checkout.
  </li>

  <li>
    Payments are securely processed through Paystack using supported payment
    methods.
  </li>

  <li>
    After successful payment confirmation, the purchased comic is immediately
    linked to your account.
  </li>

  <li>
    Log in at any time to access and read your purchased digital comics from
    your personal library.
  </li>

  <li>
    Subscribe to our newsletter to receive notifications whenever new comics are
    published on the platform.
  </li>
</ol>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 28,
          marginBottom: 30,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 18,
            fontSize: 28,
          }}
        >
          Our Mission
        </h2>

        <p>
  Our mission is to build a trusted digital platform where readers can discover,
  purchase, and enjoy quality comic stories with ease. We are committed to
  making digital comics more accessible while providing a secure purchasing
  experience and an intuitive reading environment.
</p>

<p>
  We believe that digital publishing enables comic creators to reach readers
  more efficiently while allowing customers to instantly access their favorite
  stories without geographical limitations.
</p>

<p>
  As our platform grows, we aim to continually improve our services by expanding
  our comic collection, enhancing the reading experience, strengthening account
  security, and delivering reliable customer support.
</p>
      </div>


      <div
  style={{
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 28,
    marginBottom: 30,
  }}
>
  <h2
    style={{
      marginTop: 0,
      marginBottom: 18,
      fontSize: 28,
    }}
  >
    Payments, Delivery & Customer Policies
  </h2>

  <p>
    PC Comics sells digital products only. We do not manufacture, stock, or
    deliver physical comic books.
  </p>

  <p>
    Every comic listed on our platform clearly displays its purchase price
    before checkout. Payments are securely processed through Paystack, helping
    ensure that customer payment information is handled using industry-standard
    security practices.
  </p>

  <p>
    Once payment has been successfully completed, purchased comics become
    immediately available within the customer's account for online reading.
  </p>

  <p>
    Due to the nature of digital products, completed purchases are generally
    non-refundable except in circumstances outlined in our Refund Policy, such
    as duplicate payments or technical issues preventing delivery.
  </p>

  <p>
    Customers are encouraged to review our Terms & Conditions, Privacy Policy,
    and Refund Policy before making a purchase.
  </p>
</div>

      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 28,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 18,
            fontSize: 28,
          }}
        >
          Customer Support
        </h2>

        <p>
  We are committed to providing timely and helpful customer support. If you have
  questions about your account, purchases, payments, access to purchased comics,
  or experience any technical difficulties while using our platform, our support
  team is available to assist you.
</p>

<p>
  Please visit our{" "}
  <a
    href="/contact"
    style={{
      color: "#ff4da6",
      textDecoration: "none",
    }}
  >
    Contact
  </a>{" "}
  page for our support email and business information. We aim to respond to all
  customer enquiries within 24–48 hours during our published support hours.
</p>
      </div>
    </main>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Comic = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
};

export default function HomePage() {

  const [featuredComics, setFeaturedComics] = useState<Comic[]>([]);

const FREE_COMIC_IDS = [
  "0df75db3-6d94-4cfd-aea3-4f739081ab8f",
  "fccf9709-8be0-4d5d-96ab-1c609fcee7ee",
];

useEffect(() => {
  async function loadComics() {
    const res = await fetch("/api/comics", {
      cache: "no-store",
    });

    const data = await res.json();

    if (Array.isArray(data)) {
      setFeaturedComics(
        data.filter((comic) => FREE_COMIC_IDS.includes(comic.id))
      );
    }
  }

  loadComics();
}, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "var(--text)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* HERO */}

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "70px 24px 80px",
        }}
      >
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
            marginBottom: 70,
          }}
        >
          <img
            src="/pclogo.png"
            alt="PC Comics"
            style={{
              height: 120,
              width: "auto",
              objectFit: "contain",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: 18,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link
              href="/about"
              style={{
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              About
            </Link>

            <Link
              href="/faq"
              style={{
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              FAQ
            </Link>

            <Link
              href="/contact"
              style={{
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              Contact
            </Link>

            <Link
              href="/login"
              style={{
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              Login
            </Link>

            <Link
              href="/register"
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                background:
                  "linear-gradient(90deg,#ff4da6,#ff85c1)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Create Account
            </Link>
          </div>
        </nav>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
            gap: 50,
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                padding: "8px 16px",
                borderRadius: 100,
                background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.12)",
                marginBottom: 24,
              }}
            >
               Premium Digital Comics
            </span>

            <h1
              style={{
                fontSize: 58,
                lineHeight: 1.1,
                margin: 0,
                fontWeight: 900,
                letterSpacing: -2,
              }}
            >
              Welcome to
              <br />
              PC Comics
            </h1>

            <p
              style={{
                fontSize: 20,
                lineHeight: 1.9,
                opacity: .85,
                marginTop: 30,
                maxWidth: 650,
              }}
            >
              PC Comics is a digital comic platform that allows
              readers to discover, purchase, and enjoy premium
              digital comics online. Our mission is to provide a
              simple, secure, and enjoyable reading experience
              through a growing library of original comic stories
              that can be accessed instantly after purchase.
            </p>

            <p
              style={{
                fontSize: 18,
                lineHeight: 1.8,
                opacity: .75,
              }}
            >
              Every comic listed on our platform includes its own
              cover artwork, description, and transparent pricing,
              allowing readers to make informed purchasing decisions
              before checkout. Payments are processed securely
              through Paystack, and purchased comics become
              immediately available in each customer's personal
              library.
            </p>

            <div
              style={{
                display: "flex",
                gap: 18,
                flexWrap: "wrap",
                marginTop: 40,
              }}
            >
              <Link
                href="/comics"
                style={{
                  padding: "16px 28px",
                  borderRadius: 12,
                  textDecoration: "none",
                  background:
                    "linear-gradient(90deg,#ff4da6,#ff85c1)",
                  color: "#fff",
                  fontWeight: 700,
                  boxShadow:
                    "0 15px 35px rgba(255,77,166,.35)",
                }}
              >
                Browse Comics
              </Link>

              <Link
                href="/about"
                style={{
                  padding: "16px 28px",
                  borderRadius: 12,
                  textDecoration: "none",
                  border:
                    "1px solid rgba(255,255,255,.15)",
                  color: "var(--text)",
                  background: "rgba(255,255,255,.05)",
                }}
              >
                Learn More
              </Link>
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              backdropFilter: "blur(16px)",
              borderRadius: 24,
              padding: 35,
            }}
          >
            <img
              src="/pclogo.png"
              alt="PC Comics"
              style={{
                width: "100%",
                maxHeight: 420,
                objectFit: "contain",
              }}
            />

            <h2
              style={{
                marginTop: 30,
                fontSize: 28,
              }}
            >
              Read Anywhere.
            </h2>

            <p
              style={{
                opacity: .8,
                lineHeight: 1.9,
              }}
            >
              Access your purchased comics from your account
              whenever you want. Our platform is designed to give
              readers a smooth experience from browsing to payment
              and reading.
            </p>
          </div>
        </div>
      </section>


            <section
  style={{
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px 80px",
  }}
>
  <h2
    style={{
      fontSize: 38,
      marginBottom: 15,
    }}
  >
    Read These Comics Free
  </h2>

  <p
    style={{
      opacity: .8,
      marginBottom: 35,
      lineHeight: 1.8,
    }}
  >
    New here? Enjoy these two comics completely free before exploring
    the rest of our premium collection.
  </p>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit,minmax(260px,1fr))",
      gap: 24,
    }}
  >
    {featuredComics.map((comic) => (
      <div
        key={comic.id}
        style={{
          background: "rgba(255,255,255,.05)",
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <img
          src={comic.imageUrl}
          style={{
            width: "100%",
            height: 320,
            objectFit: "cover",
          }}
        />

        <div
          style={{
            padding: 20,
          }}
        >
          <h3>{comic.title}</h3>

          <p
            style={{
              opacity: .8,
              lineHeight: 1.7,
            }}
          >
            {comic.description}
          </p>

          <Link
            href={`/read/${comic.id}`}
            style={{
              display: "inline-block",
              marginTop: 15,
              padding: "12px 22px",
              borderRadius: 10,
              background:
                "linear-gradient(90deg,#ff4da6,#ff85c1)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Read Free
          </Link>
        </div>
      </div>
    ))}
  </div>
</section>

      {/* ABOUT */}

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "20px 24px 80px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,.05)",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,.08)",
            padding: 40,
          }}
        >
          <h2
            style={{
              fontSize: 38,
              marginTop: 0,
            }}
          >
            About PC Comics
          </h2>

          <p
            style={{
              lineHeight: 2,
              opacity: .85,
            }}
          >
            PC Comics is an online business focused on digital comic
            publishing and distribution. Our platform provides comic
            enthusiasts with access to an expanding collection of
            digital comic titles that can be browsed, purchased,
            and read directly through their accounts.
          </p>

          <p
            style={{
              lineHeight: 2,
              opacity: .85,
            }}
          >
            Unlike traditional bookstores that ship printed comics,
            PC Comics specializes exclusively in digital content.
            Customers do not receive physical books. Instead,
            purchased comics become available electronically
            immediately after successful payment confirmation,
            allowing readers to begin enjoying their purchases
            without shipping delays or delivery costs.
          </p>

          <p
            style={{
              lineHeight: 2,
              opacity: .85,
            }}
          >
            Our goal is to create a trusted online destination for
            comic readers by combining secure payments,
            straightforward purchasing, instant digital delivery,
            transparent pricing, and responsive customer support.
          </p>
        </div>
      </section>

            {/* OUR SERVICES */}

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <h2
          style={{
            fontSize: 38,
            marginBottom: 40,
          }}
        >
          Our Products & Services
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: 24,
          }}
        >
          {[
            {
              title: "Digital Comic Library",
              text:
                "Browse an expanding collection of digital comics featuring different stories, characters, and genres. Every listing includes a cover image, detailed description, and transparent pricing.",
            },
            {
              title: "Secure Online Purchases",
              text:
                "Purchase comics safely using our secure checkout powered by Paystack. Customers can complete payments using the payment methods supported by Paystack.",
            },
            {
              title: "Instant Digital Delivery",
              text:
                "Purchased comics become available immediately after successful payment confirmation. There is no waiting period and no physical shipping involved.",
            },
            {
              title: "Personal Reading Library",
              text:
                "Every purchased comic is linked to the customer's account, making it easy to return and continue reading at any time after logging in.",
            },
            {
              title: "Customer Support",
              text:
                "Our support team assists customers with payment issues, account enquiries, access to purchased comics, and other platform-related questions.",
            },
            {
              title: "Newsletter",
              text:
                "Readers can subscribe to our newsletter to receive notifications whenever new comics are published or important platform updates become available.",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 20,
                padding: 28,
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  fontSize: 24,
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  lineHeight: 1.9,
                  opacity: .82,
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <h2
          style={{
            fontSize: 38,
            marginBottom: 40,
          }}
        >
          How Our Platform Works
        </h2>

        <div
          style={{
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 24,
            padding: 40,
          }}
        >
          <ol
            style={{
              paddingLeft: 24,
              lineHeight: 2.2,
              fontSize: 17,
            }}
          >
            <li>
              Browse our collection of digital comics and discover
              stories that interest you.
            </li>

            <li>
              Open any comic to view its cover artwork,
              description, and purchase price.
            </li>

            <li>
              Create an account or log in to your existing account
              before completing a purchase.
            </li>

            <li>
              Select the comic you wish to purchase and continue to
              our secure checkout.
            </li>

            <li>
              Complete your payment securely through Paystack using
              one of the supported payment methods.
            </li>

            <li>
              After payment has been successfully confirmed, the
              purchased comic is automatically added to your
              account.
            </li>

            <li>
              Log into your account anytime to access and read your
              purchased comics online.
            </li>

            <li>
              Subscribe to our newsletter if you would like to be
              notified whenever new comics become available.
            </li>
          </ol>
        </div>
      </section>

      {/* WHY CHOOSE US */}

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <h2
          style={{
            fontSize: 38,
            marginBottom: 40,
          }}
        >
          Why Readers Choose PC Comics
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: 22,
          }}
        >
          {[
            "Secure online payments",
            "Instant digital access",
            "Transparent pricing",
            "Growing comic collection",
            "Easy account management",
            "Simple reading experience",
            "Responsive customer support",
            "Modern web platform",
          ].map((reason) => (
            <div
              key={reason}
              style={{
                background: "rgba(255,255,255,.05)",
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,.08)",
                padding: 22,
                fontWeight: 600,
                fontSize: 17,
              }}
            >
              ✅ {reason}
            </div>
          ))}
        </div>
      </section>

      {/* PAYMENTS */}

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 24,
            padding: 40,
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: 38,
            }}
          >
            Secure Payments
          </h2>

          <p
            style={{
              lineHeight: 2,
              opacity: .85,
            }}
          >
            PC Comics uses Paystack to securely process customer
            payments. Depending on your location and the payment
            methods supported by Paystack, customers may be able to
            pay using debit cards, bank transfers, USSD, mobile
            money, and other supported payment methods.
          </p>

          <p
            style={{
              lineHeight: 2,
              opacity: .85,
            }}
          >
            We do not store customers' debit card or banking
            information. Payment processing is handled securely
            through Paystack using industry-standard security
            practices.
          </p>

          <p
            style={{
              lineHeight: 2,
              opacity: .85,
            }}
          >
            Every comic displays its purchase price before checkout,
            allowing customers to know exactly what they are paying
            before completing a transaction.
          </p>
        </div>
      </section>


            {/* CUSTOMER SUPPORT */}

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 24,
            padding: 40,
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: 38,
            }}
          >
            Customer Support
          </h2>

          <p
            style={{
              lineHeight: 2,
              opacity: .85,
            }}
          >
            We are committed to providing a reliable experience for
            every customer. If you encounter payment issues, have
            questions about your account, experience difficulties
            accessing purchased comics, or need general assistance,
            our support team is available to help.
          </p>

          <p
            style={{
              lineHeight: 2,
              opacity: .85,
            }}
          >
            We aim to respond to customer enquiries within
            <strong> 24–48 hours </strong>
            during our published support hours.
          </p>

          <div
            style={{
              display: "flex",
              gap: 18,
              flexWrap: "wrap",
              marginTop: 30,
            }}
          >
            <Link
              href="/contact"
              style={{
                padding: "14px 24px",
                borderRadius: 12,
                background:
                  "linear-gradient(90deg,#ff4da6,#ff85c1)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Contact Support
            </Link>

            <Link
              href="/faq"
              style={{
                padding: "14px 24px",
                borderRadius: 12,
                border:
                  "1px solid rgba(255,255,255,.15)",
                background: "rgba(255,255,255,.05)",
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              Read FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* LEGAL */}

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <h2
          style={{
            fontSize: 38,
            marginBottom: 30,
          }}
        >
          Our Commitment
        </h2>

        <p
          style={{
            lineHeight: 2,
            opacity: .85,
          }}
        >
          PC Comics is committed to transparency, secure online
          transactions, responsible handling of customer
          information, and delivering quality digital comic
          experiences. We encourage every customer to review our
          legal policies before creating an account or making a
          purchase.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: 20,
            marginTop: 40,
          }}
        >
          {[
            {
              title: "About Us",
              href: "/about",
            },
            {
              title: "Frequently Asked Questions",
              href: "/faq",
            },
            {
              title: "Contact",
              href: "/contact",
            },
            {
              title: "Terms & Conditions",
              href: "/terms",
            },
            {
              title: "Privacy Policy",
              href: "/privacy",
            },
            {
              title: "Refund Policy",
              href: "/refund-policy",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              style={{
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 18,
                padding: 24,
                color: "var(--text)",
                textDecoration: "none",
                textAlign: "center",
                fontWeight: 700,
                transition: ".25s",
              }}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 90px",
        }}
      >
        <div
          style={{
            borderRadius: 28,
            padding: "60px 40px",
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(255,77,166,.15), rgba(255,133,193,.08))",
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <h2
            style={{
              fontSize: 42,
              marginTop: 0,
              marginBottom: 18,
            }}
          >
            Ready to Start Reading?
          </h2>

          <p
            style={{
              maxWidth: 760,
              margin: "0 auto",
              lineHeight: 2,
              opacity: .85,
              fontSize: 18,
            }}
          >
            Browse our growing collection of digital comics, create
            your account, securely complete your purchase, and enjoy
            instant access to your favourite stories—all from one
            convenient online platform.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 20,
              flexWrap: "wrap",
              marginTop: 40,
            }}
          >
            <Link
              href="/comics"
              style={{
                padding: "18px 34px",
                borderRadius: 14,
                background:
                  "linear-gradient(90deg,#ff4da6,#ff85c1)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 800,
                boxShadow:
                  "0 15px 35px rgba(255,77,166,.35)",
              }}
            >
              Browse Comics
            </Link>

            <Link
              href="/register"
              style={{
                padding: "18px 34px",
                borderRadius: 14,
                background: "rgba(255,255,255,.05)",
                border:
                  "1px solid rgba(255,255,255,.15)",
                color: "var(--text)",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,.08)",
          padding: "35px 24px 60px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <strong style={{ fontSize: 20 }}>
              PC Comics
            </strong>

            <p
              style={{
                opacity: .7,
                marginTop: 8,
                maxWidth: 500,
                lineHeight: 1.8,
              }}
            >
              An online platform for discovering, purchasing, and
              reading premium digital comics securely.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/about"
              style={{
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              About
            </Link>

            <Link
              href="/faq"
              style={{
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              FAQ
            </Link>

            <Link
              href="/contact"
              style={{
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              Contact
            </Link>

            <Link
              href="/terms"
              style={{
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              Terms
            </Link>

            <Link
              href="/privacy"
              style={{
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              Privacy
            </Link>

            <Link
              href="/refund-policy"
              style={{
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              Refunds
            </Link>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1200,
            margin: "30px auto 0",
            opacity: .6,
            textAlign: "center",
            fontSize: 14,
          }}
        >
          © {new Date().getFullYear()} PC Comics. All rights
          reserved.
        </div>
      </footer>
    </main>
  );
}
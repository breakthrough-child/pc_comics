export const metadata = {
  title: "Frequently Asked Questions",
  description: "Frequently asked questions about PC Comics, our digital comics, purchases, payments and customer support.",
};

const faqs = [
  {
    question: "What is PC Comics?",
    answer:
      "PC Comics is an online platform that publishes and sells digital comics. Our website allows readers to browse a growing collection of digital comic titles, securely purchase the comics they want, and read their purchased comics online through their personal accounts.",
  },
  {
    question: "Do you sell physical comic books?",
    answer:
      "No. PC Comics sells digital comics only. We do not print, stock, or deliver physical comic books. Every purchase is delivered electronically through your account on our platform.",
  },
  {
    question: "How do I purchase a comic?",
    answer:
      "Browse our comic collection, select the comic you would like to purchase, and click the Buy button. You will be redirected to our secure Paystack checkout to complete your payment. After successful payment, the comic becomes available in your account immediately.",
  },
  {
    question: "How are payments processed?",
    answer:
      "Payments are securely processed through Paystack. We do not store customers' debit card, credit card, or bank account information on our servers.",
  },
  {
    question: "When will I receive my comic?",
    answer:
      "Digital comics become available immediately after successful payment confirmation. There is no shipping or delivery delay because all products are digital.",
  },
  {
    question: "How do I read my purchased comics?",
    answer:
      "After purchasing a comic, simply sign in to your account and access your purchased comics from your library. You can read them directly through our platform.",
  },
  {
    question: "Do I need an account?",
    answer:
      "Yes. Customers must create an account before purchasing comics so that purchased content can be securely linked to their account for future access.",
  },
  {
    question: "Can I download or redistribute purchased comics?",
    answer:
      "Purchased comics are licensed for your personal use only. Copying, redistributing, reselling, or sharing purchased content without authorization is prohibited under our Terms & Conditions.",
  },
  {
    question: "Can I request a refund?",
    answer:
      "Due to the nature of digital products, completed purchases are generally non-refundable once access has been granted. However, we may review requests involving duplicate payments, incorrect charges, or technical issues that prevent successful delivery of purchased content.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Payment methods available during checkout are provided by Paystack and may include debit cards, bank transfers, USSD, mobile money, and other supported payment options depending on your location.",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Yes. Payment transactions are handled securely through Paystack using industry-standard security practices. PC Comics does not store customers' payment card details.",
  },
  {
    question: "How do I contact customer support?",
    answer:
      "If you have questions regarding your account, purchases, payments, or technical issues, please visit our Contact page and send us an email. We aim to respond within 24–48 hours during our support hours.",
  },
  {
    question: "Can I preview comics before purchasing?",
    answer:
      "Comic listings include cover artwork, descriptions, and pricing information to help customers make informed purchasing decisions before checkout.",
  },
  {
    question: "How often are new comics added?",
    answer:
      "We continually work on expanding our collection. Readers may also subscribe to our newsletter to receive notifications whenever new comics become available on the platform.",
  },
  {
    question: "Where can I read your policies?",
    answer:
      "Our Terms & Conditions, Privacy Policy, and Refund Policy are available from the footer of our website and can be reviewed at any time before creating an account or making a purchase.",
  },
];

export default function FAQPage() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "60px 24px",
        color: "var(--text)",
      }}
    >
      <h1
        style={{
          fontSize: 42,
          fontWeight: 800,
          marginBottom: 12,
        }}
      >
        Frequently Asked Questions
      </h1>

      <p
        style={{
          fontSize: 18,
          opacity: 0.8,
          marginBottom: 40,
          lineHeight: 1.8,
        }}
      >
        This page answers common questions about PC Comics, our digital comic
        platform, purchasing process, payments, customer accounts, and support
        services.
      </p>

      {faqs.map((faq, index) => (
        <div
          key={index}
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: 24,
              marginBottom: 14,
            }}
          >
            {faq.question}
          </h2>

          <p
            style={{
              margin: 0,
              lineHeight: 1.9,
              opacity: 0.9,
            }}
          >
            {faq.answer}
          </p>
        </div>
      ))}
    </main>
  );
}
export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for our online comic platform.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>

      <p className="text-gray-600 mb-8">
        Effective Date: {new Date().toLocaleDateString()}
      </p>

      <p className="mb-8">
        At <strong>PC Comics</strong>, we respect your privacy and are
        committed to protecting your personal information. This Privacy Policy
        explains what information we collect, how we use it, and the choices
        you have regarding your data.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          1. Information We Collect
        </h2>

        <p className="mb-3">
          We may collect the following information when you use our platform:
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>Name</li>
          <li>Email address</li>
          <li>Encrypted account password</li>
          <li>Purchase history</li>
          <li>Payment transaction references</li>
          <li>Device and browser information</li>
          <li>IP address and usage logs</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          2. How We Use Your Information
        </h2>

        <p>We use your information to:</p>

        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Create and manage your account.</li>
          <li>Process purchases.</li>
          <li>Deliver purchased digital comics.</li>
          <li>Provide customer support.</li>
          <li>Improve our platform and services.</li>
          <li>Prevent fraud and unauthorized activity.</li>
          <li>Comply with legal obligations.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          3. Payment Information
        </h2>

        <p>
          Payments are securely processed through <strong>Paystack</strong>. We
          do not store your debit card, credit card, or bank account details on
          our servers.
        </p>

        <p className="mt-3">
          We receive only the information necessary to verify successful
          transactions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          4. Cookies
        </h2>

        <p>
          We may use cookies and similar technologies to keep you signed in,
          remember your preferences, improve website performance, and analyze
          how our services are used.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          5. Sharing Your Information
        </h2>

        <p className="mb-3">
          We do not sell your personal information.
        </p>

        <p>
          We may share information only with trusted service providers that help
          us operate our platform, such as payment processors, hosting
          providers, or where required by law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          6. Data Security
        </h2>

        <p>
          We implement reasonable technical and organizational measures to
          protect your information from unauthorized access, disclosure,
          alteration, or destruction.
        </p>

        <p className="mt-3">
          While we strive to protect your data, no online service can guarantee
          absolute security.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          7. Your Rights
        </h2>

        <p>You may request to:</p>

        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Access your personal information.</li>
          <li>Correct inaccurate information.</li>
          <li>Delete your account where legally permitted.</li>
          <li>Contact us regarding privacy concerns.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          8. Changes to This Policy
        </h2>

        <p>
          We may update this Privacy Policy from time to time. Updates become
          effective once published on this page.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          9. Contact Us
        </h2>

        <p>If you have any questions about this Privacy Policy, contact us:</p>

        <div className="mt-4">
          <p>
            <strong>Email:</strong> 04adakings@gmail.com
          </p>

          
        </div>
      </section>

      <hr className="my-10" />

      <p className="text-sm text-gray-500">
        By using our platform, you consent to the collection and use of your
        information as described in this Privacy Policy.
      </p>
    </main>
  );
}
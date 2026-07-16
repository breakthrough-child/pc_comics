export const metadata = {
  title: "Terms & Conditions",
  description: "Terms and Conditions for using our online comic platform.",
};

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>

      <p className="text-gray-600 mb-8">
        Effective Date: {new Date().toLocaleDateString()}
      </p>

      <p className="mb-8">
        Welcome to <strong>PC Comics</strong>. By creating an account,
        browsing our website, or purchasing digital comics from us, you agree
        to these Terms and Conditions. If you do not agree with these terms,
        please do not use our services.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          1. Acceptance of Terms
        </h2>

        <p>
          By accessing or using this website, you confirm that you have read,
          understood, and agree to be bound by these Terms and Conditions and
          any applicable laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          2. User Accounts
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>You must provide accurate registration information.</li>
          <li>You are responsible for keeping your account secure.</li>
          <li>You are responsible for all activities under your account.</li>
          <li>
            We reserve the right to suspend or terminate accounts that violate
            these Terms.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          3. Digital Comic Purchases
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>All comics sold on this platform are digital products.</li>
          <li>Prices are displayed on each comic before purchase.</li>
          <li>
            Once payment has been successfully completed, eligible comics will
            become available in your account.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          4. Intellectual Property
        </h2>

        <p>
          All comics, artwork, logos, graphics, text, and other content on this
          platform are protected by copyright and intellectual property laws.
        </p>

        <p className="mt-3">
          You may purchase comics for your personal use only. You may not:
        </p>

        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>Copy or reproduce comics.</li>
          <li>Redistribute purchased comics.</li>
          <li>Sell or resell digital comics.</li>
          <li>Upload comics to other websites or platforms.</li>
          <li>Modify or remove copyright notices.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          5. Payments
        </h2>

        <p>
          Payments are securely processed through Paystack. We do not store your
          card or banking information on our servers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          6. Refunds
        </h2>

        <p>
          Refunds are governed by our Refund Policy. By purchasing digital
          content, you acknowledge that refund eligibility is limited due to the
          nature of digital products.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          7. Prohibited Activities
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>Attempting unauthorized access.</li>
          <li>Using automated bots without permission.</li>
          <li>Uploading malicious software.</li>
          <li>Harassing other users.</li>
          <li>Violating applicable laws.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          8. Limitation of Liability
        </h2>

        <p>
          We provide our platform on an "as is" and "as available" basis. We
          are not liable for indirect, incidental, or consequential damages
          arising from the use of our services, except where required by law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          9. Changes to These Terms
        </h2>

        <p>
          We may update these Terms and Conditions from time to time. Continued
          use of the platform after changes have been published constitutes
          acceptance of the updated Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          10. Contact Information
        </h2>

        <p>
          If you have questions regarding these Terms and Conditions, please
          contact us.
        </p>

        <div className="mt-4">
          <p><strong>Email:</strong> 04adakings@gmail.com</p>
          
        </div>
      </section>

      <hr className="my-10" />

      <p className="text-sm text-gray-500">
        By using this platform or creating an account, you acknowledge that you
        have read, understood, and agreed to these Terms and Conditions.
      </p>
    </main>
  );
}
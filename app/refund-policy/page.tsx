export const metadata = {
  title: "Refund Policy",
  description: "Refund Policy for our online comic platform.",
};

export default function RefundPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-2">Refund Policy</h1>

      <p className="text-gray-600 mb-8">
        Effective Date: {new Date().toLocaleDateString()}
      </p>

      <p className="mb-8">
        Thank you for shopping with <strong>PC Comics</strong>. Please
        read this Refund Policy carefully before making a purchase.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          1. Digital Products
        </h2>

        <p>
          All comics sold on our platform are digital products that become
          accessible immediately after a successful payment.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          2. No Refunds After Purchase
        </h2>

        <p>
          Due to the nature of digital content, all completed purchases are
          final. Once a comic has been purchased and access has been granted, we
          do not offer refunds, exchanges, or cancellations.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          3. Exceptional Circumstances
        </h2>

        <p>
          We may review refund requests only in limited circumstances, including:
        </p>

        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li>A duplicate payment for the same comic.</li>
          <li>A payment was successful but the comic was not delivered due to a technical issue that we cannot resolve.</li>
          <li>An incorrect charge caused by a system error.</li>
        </ul>

        <p className="mt-4">
          Each request will be reviewed individually. We reserve the right to
          approve or decline a refund where appropriate.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          4. Contact Us
        </h2>

        <p>
          If you experience a payment problem or believe you have been charged
          incorrectly, please contact us as soon as possible.
        </p>

        <div className="mt-4">
          <p>
            <strong>Email:</strong> 04adakings@gmail.com
          </p>

          
        </div>
      </section>

      <hr className="my-10" />

      <p className="text-sm text-gray-500">
        By purchasing digital comics from our platform, you acknowledge that
        you have read and agreed to this Refund Policy.
      </p>
    </main>
  );
}
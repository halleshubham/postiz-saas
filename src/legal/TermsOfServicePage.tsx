export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold">Terms of Service</h1>
      <p className="text-muted-foreground mt-2 text-sm">Last updated: April 2025</p>

      <section className="prose prose-neutral dark:prose-invert mt-8 max-w-none space-y-6">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account or using Shacky Social ("the Service"), you agree to these Terms
          of Service. If you do not agree, do not use the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Shacky Social is a subscription portal that provides access to a managed Postiz
          workspace for social media scheduling. The Service includes account management,
          subscription billing via Stripe, and access to the Postiz platform at{" "}
          <a href="https://app.shackyapps.in" target="_blank" rel="noopener noreferrer">
            app.shackyapps.in
          </a>.
        </p>

        <h2>3. Accounts</h2>
        <p>
          You are responsible for maintaining the security of your account credentials. You must
          provide accurate information when registering and keep your email address up to date.
        </p>

        <h2>4. Subscriptions & Billing</h2>
        <ul>
          <li>
            Paid plans are billed on a recurring basis (monthly or yearly) through Stripe.
          </li>
          <li>
            You may cancel at any time; access continues until the end of the current billing
            period.
          </li>
          <li>Refunds are handled on a case-by-case basis at our discretion.</li>
        </ul>

        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose.</li>
          <li>Attempt to reverse-engineer, exploit, or disrupt the Service.</li>
          <li>Post content that violates the terms of connected social media platforms.</li>
          <li>Share your account credentials with unauthorized parties.</li>
        </ul>

        <h2>6. Limitation of Liability</h2>
        <p>
          The Service is provided "as is" without warranties of any kind. To the maximum extent
          permitted by law, Shacky Social shall not be liable for any indirect, incidental, or
          consequential damages arising from your use of the Service.
        </p>

        <h2>7. Termination</h2>
        <p>
          We may suspend or terminate your account if you violate these terms. Upon termination,
          your access to the Service and the associated Postiz workspace will be revoked.
        </p>

        <h2>8. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms. Material changes will be communicated via
          email to registered users at least 14 days before taking effect.
        </p>

        <h2>9. Contact</h2>
        <p>
          Questions about these terms? Email{" "}
          <a href="mailto:support@shackyapps.in">support@shackyapps.in</a>.
        </p>
      </section>
    </main>
  );
}

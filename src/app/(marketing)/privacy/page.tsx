export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold">Privacy Policy</h1>
      <p className="text-muted-foreground mt-2 text-sm">Last updated: April 2025</p>

      <section className="prose prose-neutral dark:prose-invert mt-8 max-w-none space-y-6">
        <h2>1. Information We Collect</h2>
        <p>
          When you create an account on Shacky Social we collect your email address and, if you
          subscribe to a paid plan, payment information processed securely by Stripe. We do not
          store credit card numbers on our servers.
        </p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provision and manage your Shacky Social account and subscription.</li>
          <li>To create a corresponding workspace in the Postiz platform on your behalf.</li>
          <li>To communicate important account and service updates.</li>
          <li>To comply with legal obligations.</li>
        </ul>

        <h2>3. Data Sharing</h2>
        <p>
          We do not sell your personal data. We share information only with the following
          third-party services that are necessary to operate Shacky Social:
        </p>
        <ul>
          <li><strong>Stripe</strong> — payment processing.</li>
          <li><strong>Postiz (self-hosted)</strong> — social media scheduling engine.</li>
        </ul>

        <h2>4. Data Retention</h2>
        <p>
          We retain your account data for as long as your account is active. If you delete your
          account, we will remove your personal data within 30 days, except where retention is
          required by law.
        </p>

        <h2>5. Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal data at any time
          by contacting us at <a href="mailto:support@shackyapps.in">support@shackyapps.in</a>.
        </p>

        <h2>6. Cookies</h2>
        <p>
          We use essential cookies to keep you logged in. We may use optional analytics cookies
          (e.g., Plausible Analytics) that do not track personal data.
        </p>

        <h2>7. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. We will notify registered users of material
          changes via email.
        </p>

        <h2>8. Contact</h2>
        <p>
          For privacy-related questions, email{" "}
          <a href="mailto:support@shackyapps.in">support@shackyapps.in</a>.
        </p>
      </section>
    </main>
  );
}

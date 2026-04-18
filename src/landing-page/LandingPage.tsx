import { CalendarClock, Globe, Rocket, Shield, Zap } from "lucide-react";
import { Link as WaspRouterLink, routes } from "wasp/client/router";

const features = [
  {
    title: "Self-Hosted Postiz, Fully Managed",
    description:
      "We run a dedicated self-hosted Postiz instance so you get the full open-source scheduling engine without touching a server. Your workspace is created the moment you sign up.",
    icon: Globe,
  },
  {
    title: "Schedule Across Every Platform",
    description:
      "Publish to X (Twitter), Instagram, Facebook, LinkedIn, Telegram, and more from a single dashboard. Connect your accounts in Postiz and schedule weeks of content in minutes.",
    icon: CalendarClock,
  },
  {
    title: "Simple, Transparent Plans",
    description:
      "Pick the plan that fits your team. Starter gives you 5 channels and 400 posts/month. Growth unlocks 30 channels with virtually unlimited posts. Cancel anytime.",
    icon: Zap,
  },
  {
    title: "Your Data, Our Infrastructure",
    description:
      "Everything runs on infrastructure we control. No third-party analytics harvesting your content. Your social tokens stay inside the Postiz instance and never leave.",
    icon: Shield,
  },
  {
    title: "Up and Running in Two Minutes",
    description:
      "Sign up, name your workspace, and you're in. We handle account provisioning, database setup, and Postiz configuration behind the scenes. You just start scheduling.",
    icon: Rocket,
  },
];

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative min-h-[84vh] overflow-hidden">
        <div className="from-primary/5 via-background to-background absolute inset-0 bg-gradient-to-b" />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <p className="text-primary text-sm font-semibold uppercase tracking-wide">
            Powered by self-hosted Postiz
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-bold tracking-tight md:text-6xl">
            Social Media Scheduling for Your Company — Without the DevOps
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg">
            Shacky Social gives your team a ready-to-use{" "}
            <a
              href="https://postiz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              Postiz
            </a>{" "}
            workspace for scheduling posts across X, Instagram, LinkedIn, Facebook, Telegram, and
            more. We host and manage the open-source Postiz instance — you just sign up, pick a
            plan, and start publishing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <WaspRouterLink
              to={routes.SignupRoute.to}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-3 text-sm font-semibold"
            >
              Get started free
            </WaspRouterLink>
            <WaspRouterLink
              to={routes.PricingPageRoute.to}
              className="border-border hover:border-primary rounded-md border px-5 py-3 text-sm font-semibold"
            >
              View pricing
            </WaspRouterLink>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold">How it works</h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-center">
            Three steps from sign-up to your first scheduled post.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create your workspace",
                body: "Sign up with your email, name your company, and we instantly provision a Postiz account for you on our self-hosted instance.",
              },
              {
                step: "2",
                title: "Choose a plan",
                body: "Start free or pick Starter / Growth depending on how many social channels and posts your team needs each month.",
              },
              {
                step: "3",
                title: "Open Postiz & start scheduling",
                body: "Click \"Go to Postiz\" from your dashboard, connect your social accounts, and schedule your first post. That's it.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="text-center">
                <span className="bg-primary text-primary-foreground mx-auto flex size-10 items-center justify-center rounded-full text-lg font-bold">
                  {step}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold">Why Shacky Social?</h2>
          <p className="text-muted-foreground mt-3">
            All the power of self-hosted Postiz, none of the setup. We handle the infrastructure
            so your team can focus on content.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <article key={title} className="border-border rounded-md border p-6">
              <Icon className="text-primary mb-4 size-7" />
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary px-6 py-16 text-center">
        <h2 className="text-primary-foreground text-3xl font-bold">
          Ready to simplify your social media?
        </h2>
        <p className="text-primary-foreground/80 mx-auto mt-3 max-w-lg">
          Create your free workspace in under a minute. No credit card required.
        </p>
        <WaspRouterLink
          to={routes.SignupRoute.to}
          className="bg-background text-foreground hover:bg-background/90 mt-6 inline-block rounded-md px-6 py-3 text-sm font-semibold"
        >
          Sign up for free
        </WaspRouterLink>
      </section>

      {/* Footer */}
      <footer className="border-border border-t px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 text-sm md:flex-row">
          <div>
            <p className="font-semibold">Shacky Social</p>
            <p className="text-muted-foreground mt-1">
              Managed social scheduling powered by{" "}
              <a
                href="https://postiz.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Postiz
              </a>{" "}
              (self-hosted).
            </p>
          </div>
          <div className="flex gap-4 text-muted-foreground">
            <WaspRouterLink to="/privacy" className="hover:text-foreground">
              Privacy
            </WaspRouterLink>
            <WaspRouterLink to="/terms" className="hover:text-foreground">
              Terms
            </WaspRouterLink>
          </div>
        </div>
      </footer>
    </div>
  );
}

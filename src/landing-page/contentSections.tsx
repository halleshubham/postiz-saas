import daBoiAvatar from "../client/static/da-boi.webp";
import { DocsUrl, BlogUrl } from "../shared/common";
import type { GridFeature } from "./components/FeaturesGrid";

export const features: GridFeature[] = [
  {
    name: "Self-Hosted Postiz, Fully Managed",
    description:
      "We run a dedicated self-hosted Postiz instance so you get the full open-source scheduling engine without touching a server.",
    emoji: "🖥️",
    href: DocsUrl,
    size: "large",
  },
  {
    name: "Multi-Platform Scheduling",
    description:
      "Publish to X, Instagram, Facebook, LinkedIn, Telegram, and more from one Postiz dashboard. Connect once, schedule everywhere.",
    emoji: "📅",
    href: DocsUrl,
    size: "medium",
  },
  {
    name: "Simple, Transparent Plans",
    description:
      "Starter gives you 5 channels and 400 posts/month. Growth unlocks 30 channels with virtually unlimited posts. Cancel anytime.",
    emoji: "💳",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Team Collaboration",
    description:
      "Create a company workspace and invite your team. Everyone schedules from the same Postiz account.",
    emoji: "👥",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Your Data, Our Infrastructure",
    description:
      "Everything runs on servers we control. No third-party analytics harvesting your content. Social tokens never leave the Postiz instance.",
    emoji: "🔒",
    href: DocsUrl,
    size: "medium",
  },
  {
    name: "Up and Running in Two Minutes",
    description:
      "Sign up, name your workspace, and your Postiz account is provisioned instantly. No config files, no Docker, no DNS records.",
    emoji: "⚡",
    href: DocsUrl,
    size: "small",
  },
];

export const testimonials = [
  {
    name: "Early Adopter",
    role: "Social Media Manager",
    avatarSrc: daBoiAvatar,
    socialUrl: "#",
    quote:
      "We wanted Postiz but didn't want to self-host it. Shacky Social gave us the exact same tool with zero DevOps.",
  },
  {
    name: "Startup Founder",
    role: "CEO @ Growing Startup",
    avatarSrc: daBoiAvatar,
    socialUrl: "#",
    quote:
      "Signed up, connected our LinkedIn and X accounts, and had a week of posts scheduled in one sitting. Couldn't be simpler.",
  },
  {
    name: "Marketing Lead",
    role: "Head of Marketing",
    avatarSrc: daBoiAvatar,
    socialUrl: "#",
    quote:
      "The fact that it's Postiz under the hood means we're not locked into some proprietary tool. If we ever want to self-host, we can.",
  },
];

export const faqs = [
  {
    id: 1,
    question: "What is Shacky Social?",
    answer:
      "Shacky Social is a subscription portal that gives your team access to a fully managed, self-hosted Postiz instance. Postiz is an open-source social media scheduling tool. We handle hosting, updates, and backups — you just log in and schedule.",
    href: "#",
  },
  {
    id: 2,
    question: "What is Postiz?",
    answer:
      "Postiz is an open-source social media scheduling platform. It lets you connect accounts on X, Instagram, Facebook, LinkedIn, Telegram, and more, then compose and schedule posts from a single dashboard. Shacky Social runs a self-hosted Postiz instance so you don't have to.",
    href: "https://postiz.com",
  },
  {
    id: 3,
    question: "What platforms can I schedule posts to?",
    answer:
      "Anything Postiz supports: X (Twitter), Instagram, Facebook, LinkedIn, Telegram, YouTube, TikTok, Pinterest, and more. New integrations are added as Postiz releases them.",
    href: "#",
  },
  {
    id: 4,
    question: "Can I cancel my subscription?",
    answer:
      "Yes, cancel anytime from your dashboard. Your access continues until the end of the current billing period. No hidden fees.",
    href: "#",
  },
  {
    id: 5,
    question: "Is my data safe?",
    answer:
      "Yes. The Postiz instance runs on our own infrastructure — your social tokens and content never pass through third-party services. We don't sell or share your data.",
    href: "#",
  },
];

export const footerNavigation = {
  app: [
    { name: "Documentation", href: DocsUrl },
    { name: "Blog", href: BlogUrl },
  ],
  company: [
    { name: "About", href: "https://shackyapps.in" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

export const examples: { name: string; description: string; imageSrc: string; href: string }[] = [];

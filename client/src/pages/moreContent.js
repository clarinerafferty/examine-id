import {
  BadgeInfo,
  BookMarked,
  CircleHelp,
  Database,
  MessageSquareMore,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const moreSections = [
  {
    title: "About",
    items: [
      {
        icon: Sparkles,
        accent: "gold",
        title: "About examine.id",
        description: "What the platform does and what is included today.",
        to: "/about/platform",
      },
      {
        icon: CircleHelp,
        accent: "gold",
        title: "How to use the app",
        description: "A quick walkthrough of dashboards, details, and feedback views.",
        to: "/about/how-to-use",
      },
    ],
  },
  {
    title: "Data",
    items: [
      {
        icon: Database,
        accent: "olive",
        title: "Data & methodology",
        description: "How allowance, benchmark, and sentiment records are structured.",
        to: "/about/methodology",
      },
      {
        icon: BookMarked,
        accent: "olive",
        title: "Glossary",
        description: "Plain-language definitions for benchmark and variance terms.",
        to: "/about/glossary",
      },
    ],
  },
  {
    title: "Trust & Safety",
    items: [
      {
        icon: ShieldCheck,
        accent: "red",
        title: "Privacy & ethics",
        description: "How responses, benchmark comparisons, and source boundaries are handled.",
        to: "/about/privacy",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        icon: MessageSquareMore,
        accent: "neutral",
        title: "Contact support",
        description: "Get help from the support team or product owner.",
        to: "/about/support",
      },
      {
        icon: BadgeInfo,
        accent: "neutral",
        title: "Version & credits",
        description: "Project scope, stack overview, and release context.",
        to: "/about/credits",
      },
    ],
  },
];

const methodologySteps = [
  {
    title: "Allowance records",
    body:
      "Each record is organised by reporting period, MP, and allowance category so the app can compare the same type of spending over time.",
  },
  {
    title: "Benchmark reference",
    body:
      "Each category is paired with a benchmark value or reference estimate. These benchmark figures are stored with source metadata so the comparison stays explainable.",
  },
  {
    title: "Variance calculation",
    body:
      "Variance shows how far reported spending sits above or below the benchmark. Positive percentages indicate spending above the benchmark and negative values indicate spending below it.",
  },
  {
    title: "Feedback layer",
    body:
      "Feedback trends sit alongside the financial views so people can compare spending patterns with public sentiment. The current release uses seeded records while the collection pipeline is expanded.",
  },
];

const sourceCards = [
  {
    category: "Travel and Accommodation",
    source:
      "BPS Consumer Price of Selected Goods and Services for Health, Transportation, and Education Groups of 150 Regencies/Municipalities in Indonesia 2024",
    method:
      "Use transport-related average prices as the main reference and combine them with lodging-related inputs if accommodation needs to be reflected.",
    status: "Source-linked estimate",
    url:
      "https://www.bps.go.id/en/publication/2025/04/28/ed4d29c5d13ba67371799c58/harga-konsumen-beberapa-barang-dan-jasa-kelompok-kesehatan--transportasi--dan-pendidikan-150-kabupaten-kota-di-indonesia-2024.html",
  },
  {
    category: "Constituency Office Operations",
    source:
      "BPS Consumer Price of Selected Goods and Services for Housing, Water, Electricity, and Household Fuel Group of 150 Regencies/Municipalities in Indonesia 2024",
    method:
      "Use rent and utilities as the closest recurring-cost reference for office operations.",
    status: "Source-linked estimate",
    url:
      "https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html",
  },
  {
    category: "Community Outreach",
    source: "BPS National Consumer Price of Selected Goods and Services 2024",
    method:
      "Use printing, communications, or event-support related items as the closest available reference for outreach spending.",
    status: "Source-linked estimate",
    url:
      "https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html",
  },
  {
    category: "Digital Communications",
    source: "BPS National Consumer Price of Selected Goods and Services 2024",
    method:
      "Use internet, phone-credit, or telecom-service pricing as the benchmark basis for digital communication costs.",
    status: "Source-linked estimate",
    url:
      "https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html",
  },
  {
    category: "Staff and Research Support",
    source: "No single clean BPS consumer-price item has been selected yet",
    method:
      "This category currently uses a seeded reference estimate until a defensible wage or labour-cost dataset is selected.",
    status: "Seeded reference",
  },
];

const glossaryTerms = [
  {
    term: "Benchmark",
    definition:
      "A reference market price or estimate used to check whether reported spending looks above or below a typical external cost.",
  },
  {
    term: "Variance vs benchmark",
    definition:
      "The percentage difference between reported spending and the chosen benchmark for that category.",
  },
  {
    term: "Overspend / underspend",
    definition:
      "A positive value means spending is above the benchmark. A negative value means spending is below it.",
  },
  {
    term: "Seeded data",
    definition:
      "Data loaded into the application so the full experience is available end to end. It should be read as the current dataset and expanded or replaced as more source-verified records are added.",
  },
];

export const morePages = {
  platform: {
    title: "About examine.id",
    hero: {
      kicker: "About examine.id",
      title: "A mobile-first way to explore MP allowance patterns with context.",
      description:
        "Examine.ID brings together allowance records, benchmark comparisons, and public sentiment in one place so people can move from headline numbers to deeper explanation quickly.",
      meta: ["Allowance tracking", "Benchmark comparisons", "Feedback trends"],
    },
    sections: [
      {
        type: "cards",
        badge: { icon: Sparkles, label: "Overview" },
        title: "What the platform delivers today",
        items: [
          {
            title: "A single place to compare spending",
            body:
              "Users can browse spending by category or by MP, then move into detail pages without losing the wider context.",
          },
          {
            title: "Context beyond raw amounts",
            body:
              "Benchmark comparisons help show whether a value sits above, near, or below an external reference instead of leaving users with standalone totals.",
          },
          {
            title: "A full in-app flow",
            body:
              "Dashboard views, allowance drill-downs, feedback pages, and support links are all available from the current build.",
          },
        ],
      },
      {
        type: "note",
        variant: "callout",
        icon: Sparkles,
        label: "Current dataset",
        title: "How to read the current dataset",
        body:
          "The current build references real public MP identities from DKI Jakarta and real BPS publication pages where suitable sources exist. Some spending and benchmark records remain seeded while verified coverage is expanded.",
      },
    ],
    cta: {
      badge: { icon: Database, label: "Next", tone: "olive" },
      title: "Want the full source explanation?",
      body: "Open the methodology page to see how benchmarks, variance, and reference estimates are handled in the app.",
      label: "Open methodology",
      to: "/about/methodology",
    },
  },
  "how-to-use": {
    title: "How to use the app",
    hero: {
      kicker: "How to use the app",
      title: "Move from overview to detail in a few taps.",
      description:
        "The app is designed to be read from the dashboard first, then narrowed into categories, MPs, and supporting context when something stands out.",
      meta: ["Dashboard first", "Tap into detail", "Use More for context"],
    },
    sections: [
      {
        type: "steps",
        badge: { icon: CircleHelp, label: "Walkthrough" },
        title: "Recommended path through the product",
        copy: "This route helps new users understand the app quickly without needing a tutorial overlay.",
        items: [
          {
            title: "Start on the dashboard",
            body:
              "Use the dashboard to spot unusually high variance, rising trends, and the categories with the biggest benchmark gaps.",
          },
          {
            title: "Open Allowances",
            body:
              "Switch between category view and MP view depending on whether you want to compare one spending type or one person.",
          },
          {
            title: "Inspect a detail page",
            body:
              "Tap a category or MP to see the monthly view, benchmark comparison, and the key values behind the summary cards.",
          },
          {
            title: "Review feedback signals",
            body:
              "Use the feedback page to compare allowance patterns with anonymous response trends submitted from the app.",
          },
          {
            title: "Use More for context",
            body:
              "Open More whenever you need definitions, methodology, privacy notes, or product information.",
          },
        ],
      },
      {
        type: "note",
        variant: "callout",
        icon: CircleHelp,
        label: "Tip",
        title: "Before you compare",
        body:
          "If a chart or rank feels surprising, check the methodology page before drawing conclusions. Benchmarks are reference points, not final judgments.",
      },
    ],
  },
  methodology: {
    title: "Data & methodology",
    hero: {
      kicker: "Data & methodology",
      title: "How benchmark comparison works inside Examine.ID.",
      description:
        "This page explains how allowance records are structured, how benchmark values are attached to categories, and how the current source strategy supports the comparison views.",
      meta: ["Allowance records", "Benchmark logic", "Source strategy"],
    },
    sections: [
      {
        type: "steps",
        badge: { icon: Database, label: "Method", tone: "olive" },
        title: "How the comparison model works",
        copy:
          "The current app flow compares reported category spending against a stored benchmark so users can quickly see whether a category or MP appears above, near, or below a documented external reference point.",
        items: methodologySteps,
      },
      {
        type: "sources",
        badge: { icon: BookMarked, label: "Sources", tone: "mustard" },
        title: "Current benchmark source plan by category",
        copy:
          "The current sourcing plan uses BPS publications wherever a reasonable category reference exists. Where there is no clean match yet, the app labels that benchmark as a seeded reference estimate instead of overstating confidence.",
        items: sourceCards,
      },
      {
        type: "note",
        variant: "callout",
        icon: CircleHelp,
        label: "Reading the numbers",
        title: "Important context",
        body:
          "A benchmark is not a claim of wrongdoing. It is a reference point that helps users identify categories worth investigating further. Context, reporting rules, and missing source detail still matter.",
      },
    ],
    cta: {
      badge: { icon: MessageSquareMore, label: "Support", tone: "neutral" },
      title: "Found something unclear?",
      body: "If you need help with the app or want to raise an issue directly, get in touch!",
      label: "Contact support",
      to: "/about/support",
    },
  },
  glossary: {
    title: "Glossary",
    hero: {
      kicker: "Glossary",
      title: "Plain-language terms for the key ideas used across the app.",
      description:
        "These definitions are written for quick reading on mobile so users can understand charts and summaries without specialist budget knowledge.",
      meta: ["Benchmark terms", "Variance terms", "Quick definitions"],
    },
    sections: [
      {
        type: "glossary",
        badge: { icon: BookMarked, label: "Definitions", tone: "mustard" },
        title: "Key terms",
        items: glossaryTerms,
      },
      {
        type: "note",
        variant: "ethics",
        title: "Plain-language commitment",
        body:
          "Definitions in Examine.ID are intended to explain the meaning of a metric, not to justify a political conclusion. The goal is clarity first.",
      },
    ],
  },
  privacy: {
    title: "Privacy & ethics",
    hero: {
      kicker: "Privacy & ethics",
      title: "How responses, references, and public data are handled.",
      description:
        "This page explains the boundaries used when presenting allowance comparisons and public feedback so the product stays clear, fair, and privacy-aware.",
      meta: ["Anonymous responses", "Public information", "Clear boundaries"],
    },
    sections: [
      {
        type: "cards",
        badge: { icon: ShieldCheck, label: "Privacy", tone: "red" },
        title: "How this area is handled",
        items: [
          {
            title: "Anonymous in-app responses",
            body:
              "Feedback shown in the app is presented as anonymous response data rather than as identifiable personal profiles.",
          },
          {
            title: "Public-source comparison context",
            body:
              "Allowance benchmarks are tied to public reference material where available so users can inspect the source basis rather than rely on unexplained labels.",
          },
          {
            title: "Clear dataset boundaries",
            body:
              "Seeded records should remain distinguishable from source-verified records as coverage expands, so users can understand the current confidence level of the dataset.",
          },
        ],
      },
      {
        type: "note",
        variant: "ethics",
        title: "Ethics note",
        body:
          "Examine.ID is designed for transparency and explanation, not accusation. The app highlights patterns for review and discussion rather than presenting benchmark differences as proof of misconduct.",
      },
    ],
  },
  support: {
    title: "Contact support",
    hero: {
      kicker: "Contact support",
      title: "Need help with the app?",
      description:
        "Get in touch if you run into an issue, need support, or want to share further information.",
      meta: [],
    },
    sections: [
      {
        type: "cards",
        badge: { icon: MessageSquareMore, label: "Support", tone: "neutral" },
        title: "Support contacts",
        items: [
          {
            title: "Email",
            body:
              "support@examineid.app",
          },
          {
            title: "Phone",
            body:
              "+62 21 555 0123",
          },
          {
            title: "When to contact support",
            body:
              "Use support if you experience issues with the app, need direct help, or want to share further information.",
          },
        ],
      },
      {
        type: "note",
        variant: "callout",
        icon: MessageSquareMore,
        label: "Tip",
        title: "Before you contact support",
        body:
          "Include the page or feature you were using and a short description of the issue so it is easier to help quickly.",
      },
    ],
  },
  credits: {
    title: "Version & credits",
    hero: {
      kicker: "Version & credits",
      title: "Release context, project scope, and build foundations.",
      description:
        "This page summarises what powers the current build and where the product context comes from.",
      meta: ["Current build", "Stack overview", "Source context"],
    },
    sections: [
      {
        type: "cards",
        badge: { icon: BadgeInfo, label: "Build info", tone: "neutral" },
        title: "Current release notes",
        items: [
          {
            title: "Product scope",
            body:
              "Examine.ID is a mobile-first transparency application focused on MP allowances, category benchmarks, and feedback signals.",
          },
          {
            title: "Technology stack",
            body:
              "The current build uses React and Vite on the frontend with an Express and MySQL backend.",
          },
          {
            title: "Reference sources",
            body:
              "Benchmark provenance currently points to BPS publication pages where a documented category reference has been selected.",
          },
          {
            title: "Current dataset state",
            body:
              "The app uses seeded records so the full user journey remains available while broader source-verified coverage is added.",
          },
        ],
      },
    ],
  },
};

export function getMorePageMeta(slug) {
  if (!slug) {
    return null;
  }

  return morePages[slug] || null;
}

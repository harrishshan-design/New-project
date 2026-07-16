"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Gavel,
  Layers3,
  LockKeyhole,
  MapPin,
  MousePointer2,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  WandSparkles,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const HeroSkyline = dynamic(() => import("./HeroSkyline"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-[1.9rem] bg-white/[0.04]" />
});

const StreetRide = dynamic(() => import("./StreetRide"), {
  ssr: false,
  loading: () => <div className="h-screen" />
});

const navItems = ["Platform", "Products", "About", "Contact"];

const popularAreas = ["KLCC", "Mont Kiara", "Shah Alam", "Petaling Jaya", "Penang", "Johor Bahru"];

const problems = [
  {
    title: "Manual listing work slows agents down",
    body: "Property details, photos, captions, WhatsApp copy, and admin review are usually scattered across chats and spreadsheets."
  },
  {
    title: "Buyer matching feels like a directory",
    body: "Most portals still make buyers search manually instead of understanding intent, affordability, location fit, and agent response."
  },
  {
    title: "Approval workflows are too slow",
    body: "Agents need speed, but marketplaces need trust. RealityGenius gives both with structured AI import and admin QC."
  }
];

type IconCard = {
  title: string;
  body: string;
  icon: LucideIcon;
};

const products: IconCard[] = [
  { title: "AI Property Search", body: "Buyer search with AI match scoring, saved alerts, property details, maps, and direct agent contact.", icon: Sparkles },
  { title: "Agent Workspace", body: "A practical AgentOS for listings, leads, content, viewing preparation, and follow-up workflows.", icon: Users },
  { title: "Telegram AI Import", body: "Agents send listings through Telegram. AI extracts facts, photos, price, location, and missing fields.", icon: Send },
  { title: "Friday Auction Night", body: "Selected homes become weekly live offer events with safer non-binding highest-offer wording.", icon: Gavel },
  { title: "Admin Review", body: "Admin QC approves agents, checks listings, reviews imports, and publishes verified supply to buyers.", icon: ShieldCheck },
  { title: "AI Caption Generator", body: "Generate property titles, descriptions, SEO keywords, social captions, and WhatsApp messages.", icon: WandSparkles }
];

const workflow: IconCard[] = [
  { title: "Upload Listing", body: "Agent uploads manually, from Excel, or through Telegram.", icon: UploadCloud },
  { title: "AI Structures Data", body: "AI extracts price, area, rooms, photos, captions, and missing fields.", icon: Layers3 },
  { title: "Buyer Discovers Smarter", body: "Approved listings appear with AI matching, alerts, and contact workflows.", icon: BadgeCheck }
];

const faqs = [
  ["Is RealityGenius a property portal?", "It is more than a portal. RealityGenius connects buyers, agents, listing import, admin approval, and AI workflows in one property operating platform."],
  ["Can agents upload from Telegram?", "Yes. The Telegram flow collects agent identity, listing photos, and property details, then sends structured imports for admin review."],
  ["Are auction bids automatic purchases?", "No. A winning bid means the buyer submitted the highest offer. Final purchase is still subject to owner approval, booking fee, loan eligibility, agreement terms, and legal documentation."],
  ["Is the platform ready for paid plans?", "The Stripe workflow is built for subscriptions. During launch, agent features can be opened for free while the team validates workflows."]
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 }
};

type PublicProperty = {
  id: number | string;
  title: string;
  area?: string;
  location?: string;
  price?: number;
  image?: string;
  bedrooms?: number;
  bathrooms?: number;
  panoramas?: unknown[];
};

function formatPrice(value?: number) {
  const amount = Number(value || 0);
  return amount ? `RM ${Math.round(amount).toLocaleString("en-MY")}` : "Price on request";
}

type MilestoneGmv = { total: number; target: number; progressPct: number };

function FirstMillionChallenge() {
  const [gmv, setGmv] = useState<MilestoneGmv>({ total: 0, target: 1000000, progressPct: 0 });

  useEffect(() => {
    const base =
      (typeof window !== "undefined" && (window as { REALTYGENIUS_CONFIG?: { API_BASE?: string } }).REALTYGENIUS_CONFIG?.API_BASE) ||
      "https://hh-empire.onrender.com/api";
    fetch(`${base}/public/milestone-gmv`, { headers: { Accept: "application/json" } })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((payload) => setGmv({
        total: Number(payload.total || 0),
        target: Number(payload.target || 1000000),
        progressPct: Math.min(100, Number(payload.progressPct || 0))
      }))
      .catch(() => {});
  }, []);

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl rounded-[2.4rem] border border-emerald-200 bg-emerald-50 p-8 shadow-xl shadow-emerald-950/[0.04] md:p-12">
        <div className="grid gap-8 md:grid-cols-[1.1fr_.9fr] md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">First RM1M Challenge</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-slate-900 md:text-4xl">
              Help us hit RM1,000,000 in verified homes.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Every live, admin-approved listing counts toward our first million in verified property value. List your property today and put your agency&apos;s name on the board.
            </p>
            <a
              href="/agent.html"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-black text-white shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-800"
            >
              List your property <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="rounded-[1.8rem] border border-emerald-200 bg-white p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Verified listing value</span>
              <strong className="text-lg font-black text-emerald-700">{gmv.progressPct}%</strong>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 transition-all duration-500"
                style={{ width: `${gmv.progressPct}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-sm text-slate-500">
              <span>RM{Math.round(gmv.total).toLocaleString("en-MY")}</span>
              <span>of RM1,000,000 target</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedListings() {
  const [listings, setListings] = useState<PublicProperty[]>([]);

  useEffect(() => {
    const base =
      (typeof window !== "undefined" && (window as { REALTYGENIUS_CONFIG?: { API_BASE?: string } }).REALTYGENIUS_CONFIG?.API_BASE) ||
      "https://hh-empire.onrender.com/api";
    fetch(`${base}/properties`, { headers: { Accept: "application/json" } })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((payload) => {
        const items: PublicProperty[] = Array.isArray(payload) ? payload : payload.items || [];
        setListings(items.filter((item) => item?.title && Number(item.price || 0) > 0).slice(0, 6));
      })
      .catch(() => setListings([]));
  }, []);

  if (!listings.length) return null;

  return (
    <section className="px-4 pb-6 pt-2">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">Live on RealityGenius</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">Fresh homes across Malaysia</h2>
          </div>
          <a href="/user.html" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-black text-white shadow-xl shadow-slate-950/15">
            Browse all listings
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing, index) => (
            <motion.a
              key={listing.id}
              href={`/property/${listing.id}`}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="group overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/[0.05] transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative h-52 overflow-hidden bg-slate-100">
                {listing.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={listing.image} alt={listing.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                ) : null}
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-emerald-900 backdrop-blur">
                  {listing.area || "Malaysia"}
                </span>
                {(listing.panoramas || []).length ? (
                  <span className="absolute bottom-4 left-4 rounded-full bg-emerald-700/90 px-3 py-1.5 text-xs font-black text-emerald-50 backdrop-blur">360&deg; Tour</span>
                ) : null}
              </div>
              <div className="p-5">
                <strong className="text-xl font-black tracking-[-0.03em] text-emerald-800">{formatPrice(listing.price)}</strong>
                <h3 className="mt-2 line-clamp-1 text-lg font-black text-slate-900">{listing.title}</h3>
                <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-500">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span className="line-clamp-1">{listing.location || listing.area || "Malaysia"}</span>
                </p>
                <p className="mt-3 text-sm font-bold text-slate-600">
                  {Number(listing.bedrooms || 0)} bed · {Number(listing.bathrooms || 0)} bath
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body,
  light = false
}: {
  eyebrow: string;
  title: string;
  body: string;
  light?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="mx-auto mb-12 max-w-3xl text-center"
    >
      <p className={`text-xs font-black uppercase tracking-[0.28em] ${light ? "text-cyan-200" : "text-emerald-700"}`}>{eyebrow}</p>
      <h2 className={`mt-4 text-4xl font-black tracking-[-0.04em] md:text-6xl ${light ? "text-white" : "text-slate-950"}`}>{title}</h2>
      <p className={`mt-5 text-base leading-8 md:text-lg ${light ? "text-slate-300" : "text-slate-600"}`}>{body}</p>
    </motion.div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <nav className="sticky top-0 z-50 border-b border-white/60 bg-white/82 px-4 py-3 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3" aria-label="RealityGenius home">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-xl shadow-slate-950/10">RG</span>
            <span className="text-lg font-black tracking-[-0.03em]">RealityGenius</span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-bold text-slate-600 lg:flex">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="transition hover:text-slate-950">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <a href="/login.html" className="inline-flex items-center rounded-full px-3 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100 sm:px-4">
              Login
            </a>
            <a href="#contact" className="inline-flex min-h-11 items-center rounded-full bg-slate-950 px-5 text-sm font-black text-white shadow-xl shadow-slate-950/15">
              Book Demo
            </a>
          </div>
        </div>
      </nav>

      <section id="platform" className="relative overflow-hidden bg-slate-950 px-4 py-14 text-white sm:py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,.22),transparent_30%),radial-gradient(circle_at_84%_14%,rgba(59,130,246,.2),transparent_30%),linear-gradient(135deg,#020617,#0f172a_52%,#052e2b)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f6f8fb] to-transparent" />
        <div className="hero-grid absolute inset-0 opacity-35" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_.82fr]">
          <motion.div initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-emerald-100 shadow-sm backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              Malaysia&apos;s next AI property ecosystem
            </div>
            <h1 className="mt-6 max-w-5xl text-[2.68rem] font-black leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl md:mt-7 md:text-7xl md:leading-[0.95] md:tracking-[-0.065em] lg:text-8xl">
              Find your next home in Malaysia
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-9 text-slate-300 md:text-xl">
              Verified sale, rent, new project, and auction listings with AI match scoring, 360&deg; immersive tours, and direct agent contact — Malaysia&apos;s AI property portal.
            </p>
            <div className="mt-7 max-w-2xl rounded-[1.5rem] border border-white/12 bg-white/10 p-3 shadow-2xl shadow-emerald-950/25 backdrop-blur-xl">
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl bg-white px-4 text-slate-950">
                  <Search className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-black">Find condos under RM700k in KL</span>
                </label>
                <a href="/user.html" className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-emerald-400 px-5 text-sm font-black text-emerald-950">
                  AI Search
                </a>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2" aria-label="Popular areas">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Popular:</span>
              {popularAreas.map((areaName) => (
                <a
                  key={areaName}
                  href={`/user.html#explore`}
                  className="rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-sm font-bold text-slate-200 backdrop-blur-xl transition hover:border-emerald-300/50 hover:text-white"
                >
                  {areaName}
                </a>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="/user.html" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-emerald-400 px-7 font-black text-emerald-950 shadow-2xl shadow-emerald-700/20">
                Start Searching
                <ArrowRight className="h-5 w-5" />
              </a>
              <a href="/agents.html" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/15 bg-white/10 px-7 font-black text-white shadow-xl shadow-slate-950/5 backdrop-blur-xl">
                I&apos;m an Agent
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="hero-visual relative min-h-[420px] overflow-hidden rounded-[2.2rem] border border-white/15 bg-white/[0.04] text-white shadow-2xl shadow-slate-950/40 sm:min-h-[560px]"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/25 blur-3xl" />
            <div className="absolute -bottom-10 left-8 h-32 w-64 rounded-full bg-emerald-400/15 blur-3xl" />

            <div className="absolute inset-0">
              <HeroSkyline />
            </div>

            <div className="pointer-events-none absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/60 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-amber-100 backdrop-blur-xl">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Live property skyline
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 rounded-[1.6rem] border border-white/12 bg-slate-950/64 p-5 backdrop-blur-2xl sm:left-6 sm:right-auto sm:w-[380px]"
            >
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-slate-300">
                  <MapPin className="h-4 w-4 text-emerald-300" /> Mont Kiara, Kuala Lumpur
                </p>
                <h3 className="mt-2 text-xl font-black sm:text-2xl">AI-matched luxury residence</h3>
                <p className="mt-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-amber-200">
                  <Layers3 className="h-4 w-4" /> 360&deg; Immersive View ready
                </p>
              </div>
              <span className="rounded-full bg-emerald-400 px-3 py-2 text-xs font-black text-emerald-950">94% Match</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute right-5 top-16 hidden w-52 rounded-[1.4rem] border border-white/14 bg-slate-950/70 p-4 backdrop-blur-2xl md:block"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-400 text-emerald-950"><MousePointer2 className="h-5 w-5" /></span>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">AgentOS live</p>
                  <p className="mt-0.5 text-sm font-black">Lead matched</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-white/10"><div className="h-1.5 w-[78%] rounded-full bg-emerald-400" /></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <FeaturedListings />

      <section id="products" className="bg-white px-4 py-20">
        <SectionIntro eyebrow="Why RealityGenius" title="The market does not need another listing directory." body="It needs a clean operating layer where property supply is structured, verified, marketed, matched, and moved faster." />
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {problems.map((problem, index) => (
            <motion.article key={problem.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-7">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-lg font-black text-red-600">0{index + 1}</span>
              <h3 className="mt-6 text-2xl font-black tracking-[-0.03em]">{problem.title}</h3>
              <p className="mt-4 leading-7 text-slate-600">{problem.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-4 py-20">
        <SectionIntro eyebrow="Products" title="One platform for buyers, agents, admins, and imports." body="Each product is practical enough for daily work, but connected enough to become a defensible property ecosystem." />
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map(({ title, body, icon: Icon }, index) => (
            <motion.article key={title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: index * 0.04 }} className="group rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-950/[0.035] transition hover:-translate-y-1 hover:shadow-2xl">
              <div className="grid h-13 w-13 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-7 text-2xl font-black tracking-[-0.035em]">{title}</h3>
              <p className="mt-4 leading-7 text-slate-600">{body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <FirstMillionChallenge />

      <section id="about" className="bg-slate-950 px-4 py-24 text-white">
        <SectionIntro light eyebrow="How it works" title="From messy listing to smarter discovery." body="RealityGenius turns unstructured property submissions into buyer-ready, admin-approved, AI-enhanced discovery." />
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {workflow.map(({ title, body, icon: Icon }, index) => (
            <motion.article key={title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative rounded-[2rem] border border-white/10 bg-white/[0.06] p-7">
              <span className="absolute right-6 top-6 text-5xl font-black text-white/10">0{index + 1}</span>
              <Icon className="h-9 w-9 text-cyan-200" />
              <h3 className="mt-8 text-2xl font-black">{title}</h3>
              <p className="mt-4 leading-7 text-slate-300">{body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <StreetRide />

      <section className="px-4 py-20">
        <SectionIntro eyebrow="FAQ" title="Common questions from agents and investors." body="Clear answers make the platform easier to trust, explain, and sell." />
        <div className="mx-auto grid max-w-4xl gap-4">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-950/[0.03]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black">
                {question}
                <ChevronDown className="h-5 w-5 transition group-open:rotate-180" />
              </summary>
              <p className="mt-4 leading-8 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="contact" className="px-4 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.4rem] bg-[linear-gradient(135deg,#064e3b,#0f172a)] p-6 text-white shadow-2xl shadow-emerald-950/20 lg:grid-cols-[.9fr_1.1fr] lg:p-10">
          <div className="self-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-200">Book Demo</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] md:text-6xl">Show RealityGenius to your next agent, investor, or partner.</h2>
            <p className="mt-5 text-lg leading-8 text-emerald-50/78">Use the form to plan a platform demo for buyers, agents, admin QC, Telegram import, and SaaS pricing.</p>
            <div className="mt-8 grid gap-3 text-sm font-bold text-emerald-50/82">
              <span className="flex items-center gap-3"><LockKeyhole className="h-5 w-5" /> Internal admin and master roles remain protected.</span>
              <span className="flex items-center gap-3"><Zap className="h-5 w-5" /> Fast demo-ready flow for Malaysian property teams.</span>
            </div>
          </div>
          <form className="grid gap-4 rounded-[2rem] bg-white p-5 text-slate-950 md:p-7">
            <label className="grid gap-2 text-sm font-black">
              Name
              <input className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-emerald-500" placeholder="Your name" />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Email
              <input type="email" className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-emerald-500" placeholder="you@example.com" />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Company / Agency
              <input className="min-h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-emerald-500" placeholder="Agency or company name" />
            </label>
            <label className="grid gap-2 text-sm font-black">
              What do you want to see?
              <textarea className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Buyer search, AgentOS, Telegram import, admin QC, pricing..." />
            </label>
            <button type="button" className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-slate-950 px-6 font-black text-white">
              Book Demo
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-xs font-black text-white">RG</span>
              <strong className="text-lg font-black">RealityGenius</strong>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">AI-powered property operating platform for Malaysian buyers, agents, admins, and property ecosystem partners.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-600">
            <a href="/privacy.html">Privacy</a>
            <a href="/terms.html">Terms</a>
            <a href="/login.html">Login</a>
            <a href="/agents.html">Agent Workspace</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

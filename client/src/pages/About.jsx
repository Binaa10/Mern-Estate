import React from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiCompass,
  FiHome,
  FiMapPin,
  FiShield,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

export default function About() {
  const stats = [
    {
      icon: FiHome,
      value: "2.4K+",
      label: "Homes, offices, and retail spaces successfully matched",
    },
    {
      icon: FiUsers,
      value: "94%",
      label: "Clients who return or refer friends and partners",
    },
    {
      icon: FiMapPin,
      value: "8 cities",
      label: "Expanding footprint across Ethiopia and the Horn of Africa",
    },
    {
      icon: FiTrendingUp,
      value: "$180M",
      label: "Value of assets guided with data-backed negotiations",
    },
  ];

  const values = [
    {
      icon: FiShield,
      title: "Fiduciary trust",
      description:
        "We sit on the same side of the table as our clients, protecting their capital and ambition with transparent advice.",
    },
    {
      icon: FiCompass,
      title: "Tailored guidance",
      description:
        "Boutique attention meets enterprise-grade process. Every mandate is custom-built around your timeline, risk profile, and target outcomes.",
    },
    {
      icon: FiTrendingUp,
      title: "Data-led execution",
      description:
        "Market intelligence, valuation science, and human intuition work together to unlock value in every deal.",
    },
  ];

  const steps = [
    {
      title: "Discovery & strategy",
      description:
        "Deep listening sessions surface what success looks like for you. We define the mandate, metrics, and go-to-market timing together.",
    },
    {
      title: "Precision positioning",
      description:
        "We package your property or search criteria with cinematic storytelling, rigorous valuation models, and geo-specific insights.",
    },
    {
      title: "Negotiation & execution",
      description:
        "Seasoned brokers lead your negotiation room, orchestrating legal, financial, and technical partners for a confident close.",
    },
    {
      title: "Post-close stewardship",
      description:
        "We stay close after signatures, helping you onboard tenants, launch fit-outs, or reinvest capital into the next opportunity.",
    },
  ];

  return (
    <main className="bg-white text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-white">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-4 h-64 w-64 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-14 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600 shadow-sm shadow-emerald-100">
                Our Story
              </span>
              <h1 className="text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                We broker real estate journeys that build resilience for people
                and cities.
              </h1>
              <p className="text-lg leading-relaxed text-slate-600">
                Binios Estate blends boutique advisory with institutional
                discipline. From first-home dreams to complex portfolio
                strategies, we translate ambition into assets through research,
                relationships, and relentless execution.
              </p>
              <ul className="space-y-3 text-sm text-slate-600">
                {[
                  "Full-service representation from positioning to closing and beyond.",
                  "Dedicated specialists for residential, commercial, and investment mandates.",
                  "Technical partners for valuation, architecture, and legal diligence.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <FiCheckCircle className="h-4 w-4" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-300/40 transition hover:bg-emerald-400"
                >
                  Explore Listings
                  <FiArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/sign-up"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-400 hover:text-emerald-500"
                >
                  Partner With Us
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-2xl shadow-emerald-100 backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-500">
                  Leadership note
                </p>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  "Real estate is more than inventory and transactions. It is
                  community infrastructure. We are accountable for the value,
                  transparency, and trust we create with every client."
                </p>
                <p className="mt-6 text-sm font-semibold text-slate-700">
                  Biniyam Biyadge
                  <span className="block text-xs font-normal uppercase tracking-[0.3em] text-slate-400">
                    Founder & Chief Broker
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 shadow-md shadow-emerald-100 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-500 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-3xl font-semibold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-500">
              What drives us
            </span>
            <h2 className="mt-6 text-3xl font-semibold text-slate-900 sm:text-4xl">
              Boutique attention scaled by trusted partners and modern tech.
            </h2>
            <p className="mt-4 text-base text-slate-600">
              We believe smart data, deep local expertise, and principled
              negotiation are the pillars of enduring real estate value.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <div
                  key={value.title}
                  className="flex h-full flex-col gap-4 rounded-2xl border border-emerald-100 bg-white p-8 shadow-lg shadow-emerald-100"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {value.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {value.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-100 bg-emerald-50/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-5">
              <span className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-500 shadow-sm">
                Our approach
              </span>
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                Built for clarity, speed, and confident decisions.
              </h2>
              <p className="text-base text-slate-600">
                A proven engagement model keeps stakeholders aligned—whether
                you're buying your first investment property or restructuring a
                legacy portfolio.
              </p>
            </div>
            <div className="relative border-l border-emerald-200 pl-10">
              {steps.map((step, index) => (
                <div key={step.title} className="relative pb-10 last:pb-0">
                  <span className="absolute -left-12 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-white text-sm font-semibold text-emerald-500 shadow-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-12 text-center shadow-xl shadow-emerald-100">
            <blockquote className="text-xl font-semibold text-slate-900 sm:text-2xl">
              "The Binios Estate team brought market data, empathy, and urgency
              to every meeting. We secured the right property, at the right
              time, with a partner who still checks in a year later."
            </blockquote>
            <p className="mt-4 text-sm font-semibold text-emerald-600">
              Selamawit D., Commercial Investor
            </p>
            <p className="mt-8 text-base text-slate-600">
              Your vision deserves the same level of stewardship. Let's design a
              roadmap that honors your goals.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/create-listing"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-300/40 transition hover:bg-emerald-400"
              >
                List a Property With Us
                <FiArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-400 hover:text-emerald-500"
              >
                Browse Opportunities
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

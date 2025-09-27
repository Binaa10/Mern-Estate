import React from "react";

const policySections = [
  {
    title: "1. Information We Collect",
    items: [
      "Account details such as your name, email address, phone number, and password when you register or sign in.",
      "Listing data including property descriptions, photos, pricing, and availability when you publish or manage a listing.",
      "Usage analytics that help us improve performance—pages viewed, searches performed, device information, and interaction patterns.",
      "Communication history, including inquiries, support tickets, and transaction records shared with our team or trusted partners.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    items: [
      "Facilitate property discovery, marketing, and management across residential and commercial mandates.",
      "Personalize recommendations, alerts, and market intelligence tailored to your goals and location.",
      "Authenticate your identity, maintain platform security, and prevent fraud or misuse.",
      "Provide customer support, respond to requests, and notify you about product updates or policy changes.",
    ],
  },
  {
    title: "3. When We Share Data",
    items: [
      "With vetted service providers who support payment processing, cloud hosting, analytics, or communication workflows.",
      "With real estate professionals, legal advisors, or investors when you authorize collaboration on a transaction.",
      "To comply with legal obligations, enforce our Terms of Service, or protect the rights, property, and safety of users.",
      "During a business restructuring (merger, acquisition, asset sale) where data transfer is part of due diligence.",
    ],
  },
  {
    title: "4. Your Privacy Controls",
    items: [
      "Update, correct, or delete your account information directly within your profile settings.",
      "Opt out of non-essential marketing communications by adjusting your email preferences or using the unsubscribe link.",
      "Request access to the personal data we maintain or ask for export using the contact details below.",
      "Disable cookies in your browser; note that essential cookies keep the platform secure and fully functional.",
    ],
  },
  {
    title: "5. Data Security & Retention",
    items: [
      "We adopt encryption, access controls, and regular security reviews to safeguard personal data.",
      "Information is retained for as long as needed to fulfill the purpose it was collected for, or as required by law.",
      "If an incident occurs, we will notify affected users and regulators in line with applicable regulations.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden border-b border-emerald-100 bg-gradient-to-br from-white via-emerald-50/50 to-white">
        <div className="pointer-events-none absolute -left-32 top-16 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 bottom-10 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="space-y-6 text-center md:text-left">
            <span className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600 shadow-sm shadow-emerald-100">
              Privacy Policy
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Stewarding your information with transparency and care.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600">
              At Binios Estate, trust is foundational. This policy outlines how
              we collect, use, and protect your data when you explore listings,
              manage portfolios, or collaborate with our advisors. We update
              this policy regularly to align with evolving regulations and best
              practices.
            </p>
            <p className="text-sm text-emerald-600">
              Effective date: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-12 px-4 py-16 sm:px-6 lg:px-8">
        {policySections.map((section) => (
          <article
            key={section.title}
            className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg shadow-emerald-100/50"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              {section.title}
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
              {section.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}

        <article className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg shadow-emerald-100/40">
          <h2 className="text-xl font-semibold text-slate-900">
            6. International Transfers
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            We operate primarily within Ethiopia but may process data using
            cloud infrastructure located in other jurisdictions. When data
            leaves its country of origin, we implement contractual safeguards
            and industry- standard protections to keep it compliant with
            applicable privacy legislation.
          </p>
        </article>

        <article className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg shadow-emerald-100/40">
          <h2 className="text-xl font-semibold text-slate-900">
            7. Contact Us
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Questions or requests about this policy can be directed to our
            privacy team:
          </p>
          <ul className="mt-4 space-y-1 text-sm text-slate-600">
            <li>
              Email:{" "}
              <span className="font-medium text-emerald-600">
                privacy@biniosestate.com
              </span>
            </li>
            <li>
              Phone:{" "}
              <span className="font-medium text-emerald-600">
                +251 993 592 990
              </span>
            </li>
            <li>
              Address:{" "}
              <span className="font-medium text-emerald-600">
                Binios Estate HQ, Addis Ababa, Ethiopia
              </span>
            </li>
          </ul>
        </article>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-8 text-center shadow-lg shadow-emerald-100">
          <h2 className="text-2xl font-semibold text-slate-900">
            Need a tailored data agreement?
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Enterprise and institutional partners can request custom privacy
            addenda to align with procurement and compliance requirements.
          </p>
          <a
            href="mailto:privacy@biniosestate.com"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-300/40 transition hover:bg-emerald-400"
          >
            Start the conversation
          </a>
        </div>
      </section>
    </main>
  );
}

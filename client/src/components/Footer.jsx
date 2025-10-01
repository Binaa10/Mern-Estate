import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { MdLocationOn } from "react-icons/md";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiCheck,
  FiClock,
  FiMail,
  FiPhone,
  FiShield,
  FiTrendingUp,
} from "react-icons/fi";
import { FaFacebook, FaTwitter, FaLinkedinIn, FaGithub } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { currentUser } = useSelector((state) => state.user);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "Explore Listings", to: "/search" },
    { label: "About Us", to: "/about" },
    { label: "Privacy Policy", to: "/privacy-policy" },
  ];

  if (!currentUser) {
    quickLinks.push({ label: "Sign In", to: "/sign-in" });
  } else if (currentUser.isAdmin) {
    quickLinks.push({ label: "Admin Console", to: "/admin" });
  }

  const contactDetails = [
    { icon: FiPhone, label: "+251 993 592 990", href: "tel:+251993592990" },
    {
      icon: FiMail,
      label: "biniyambiyadge@gmail.com",
      href: "mailto:biniyambiyadge@gmail.com",
    },
    { icon: MdLocationOn, label: "Addis Ababa, Ethiopia" },
    { icon: FiClock, label: "Mon - Sat: 8:00 AM – 7:00 PM" },
  ];

  const socialLinks = [
    { href: "#", label: "Facebook", icon: FaFacebook },
    { href: "https://x.com/abuabu5929", label: "Twitter", icon: FaTwitter },
    {
      href: "https://www.linkedin.com/in/biniyam-biyadge/",
      label: "LinkedIn",
      icon: FaLinkedinIn,
    },
    {
      href: "https://github.com/Binaa10",
      label: "GitHub",
      icon: FaGithub,
    },
  ];

  const handleSubscribe = (event) => {
    event.preventDefault();
    const trimmedEmail = newsletterEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    toast.success("You're on the list! Expect tailored market updates soon.");
    setNewsletterEmail("");
  };

  return (
    <footer className="relative mt-16 w-full bg-[#16212d] text-slate-200">
      <span
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500"
        aria-hidden="true"
      />
      <div className="mx-auto w-full max-w-7xl px-3 py-12 sm:px-4 md:py-16">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="space-y-5 lg:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2 sm:gap-3">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-300 via-emerald-500 to-emerald-600 text-base font-bold text-slate-900 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/40">
                BE
              </div>
              <div>
                <p className="text-lg sm:text-xl font-semibold text-slate-100">
                  Binios Estate
                </p>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.32em] text-slate-400">
                  Real Estate Excellence
                </p>
              </div>
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-400">
              We combine deep market intelligence with concierge-level service
              to match investors, homeowners, and tenants with properties that
              unlock long-term value.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300/90">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-600/50 px-2 py-1 sm:px-3">
                <FiCheck className="h-4 w-4 text-green-300" /> Licensed &
                Insured
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-600/50 px-2 py-1 sm:px-3">
                <FiTrendingUp className="h-4 w-4 text-green-300" /> Market
                Analytics
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl text-slate-300">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="transition hover:text-green-300"
                    target={
                      social.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      social.href.startsWith("http") ? "noreferrer" : undefined
                    }
                  >
                    <IconComponent />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 lg:col-span-7 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="text-[11px] sm:text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">
                Quick Links
              </h3>
              <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm">
                {quickLinks.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="group inline-flex items-center gap-2 text-slate-300 transition hover:text-white"
                    >
                      <FiArrowRight className="h-4 w-4 text-green-300 opacity-0 transition group-hover:opacity-100" />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] sm:text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">
                Contact
              </h3>
              <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-300">
                {contactDetails.map((detail) => {
                  const IconComponent = detail.icon;
                  return (
                    <li
                      key={detail.label}
                      className="flex items-start gap-2 sm:gap-3"
                    >
                      <span className="mt-0.5 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-[#203042] text-green-300">
                        <IconComponent className="h-4 w-4" />
                      </span>
                      {detail.href ? (
                        <a
                          href={detail.href}
                          className="pt-0.5 sm:pt-1 text-slate-300 transition hover:text-white"
                        >
                          {detail.label}
                        </a>
                      ) : (
                        <span className="pt-0.5 sm:pt-1 text-slate-300">
                          {detail.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-[11px] sm:text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">
                Newsletter
              </h3>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-400">
                Get curated property opportunities, trend reports, and tactical
                advice delivered weekly.
              </p>
              <form
                onSubmit={handleSubscribe}
                className="mt-3 sm:mt-4 space-y-2 sm:space-y-3"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-600/60 bg-[#203042] px-2 py-1 sm:px-3 sm:py-1.5 focus-within:border-green-300">
                  <FiMail className="h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="newsletter-email"
                    value={newsletterEmail}
                    onChange={(event) => setNewsletterEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                    aria-label="Email address"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-green-300 via-emerald-500 to-emerald-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/25 transition hover:from-green-200 hover:via-emerald-400 hover:to-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#16212d]"
                >
                  Subscribe
                  <FiArrowUpRight className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-slate-500">
                We respect your inbox. Unsubscribe anytime with a single click.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-800 pt-5 text-xs sm:text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} Binios Estate. Crafted thoughtfully in Ethiopia.
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="inline-flex items-center gap-2">
              <FiShield className="h-4 w-4 text-green-300" /> Secure
              Transactions
            </span>
            <span className="inline-flex items-center gap-2">
              <FiCheck className="h-4 w-4 text-green-300" /> Responsible
              Investing
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

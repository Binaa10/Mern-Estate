import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/bundle";
import { Navigation } from "swiper/modules";
import SwiperCore from "swiper";
import ListingItem from "../components/ListingItem";
import {
  FiHome,
  FiSearch,
  FiMapPin,
  FiTrendingUp,
  FiKey,
  FiPhoneCall,
} from "react-icons/fi";

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [listingStats, setListingStats] = useState({
    totalActive: null,
    saleCount: null,
    rentCount: null,
    offerCount: null,
  });
  const currentUser = useSelector((state) => state.user.currentUser);
  SwiperCore.use([Navigation]);

  useEffect(() => {
    const fetchListingStats = async () => {
      try {
        const res = await fetch("/api/listing/stats");
        if (!res.ok) throw new Error("Failed to load stats");
        const data = await res.json();
        setListingStats({
          totalActive:
            typeof data.totalActive === "number" ? data.totalActive : null,
          saleCount: typeof data.saleCount === "number" ? data.saleCount : null,
          rentCount: typeof data.rentCount === "number" ? data.rentCount : null,
          offerCount:
            typeof data.offerCount === "number" ? data.offerCount : null,
        });
      } catch (error) {
        console.log(error);
      }
    };

    const fetchOfferListings = async () => {
      try {
        const res = await fetch("/api/listing/get?offer=true&limit=4");
        if (!res.ok) throw new Error("Failed to load offers");
        const data = await res.json();
        setOfferListings(data.listings || []);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchRentListings = async () => {
      try {
        const res = await fetch("/api/listing/get?type=rent&limit=4");
        if (!res.ok) throw new Error("Failed to load rentals");
        const data = await res.json();
        setRentListings(data.listings || []);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSaleListings = async () => {
      try {
        const res = await fetch("/api/listing/get?type=sale&limit=4");
        if (!res.ok) throw new Error("Failed to load sales");
        const data = await res.json();
        setSaleListings(data.listings || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOfferListings();
    fetchListingStats();
  }, []);

  const formatStatValue = (value) => {
    if (value === null || value === undefined) return "—";
    return value.toLocaleString("en-US");
  };

  const heroStats = [
    {
      label: "Listings live",
      value: formatStatValue(listingStats.totalActive),
    },
    { label: "Homes for sale", value: formatStatValue(listingStats.saleCount) },
    {
      label: "Places for rent",
      value: formatStatValue(listingStats.rentCount),
    },
  ];

  const journeyCards = [
    {
      title: "Buy with confidence",
      description:
        "Browse curated homes, see real-time trends, and secure financing support.",
      icon: FiHome,
      link: "/search?type=sale",
      linkLabel: "Shop homes",
    },
    {
      title: "Rent without stress",
      description:
        "Compare rentals, schedule tours online, and manage paperwork digitally.",
      icon: FiMapPin,
      link: "/search?type=rent",
      linkLabel: "Explore rentals",
    },
    {
      title: "Sell smarter",
      description:
        "Tap into pricing intelligence and expert agents to list in record time.",
      icon: FiTrendingUp,
      link: "/search?offer=true",
      linkLabel: "View offers",
    },
  ];

  const experienceHighlights = [
    {
      title: "Personalised search",
      description:
        "Save your favourite listings, add notes, and get instant alerts when something changes.",
      icon: FiSearch,
    },
    {
      title: "Negotiation support",
      description:
        "Our specialists help you compare offers, negotiate terms, and sign with clarity.",
      icon: FiKey,
    },
    {
      title: "Human guidance",
      description:
        "Need advice? Schedule a call with a local expert who understands your goals.",
      icon: FiPhoneCall,
    },
  ];

  const resolveListingPrice = (listing) => {
    if (!listing) return null;
    if (typeof listing.discountPrice === "number") {
      return listing.discountPrice;
    }
    if (typeof listing.regularPrice === "number") {
      return listing.regularPrice;
    }
    return null;
  };

  const heroShowcase =
    offerListings[0] ?? rentListings[0] ?? saleListings[0] ?? null;

  const heroShowcasePrice = resolveListingPrice(heroShowcase);

  const listingSections = [
    {
      title: "Recent offers",
      listings: offerListings,
      link: "/search?offer=true",
      linkLabel: "Show more offers",
    },
    {
      title: "Recent places for rent",
      listings: rentListings,
      link: "/search?type=rent",
      linkLabel: "Show more places for rent",
    },
    {
      title: "Recent places for sale",
      listings: saleListings,
      link: "/search?type=sale",
      linkLabel: "Show more places for sale",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Tell us your goals",
      description:
        "Share your timeline, budget, and must-haves. We tailor property matches and a clear action plan for you.",
    },
    {
      step: "02",
      title: "Tour on your terms",
      description:
        "Join guided virtual walkthroughs or schedule in-person visits with local experts who know every neighbourhood.",
    },
    {
      step: "03",
      title: "Close with confidence",
      description:
        "We coordinate negotiations, paperwork, and post-close support so your move-in day is effortless.",
    },
  ];

  const isAuthenticated = Boolean(currentUser);
  const isAdmin = Boolean(currentUser?.isAdmin);
  const primaryCta = isAuthenticated
    ? isAdmin
      ? { label: "View admin profile", link: "/admin/profile" }
      : { label: "View your profile", link: "/account/profile" }
    : { label: "Create your account", link: "/sign-up" };
  const secondaryCta = isAuthenticated
    ? isAdmin
      ? { label: "Open admin dashboard", link: "/admin" }
      : { label: "List a property", link: "/create-listing" }
    : { label: "Browse listings", link: "/search" };

  return (
    <main className="bg-white text-slate-900">
      <section className="relative overflow-hidden border-b border-emerald-100/60 bg-gradient-to-br from-white via-emerald-50/30 to-white">
        <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 bottom-12 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
            <div className="space-y-10 lg:-mt-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
                Modern real estate, human service
              </span>
              <div className="space-y-6">
                <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Find your next{" "}
                  <span className="text-emerald-600">perfect</span> place with
                  confidence.
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  Binio's Estate blends local expertise with digital efficiency
                  so you can discover, tour, and secure properties in record
                  time.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-400"
                >
                  Browse listings
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center rounded-full border border-emerald-200 px-6 py-3 text-sm font-semibold text-emerald-600 transition hover:border-emerald-400 hover:text-emerald-500"
                >
                  Meet our advisors
                </Link>
              </div>

              <div className="mt-10 grid gap-6 border-t border-emerald-100 pt-6 sm:grid-cols-3">
                {heroStats.map(({ label, value }) => (
                  <div key={label} className="space-y-1">
                    <p className="text-3xl font-semibold text-slate-900">
                      {value}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-[2.75rem] bg-slate-900 text-white shadow-[0_25px_60px_-25px_rgba(15,23,42,0.65)]">
                {heroShowcase ? (
                  <>
                    <div
                      className="h-72 w-full sm:h-80"
                      style={{
                        background: `linear-gradient(160deg, rgba(15,23,42,0.7), rgba(15,23,42,0.15)), url(${heroShowcase.imageUrls[0]}) center / cover no-repeat`,
                      }}
                    />
                    <div className="space-y-3 px-8 pb-8">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
                        Featured listing
                      </p>
                      <h3 className="text-2xl font-semibold">
                        {heroShowcase.name}
                      </h3>
                      <p className="text-sm text-slate-200 line-clamp-2">
                        {heroShowcase.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="rounded-full bg-white/10 px-4 py-1 font-medium">
                          {heroShowcasePrice !== null
                            ? `$${heroShowcasePrice.toLocaleString()}`
                            : heroShowcase.regularPrice || "Request pricing"}
                        </span>
                        {heroShowcase.address && (
                          <span className="flex items-center gap-2 text-slate-200/80">
                            <FiMapPin className="h-4 w-4" />
                            {heroShowcase.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6 px-8 py-12">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
                      Featured listing
                    </p>
                    <h3 className="text-2xl font-semibold">
                      Your next address awaits
                    </h3>
                    <p className="text-sm text-slate-200/90">
                      Explore curated homes and rentals tailored to your wish
                      list as new properties launch every day.
                    </p>
                    <Link
                      to="/search"
                      className="inline-flex w-fit items-center justify-center rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                    >
                      Discover listings
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {experienceHighlights.map((highlight) => {
              const IconComponent = highlight.icon;
              return (
                <div
                  key={highlight.title}
                  className="group rounded-3xl border border-emerald-100 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                >
                  <IconComponent className="h-6 w-6 text-emerald-500 transition group-hover:text-emerald-600" />
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    {highlight.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {highlight.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
              Start your journey
            </p>
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Tailored paths whether you're buying, renting, or selling.
            </h2>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
              Choose the experience that fits your next move. Each path unlocks
              curated listings, onboarding checklists, and access to specialised
              advisors.
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex w-fit items-center justify-center rounded-full border border-emerald-200 px-5 py-3 text-sm font-semibold text-emerald-600 transition hover:border-emerald-400 hover:text-emerald-500"
          >
            View all listings
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {journeyCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.title}
                className="group flex h-full flex-col justify-between rounded-3xl border border-emerald-100 bg-white/70 p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
              >
                <div className="space-y-4">
                  <IconComponent className="h-8 w-8 text-emerald-500 transition group-hover:text-emerald-600" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-600">{card.description}</p>
                  </div>
                </div>
                <Link
                  to={card.link}
                  className="mt-6 inline-flex w-fit items-center justify-center rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600 transition hover:border-emerald-400 hover:text-emerald-500"
                >
                  {card.linkLabel}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-b border-emerald-100/70 bg-slate-900 text-white">
        <Swiper
          navigation
          className="h-[360px] w-full sm:h-[420px] lg:h-[520px]"
          style={{
            "--swiper-navigation-color": "#34d399",
            "--swiper-navigation-size": "22px",
          }}
        >
          {offerListings &&
            offerListings.length > 0 &&
            offerListings.map((listing) => {
              const listingPrice = resolveListingPrice(listing);
              return (
                <SwiperSlide key={listing._id}>
                  <div className="relative h-full w-full overflow-hidden">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(115deg, rgba(15,23,42,0.8) 10%, rgba(15,23,42,0.25) 55%, rgba(15,23,42,0.65) 100%), url(${listing.imageUrls[0]}) center / cover no-repeat`,
                      }}
                    />
                    <div className="relative flex h-full flex-col justify-between px-6 py-8 sm:px-10 sm:py-12 lg:px-16 lg:py-16">
                      <div className="max-w-xl space-y-3 sm:space-y-4">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
                          Exclusive offer
                        </span>
                        <h3 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
                          {listing.name}
                        </h3>
                        <p className="text-sm text-white/80 sm:text-base lg:text-lg line-clamp-3">
                          {listing.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white sm:text-base">
                          {listingPrice !== null
                            ? `$${listingPrice.toLocaleString()}`
                            : "Request pricing"}
                          {listing.type === "rent" ? " / month" : ""}
                        </span>
                        {listing.address && (
                          <span className="flex items-center gap-2 text-sm text-white/70 sm:text-base">
                            <FiMapPin className="h-5 w-5" />
                            {listing.address}
                          </span>
                        )}
                        <Link
                          to={`/listing/${listing._id}`}
                          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-400 sm:text-sm"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
        </Swiper>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
        {listingSections.map(
          (section) =>
            section.listings &&
            section.listings.length > 0 && (
              <article
                key={section.title}
                className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-100/60"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {section.title}
                    </h2>
                  </div>
                  <Link
                    to={section.link}
                    className="inline-flex items-center justify-center rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:border-emerald-400 hover:text-emerald-500"
                  >
                    {section.linkLabel}
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {section.listings.map((listing) => (
                    <ListingItem listing={listing} key={listing._id} />
                  ))}
                </div>
              </article>
            )
        )}
      </section>

      <section className="border-t border-emerald-100/40 bg-slate-950 py-20 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center">
          <div className="max-w-xl space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
              How it works
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              A smarter way to move from interest to keys in hand.
            </h2>
            <p className="text-sm text-slate-200/80 sm:text-base">
              Every journey is backed by real-time data, licensed advisors, and
              secure digital workflows. Here's what to expect when you partner
              with Binio's Estate.
            </p>
          </div>

          <div className="grid flex-1 gap-6 sm:grid-cols-3">
            {howItWorks.map((step) => (
              <div
                key={step.step}
                className="group rounded-3xl border border-emerald-500/20 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-emerald-300/60"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
                  Step {step.step}
                </span>
                <p className="mt-4 text-lg font-semibold text-white">
                  {step.title}
                </p>
                <p className="mt-3 text-sm text-slate-200/80">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl rounded-[3rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/40 to-white px-6 py-16 shadow-[0_25px_70px_-40px_rgba(16,185,129,0.5)] sm:px-10">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
              Ready to get started?
            </span>
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Let's map the perfect next step for your property goals.
            </h2>
            <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
              Join thousands of clients who buy, sell, and lease with confidence
              through Binio's Estate. We'll help you make decisions grounded in
              data and genuine market insight.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to={primaryCta.link}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-400"
              >
                {primaryCta.label}
              </Link>
              <Link
                to={secondaryCta.link}
                className="inline-flex items-center justify-center rounded-full border border-emerald-200 px-6 py-3 text-sm font-semibold text-emerald-600 transition hover:border-emerald-400 hover:text-emerald-500"
              >
                {secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

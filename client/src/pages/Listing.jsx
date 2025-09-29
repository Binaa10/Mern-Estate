import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import { useSelector } from "react-redux";
import "swiper/css/bundle";
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from "react-icons/fa";
import Contact from "../components/Contact";

export default function Listing() {
  const { currentUser } = useSelector((state) => state.user);

  SwiperCore.use([Navigation]);
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const params = useParams();
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (err) {
        console.error("Failed to load listing details", err);
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);
  //console.log(loading);
  //console.log(currentUser._id, listing?.userRef);

  const formattedRegularPrice = listing?.regularPrice
    ? Number(listing.regularPrice).toLocaleString("en-US")
    : null;
  const formattedDiscountPrice = listing?.discountPrice
    ? Number(listing.discountPrice).toLocaleString("en-US")
    : null;
  const displayPrice = listing
    ? listing.offer
      ? formattedDiscountPrice
      : formattedRegularPrice
    : null;
  const discountAmount =
    listing && listing.offer
      ? (
          Number(listing.regularPrice) - Number(listing.discountPrice)
        ).toLocaleString("en-US")
      : null;
  const isRental = listing?.type === "rent";
  const neighbourhoodAnchor = listing?.address
    ? listing.address.split(",")[0]
    : "the neighbourhood";
  const formatStatusLabel = (status) =>
    status
      ? status
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "Active";
  const highlightInsights = listing
    ? [
        {
          title: isRental ? "Move-in ready comfort" : "Presentation perfect",
          description: listing.furnished
            ? "Professionally staged and fully furnished so every room feels intentional from day one."
            : "Neutral finishes create a blank canvas ready for your signature style and furnishings.",
        },
        {
          title: listing.parking
            ? "Secure on-site parking"
            : "Easy neighbourhood parking",
          description: listing.parking
            ? "Dedicated parking keeps arrivals effortless for residents and guests alike."
            : "Well-connected transit and nearby public parking make getting around simple without a driveway.",
        },
        listing.offer && discountAmount
          ? {
              title: "Exclusive savings unlocked",
              description: `Claim a limited-time incentive worth $${discountAmount} to maximise your budget.`,
            }
          : null,
        {
          title: "Prime lifestyle location",
          description:
            "Surrounded by everyday conveniences, cafes, and green spaces so you spend less time commuting and more time living.",
        },
      ].filter(Boolean)
    : [];

  const keyFacts = listing
    ? [
        {
          label: "Market availability",
          value: formatStatusLabel(listing.status),
        },
        {
          label: isRental ? "Monthly rate" : "Asking price",
          value: displayPrice ? `$${displayPrice}` : "Upon request",
        },
        listing.offer && formattedRegularPrice
          ? {
              label: "Original price",
              value: `$${formattedRegularPrice}`,
            }
          : null,
        {
          label: "Home type",
          value:
            listing.type === "rent" ? "Residential lease" : "Residential sale",
        },
      ].filter(Boolean)
    : [];

  const nextSteps = [
    {
      title: "Request a tailored tour",
      description:
        "Share your availability and preferred format (virtual or in-person) so our advisor can craft a personalised viewing plan.",
    },
    {
      title: "Review supporting documents",
      description:
        "Ask for floor plans, utility breakdowns, and HOA disclosures to evaluate the property with confidence before you commit.",
    },
    {
      title: "Align on next actions",
      description:
        "From drafting offers to completing tenant applications, our specialists stay beside you every step of the way.",
    },
  ];
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/account/profile");
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 text-slate-900">
      {loading && (
        <p className="py-16 text-center text-2xl font-semibold text-slate-700">
          Loading...
        </p>
      )}
      {error && (
        <p className="py-16 text-center text-2xl font-semibold text-rose-600">
          Something went Wrong!
        </p>
      )}
      {listing && !loading && !error && (
        <div className="pb-20">
          <div className="relative">
            <Swiper
              navigation
              className="h-[520px] w-full"
              style={{
                "--swiper-navigation-color": "#34d399",
                "--swiper-navigation-size": "22px",
              }}
            >
              {listing.imageUrls.map((url) => (
                <SwiperSlide key={url}>
                  <div className="relative h-full w-full overflow-hidden">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(115deg, rgba(15,23,42,0.82) 8%, rgba(15,23,42,0.2) 55%, rgba(15,23,42,0.7) 100%), url(${url}) center / cover no-repeat`,
                      }}
                    />
                    <div className="relative flex h-full flex-col justify-between px-6 py-8 text-white sm:px-10 sm:py-12 lg:px-16 lg:py-16">
                      <div className="max-w-2xl space-y-4 sm:space-y-6">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
                          {listing.offer
                            ? "Exclusive offer"
                            : isRental
                            ? "Featured rental"
                            : "Featured home"}
                        </span>
                        <div className="space-y-3">
                          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                            {listing.name}
                          </h2>
                          <p className="text-sm text-white/85 sm:text-base lg:text-lg line-clamp-3">
                            {listing.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-white/85 sm:text-base">
                        {displayPrice && (
                          <span className="rounded-full bg-white/15 px-5 py-2 font-medium text-white">
                            {`$${displayPrice}`}
                            {isRental ? " / month" : ""}
                          </span>
                        )}
                        {listing.address && (
                          <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white/80">
                            <FaMapMarkerAlt className="h-4 w-4 text-emerald-300" />
                            {listing.address}
                          </span>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-white/70 sm:text-sm">
                          <span className="rounded-full bg-white/10 px-3 py-1">
                            {listing.bedrooms}{" "}
                            {listing.bedrooms > 1 ? "beds" : "bed"}
                          </span>
                          <span className="rounded-full bg-white/10 px-3 py-1">
                            {listing.bathrooms}{" "}
                            {listing.bathrooms > 1 ? "baths" : "bath"}
                          </span>
                          <span className="rounded-full bg-white/10 px-3 py-1">
                            {listing.parking
                              ? "Parking included"
                              : "Street parking"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-50 via-emerald-50/70 to-transparent" />

            <button
              type="button"
              className="absolute right-6 top-6 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/90 shadow-lg shadow-emerald-100/60 transition hover:-translate-y-1 hover:bg-white"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            >
              <FaShare className="text-slate-600" />
            </button>
            {copied && (
              <span className="absolute right-6 top-24 z-30 rounded-full border border-emerald-100 bg-white/90 px-4 py-1 text-xs font-semibold text-emerald-600 shadow">
                Link copied!
              </span>
            )}
          </div>

          <section className="relative z-10 mx-auto mt-12 max-w-6xl px-4 sm:mt-16">
            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoBack}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-600"
              >
                <span aria-hidden="true">←</span>
                <span>Back right</span>
              </button>
            </div>
            <div className="rounded-[32px] border border-emerald-100/80 bg-white p-8 shadow-2xl shadow-emerald-100/60 sm:p-10">
              <div className="grid gap-10 lg:grid-cols-[1.7fr,1fr]">
                <article className="space-y-8">
                  <header className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                        {listing.name}
                      </h1>
                      {displayPrice && (
                        <p className="text-3xl font-semibold text-emerald-600 sm:text-4xl">
                          ${displayPrice}
                          {isRental && (
                            <span className="ml-1 text-base font-medium text-slate-500">
                              / month
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <FaMapMarkerAlt className="text-emerald-500" />
                      {listing.address}
                    </p>
                  </header>

                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-600/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-sm">
                      {isRental ? "For Rent" : "For Sale"}
                    </span>
                    {listing.offer && discountAmount && (
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-600/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-sm">
                        ${discountAmount} discount
                      </span>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-6 shadow-inner shadow-emerald-50">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-700">
                      Description
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      {listing.description}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-700">
                      Property Details
                    </h2>
                    <ul className="mt-4 grid gap-4 text-sm font-semibold text-emerald-700 sm:grid-cols-2">
                      <li className="flex items-center gap-3 rounded-xl border border-emerald-100/80 bg-emerald-50 px-4 py-3 shadow-sm">
                        <FaBed className="text-base" />
                        {listing.bedrooms > 1
                          ? `${listing.bedrooms} beds`
                          : `${listing.bedrooms} bed`}
                      </li>
                      <li className="flex items-center gap-3 rounded-xl border border-emerald-100/80 bg-emerald-50 px-4 py-3 shadow-sm">
                        <FaBath className="text-base" />
                        {listing.bathrooms > 1
                          ? `${listing.bathrooms} baths`
                          : `${listing.bathrooms} bath`}
                      </li>
                      <li className="flex items-center gap-3 rounded-xl border border-emerald-100/80 bg-emerald-50 px-4 py-3 shadow-sm">
                        <FaParking className="text-base" />
                        {listing.parking ? "Parking spot" : "No parking"}
                      </li>
                      <li className="flex items-center gap-3 rounded-xl border border-emerald-100/80 bg-emerald-50 px-4 py-3 shadow-sm">
                        <FaChair className="text-base" />
                        {listing.furnished ? "Furnished" : "Unfurnished"}
                      </li>
                    </ul>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-100/80 bg-white/70 p-6 shadow-lg shadow-emerald-50">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">
                        Why residents love this home
                      </h3>
                      <ul className="mt-4 space-y-4 text-sm text-slate-700">
                        {highlightInsights.map((item) => (
                          <li key={item.title} className="flex gap-3">
                            <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                            <div>
                              <p className="font-semibold text-slate-900">
                                {item.title}
                              </p>
                              <p className="text-slate-600">
                                {item.description}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-lg">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-600">
                        Neighbourhood snapshot
                      </h3>
                      <p className="mt-3 text-sm text-slate-600">
                        Nestled near {neighbourhoodAnchor}, this area mixes
                        residential calm with quick access to dining, fitness,
                        and everyday services. Morning commutes are effortless
                        thanks to direct transit corridors, while weekends
                        invite you to explore boutique shops and nearby parks.
                      </p>
                      <p className="mt-3 text-xs text-slate-500">
                        *Neighbourhood insights are curated by Binio's Estate
                        market research team and updated quarterly.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-6 shadow-inner">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-600">
                      Key facts & next steps
                    </h3>
                    <div className="mt-4 grid gap-6 lg:grid-cols-2">
                      <ul className="space-y-3 text-sm text-slate-700">
                        {keyFacts.map((fact) => (
                          <li
                            key={fact.label}
                            className="flex items-start justify-between gap-4 rounded-xl border border-white/60 bg-white px-4 py-3 shadow"
                          >
                            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                              {fact.label}
                            </span>
                            <span className="font-semibold text-slate-900">
                              {fact.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <ul className="space-y-4 text-sm text-slate-600">
                        {nextSteps.map((item) => (
                          <li
                            key={item.title}
                            className="rounded-xl border border-emerald-100 bg-white/80 px-4 py-3 shadow"
                          >
                            <p className="font-semibold text-slate-900">
                              {item.title}
                            </p>
                            <p className="mt-1 text-slate-600">
                              {item.description}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>

                <aside className="space-y-6">
                  <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-slate-100 shadow-xl shadow-slate-900/30">
                    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300/80">
                      Summary
                    </p>
                    {displayPrice && (
                      <p className="mt-4 text-3xl font-semibold text-white">
                        ${displayPrice}
                        {isRental && (
                          <span className="ml-1 text-base font-medium text-slate-300">
                            / month
                          </span>
                        )}
                      </p>
                    )}
                    <div className="mt-4 space-y-2 text-sm text-slate-200">
                      <p className="flex justify-between">
                        <span>Listing type</span>
                        <span className="font-semibold capitalize">
                          {listing.type}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span>Status</span>
                        <span className="font-semibold">
                          {listing.offer ? "Special offer" : "Standard rate"}
                        </span>
                      </p>
                      {listing.offer && discountAmount && (
                        <p className="flex justify-between">
                          <span>Savings</span>
                          <span className="font-semibold text-emerald-300">
                            ${discountAmount}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-white/90 p-6 shadow-lg shadow-emerald-100">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">
                      Work with a specialist
                    </h3>
                    <p className="mt-3 text-sm text-slate-600">
                      Our licensed advisors prepare data-backed proposals, run
                      rent vs. buy comparisons, and coordinate legal paperwork
                      so you can move forward with certainty.
                    </p>
                    <ul className="mt-4 space-y-3 text-sm text-slate-700">
                      <li className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        Tailored financial scenarios and rate guidance
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        Priority access to upcoming listings in the area
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        Coordination with trusted inspectors and movers
                      </li>
                    </ul>
                  </div>

                  {currentUser &&
                    listing.userRef !== currentUser._id &&
                    !contact && (
                      <button
                        onClick={() => setContact(true)}
                        className="w-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-emerald-500/40 transition hover:from-emerald-400 hover:via-emerald-500 hover:to-emerald-600"
                      >
                        Contact Landlord
                      </button>
                    )}

                  {contact && (
                    <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-lg shadow-emerald-100">
                      <Contact listing={listing} />
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

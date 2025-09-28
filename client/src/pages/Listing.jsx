import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
      } catch (error) {
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
            <Swiper navigation className="h-[460px] w-full">
              {listing.imageUrls.map((url) => (
                <SwiperSlide key={url}>
                  <div
                    className="h-full w-full"
                    style={{
                      background: `linear-gradient(120deg, rgba(15,23,42,0.15), rgba(15,23,42,0.45)), url(${url}) center / cover no-repeat`,
                    }}
                  />
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

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/bundle";
import { Navigation } from "swiper/modules";
import SwiperCore from "swiper";
import ListingItem from "../components/ListingItem";

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  SwiperCore.use([Navigation]);

  useEffect(() => {
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
  }, []);

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

  return (
    <main className="bg-white text-slate-900">
      <section className="relative overflow-hidden border-b border-emerald-100 bg-gradient-to-br from-white via-emerald-50/40 to-white">
        <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 bottom-12 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-24 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Find your next <span className="text-emerald-600">perfect</span>
              <br /> place with ease
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Binios Estate is the best place to find your next perfect place to
              live
              <span className="block">
                we have a wide range of properties for you to choose from.
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/search"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-400"
            >
              Let's get started...
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-emerald-100/70 bg-slate-900 text-white">
        <Swiper
          navigation
          className="h-[360px] w-full sm:h-[420px] lg:h-[520px]"
        >
          {offerListings &&
            offerListings.length > 0 &&
            offerListings.map((listing) => (
              <SwiperSlide key={listing._id}>
                <div className="relative h-full w-full">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(120deg, rgba(15,23,42,0.75), rgba(15,23,42,0.1)), url(${listing.imageUrls[0]}) center / cover no-repeat`,
                    }}
                  />
                </div>
              </SwiperSlide>
            ))}
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
    </main>
  );
}

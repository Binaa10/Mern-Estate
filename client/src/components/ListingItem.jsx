import React from "react";
import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";

const SIZE_PRESETS = {
  standard: {
    card: "w-full",
    image: "h-[220px] sm:h-[200px] lg:h-[220px]",
  },
  compact: {
    card: "w-full",
    image: "h-[200px] sm:h-[190px] lg:h-[200px]",
  },
};

export default function ListingItem({ listing, size = "standard" }) {
  const sizeClasses = SIZE_PRESETS[size] ?? SIZE_PRESETS.standard;

  return (
    <Link
      to={`/listing/${listing._id}`}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${sizeClasses.card}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={
            listing.imageUrls[0] ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLWYSwgEtZO2JY-gue1cAyH3xk-7Gf8DW9fQ&s"
          }
          alt="listing cover"
          className={`w-full object-cover transition duration-300 group-hover:scale-105 ${sizeClasses.image}`}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="truncate text-lg font-semibold text-slate-700">
          {listing.name}
        </p>
        <div className="flex items-center gap-1">
          <MdLocationOn className="h-4 w-4 text-emerald-600" />
          <p className="w-full truncate text-sm text-gray-600">
            {listing.address}
          </p>
        </div>
        <p className="line-clamp-2 text-sm text-gray-600">
          {listing.description}
        </p>
        <p className="mt-2 text-base font-semibold text-emerald-600">
          ${" "}
          {listing.offer
            ? listing.discountPrice.toLocaleString("en-Us")
            : listing.regularPrice.toLocaleString("en-Us")}
          {listing.type === "rent" && " / month"}
        </p>
        <div className="mt-auto flex gap-4 text-xs font-bold text-slate-600">
          <div>
            {listing.bedrooms > 1
              ? `${listing.bedrooms} beds`
              : `${listing.bedrooms} bed`}
          </div>
          <div>
            {listing.bathrooms > 1
              ? `${listing.bathrooms} baths`
              : `${listing.bathrooms} bath`}
          </div>
        </div>
      </div>
    </Link>
  );
}

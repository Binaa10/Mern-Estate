import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "../../components/ui/table";
import { Dialog } from "../../components/ui/dialog";
import { getListingStatusMeta } from "../../utils/listingStatus";
import {
  HiOutlineClipboardList,
  HiOutlinePlusCircle,
  HiOutlineUser,
} from "react-icons/hi";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const summarizeListings = (listings) => {
  if (!Array.isArray(listings)) {
    return {
      total: 0,
      active: 0,
      inactive: 0,
      offers: 0,
      rent: 0,
      sale: 0,
      volume: 0,
      avgPrice: 0,
    };
  }

  const total = listings.length;
  const active = listings.filter((l) => l.isActive !== false).length;
  const offers = listings.filter((l) => l.offer).length;
  const rent = listings.filter((l) => l.type === "rent").length;
  const sale = listings.filter((l) => l.type === "sale").length;
  const volume = listings.reduce(
    (sum, listing) => sum + Number(listing?.regularPrice || 0),
    0
  );
  const avgPrice = total ? Math.round(volume / total) : 0;

  return {
    total,
    active,
    inactive: total - active,
    offers,
    rent,
    sale,
    volume,
    avgPrice,
  };
};

const quickActions = [
  {
    label: "Create a listing",
    to: "/account/create-listing",
    description: "Upload property photos, pricing, and details in minutes.",
    icon: HiOutlinePlusCircle,
  },
  {
    label: "Manage your listings",
    to: "/account/my-listings",
    description: "Review, edit, or archive your active properties.",
    icon: HiOutlineClipboardList,
  },
  {
    label: "Update profile",
    to: "/account/profile",
    description: "Refresh your contact info and account photo.",
    icon: HiOutlineUser,
  },
];

export default function UserDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      if (!currentUser?._id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/user/listings/${currentUser._id}`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        const text = await res.text();
        if (!res.ok) {
          let message;
          try {
            message = text ? JSON.parse(text).message : undefined;
          } catch {
            message = undefined;
          }
          throw new Error(message || "Failed to load your listings");
        }
        if (!text) {
          setListings([]);
          return;
        }
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch {
          throw new Error("Invalid listings response");
        }
        setListings(Array.isArray(parsed) ? parsed : []);
      } catch (err) {
        setError(err.message || "Unable to load listings");
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [currentUser?._id]);

  const summary = useMemo(() => summarizeListings(listings), [listings]);

  const recentListings = useMemo(() => {
    return [...listings]
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 4);
  }, [listings]);

  const summaryMetrics = [
    {
      key: "total",
      label: "Total listings",
      value: summary.total,
      note: "All properties",
      accent: "from-indigo-500/20 to-indigo-100/40 text-indigo-600",
    },
    {
      key: "active",
      label: "Active",
      value: summary.active,
      note: "Live right now",
      accent: "from-emerald-500/20 to-emerald-100/40 text-emerald-600",
    },
    {
      key: "offers",
      label: "Offers",
      value: summary.offers,
      note: "Discounted",
      accent: "from-amber-500/20 to-amber-100/40 text-amber-600",
    },
    {
      key: "avg",
      label: "Avg. price",
      value: summary.avgPrice ? `$${summary.avgPrice.toLocaleString()}` : "—",
      note: "Estimated",
      accent: "from-sky-500/20 to-sky-100/40 text-sky-600",
    },
    {
      key: "volume",
      label: "Portfolio value",
      value: summary.volume ? currencyFormatter.format(summary.volume) : "—",
      note: "Combined",
      accent: "from-rose-500/20 to-rose-100/40 text-rose-600",
    },
  ];

  return (
    <div
      className="mx-auto w-full max-w-6xl px-3 sm:px-4 lg:px-6"
      style={{
        paddingTop: "max(1.5rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-[1px]">
        <div className="absolute inset-0 translate-y-[-60%] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)]" />
        <div className="relative h-full w-full space-y-8 rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-emerald-50 via-white to-slate-100 p-5 sm:space-y-10 sm:p-8 lg:p-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Welcome back, {currentUser?.username?.split(" ")[0] || "there"}
            </h1>
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-slate-400">
              Snapshot of your property activity
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {summaryMetrics.map((metric) => (
              <Card
                key={metric.key}
                className="relative overflow-hidden border-none bg-white/90 shadow-lg shadow-emerald-100/40 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${metric.accent} opacity-40`}
                />
                <div className="absolute inset-x-6 top-6 h-20 rounded-full bg-white/40 blur-2xl" />
                <CardHeader className="relative z-10 pb-2">
                  <CardDescription className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                    {metric.label}
                  </CardDescription>
                  <CardTitle className="mt-4 text-3xl font-bold text-slate-900">
                    {loading ? "…" : metric.value}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-600">
                    {metric.note}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-none bg-white/80 shadow-xl shadow-emerald-100/50">
            <CardHeader className="flex flex-col gap-4 border-b border-slate-100/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Recent listings
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Latest properties you've published
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/account/my-listings")}
                className="w-full rounded-full border-slate-200 px-5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 sm:w-auto"
              >
                Manage listings →
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="py-10 text-center text-sm font-medium text-slate-500">
                  Loading your listings...
                </div>
              ) : recentListings.length === 0 ? (
                <div className="py-10 text-center text-sm font-medium text-slate-500">
                  You haven't added any listings yet.
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-4 lg:hidden">
                    {recentListings.map((listing) => {
                      const { label, badge } = getListingStatusMeta(listing);
                      const statusBadgeClass =
                        [badge?.className, "text-xs"]
                          .filter(Boolean)
                          .join(" ")
                          .trim() || undefined;
                      return (
                        <article
                          key={listing._id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-emerald-50 transition hover:-translate-y-0.5 hover:shadow-md focus-within:outline focus-within:outline-2 focus-within:outline-emerald-500"
                        >
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                              <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                {listing.imageUrls?.[0] ? (
                                  <img
                                    src={listing.imageUrls[0]}
                                    alt={listing.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 space-y-1">
                                <h3 className="truncate text-base font-semibold text-slate-900">
                                  {listing.name}
                                </h3>
                                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                                  {new Date(
                                    listing.createdAt || Date.now()
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className="rounded-full capitalize"
                              >
                                {listing.type}
                              </Badge>
                              <Badge
                                variant={badge?.variant || "outline"}
                                className={statusBadgeClass}
                              >
                                {label}
                              </Badge>
                              {listing.offer && (
                                <Badge className="rounded-full bg-amber-100 text-amber-700">
                                  Offer
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => setSelectedListing(listing)}
                                className="min-h-11 flex-1 rounded-xl px-4 text-sm font-semibold"
                              >
                                View details
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  navigate(`/update-listing/${listing._id}`)
                                }
                                className="min-h-11 flex-1 rounded-xl px-4 text-sm"
                              >
                                Edit listing
                              </Button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="hidden rounded-2xl border border-slate-100 shadow-inner shadow-emerald-50 lg:block">
                    <div className="relative">
                      <div
                        className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-white via-white/70 to-transparent lg:flex lg:z-0"
                        aria-hidden="true"
                      />
                      <div className="relative max-w-full overflow-x-auto">
                        <Table className="relative z-10 min-w-[640px]">
                          <THead>
                            <TR className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                              <TH scope="col">Image</TH>
                              <TH scope="col">Title</TH>
                              <TH scope="col">Type</TH>
                              <TH scope="col">Status</TH>
                              <TH scope="col">Created</TH>
                              <TH
                                scope="col"
                                className="relative z-10 text-right"
                              >
                                Actions
                              </TH>
                            </TR>
                          </THead>
                          <TBody>
                            {recentListings.map((listing) => {
                              const { label, badge } =
                                getListingStatusMeta(listing);
                              const badgeClassName = [
                                "text-xs capitalize",
                                badge?.className || "",
                              ]
                                .join(" ")
                                .trim();

                              return (
                                <TR
                                  key={listing._id}
                                  className="group border-t border-slate-100/80"
                                >
                                  <TD>
                                    <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                      {listing.imageUrls?.[0] ? (
                                        <img
                                          src={listing.imageUrls[0]}
                                          alt={listing.name}
                                          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                        />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">
                                          No image
                                        </div>
                                      )}
                                    </div>
                                  </TD>
                                  <TD className="max-w-[220px] truncate font-medium text-slate-700">
                                    {listing.name}
                                  </TD>
                                  <TD>
                                    <Badge
                                      variant="outline"
                                      className="capitalize"
                                    >
                                      {listing.type}
                                    </Badge>
                                  </TD>
                                  <TD>
                                    <div className="flex flex-col gap-1">
                                      <Badge
                                        variant={badge?.variant || "outline"}
                                        className={badgeClassName || undefined}
                                      >
                                        {label}
                                      </Badge>
                                      {listing.offer && (
                                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                                          Offer
                                        </Badge>
                                      )}
                                    </div>
                                  </TD>
                                  <TD className="text-sm text-slate-500">
                                    {listing.createdAt
                                      ? new Date(
                                          listing.createdAt
                                        ).toLocaleDateString()
                                      : "—"}
                                  </TD>
                                  <TD className="text-right">
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() =>
                                        setSelectedListing(listing)
                                      }
                                      className="relative z-10 min-h-11 rounded-full px-4 text-xs font-semibold !bg-slate-900 !text-white hover:!bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                                    >
                                      View
                                    </Button>
                                  </TD>
                                </TR>
                              );
                            })}
                          </TBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none bg-transparent shadow-none">
            <CardHeader className="px-0">
              <CardTitle className="text-xl font-semibold text-slate-900">
                Quick actions
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Keep your property journey moving
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action) => (
                  <button
                    key={action.to}
                    type="button"
                    onClick={() => navigate(action.to)}
                    className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/80 p-4 text-left shadow-lg shadow-emerald-100/40 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 sm:p-5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow">
                      <action.icon className="h-5 w-5" />
                    </span>
                    <div className="mt-4 space-y-2">
                      <div className="text-sm font-semibold text-slate-900">
                        {action.label}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-2">
                        {action.description}
                      </div>
                    </div>
                    <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500 group-hover:text-emerald-600">
                      Continue
                      <span aria-hidden="true">↗</span>
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Dialog
            open={!!selectedListing}
            onOpenChange={(open) => !open && setSelectedListing(null)}
            title={selectedListing?.name || "Listing details"}
            footer={
              <div className="flex w-full items-center justify-between">
                <div className="text-xs text-slate-400">
                  ID: {selectedListing?._id ?? "—"}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedListing(null)}
                    className="min-h-11 rounded-xl px-4"
                  >
                    Close
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => {
                      if (!selectedListing?._id) return;
                      navigate(`/update-listing/${selectedListing._id}`);
                      setSelectedListing(null);
                    }}
                    className="min-h-11 rounded-xl px-4"
                  >
                    Edit listing
                  </Button>
                </div>
              </div>
            }
          >
            {selectedListing && (
              <div className="space-y-6 text-sm">
                <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-slate-200/70 text-slate-700">
                      {selectedListing.type}
                    </Badge>
                    {selectedListing.offer && (
                      <Badge className="rounded-full bg-amber-100 text-amber-700">
                        Offer available
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Created{" "}
                    {selectedListing.createdAt
                      ? new Date(selectedListing.createdAt).toLocaleString()
                      : "—"}
                    {selectedListing.updatedAt
                      ? ` • Updated ${new Date(
                          selectedListing.updatedAt
                        ).toLocaleString()}`
                      : ""}
                  </p>
                </section>

                <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 sm:grid-cols-2">
                  {[
                    "regularPrice",
                    "discountPrice",
                    "bedrooms",
                    "bathrooms",
                  ].map((key) => {
                    const labelMap = {
                      regularPrice: "Regular price",
                      discountPrice: "Discount price",
                      bedrooms: "Bedrooms",
                      bathrooms: "Bathrooms",
                    };
                    const valueMap = {
                      regularPrice: currencyFormatter.format(
                        Number(selectedListing.regularPrice || 0)
                      ),
                      discountPrice: selectedListing.discountPrice
                        ? currencyFormatter.format(
                            Number(selectedListing.discountPrice)
                          )
                        : "Not set",
                      bedrooms: selectedListing.bedrooms,
                      bathrooms: selectedListing.bathrooms,
                    };
                    return (
                      <div key={key} className="space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                          {labelMap[key]}
                        </p>
                        <p className="text-base font-semibold text-slate-900">
                          {valueMap[key] ?? "—"}
                        </p>
                      </div>
                    );
                  })}
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Parking
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      {selectedListing.parking ? "Included" : "Not included"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Furnished
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      {selectedListing.furnished ? "Yes" : "No"}
                    </p>
                  </div>
                </section>

                {selectedListing.description && (
                  <section className="space-y-2 rounded-2xl border border-slate-200 bg-white px-5 py-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Description
                    </p>
                    <p className="leading-relaxed text-slate-700">
                      {selectedListing.description}
                    </p>
                  </section>
                )}

                <section className="space-y-2 rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Media gallery
                    </p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                      {selectedListing.imageUrls?.length || 0} item(s)
                    </span>
                  </div>
                  {selectedListing.imageUrls?.length ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {selectedListing.imageUrls.map((url, idx) => (
                        <div
                          key={`${url}-${idx}`}
                          className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                        >
                          <img
                            src={url}
                            alt={`listing-${idx}`}
                            className="h-28 w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No media available.
                    </p>
                  )}
                </section>
              </div>
            )}
          </Dialog>
        </div>
      </div>
    </div>
  );
}

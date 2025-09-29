import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog } from "../../components/ui/dialog";

export default function UserMyListings() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, listing: null });

  const summary = useMemo(() => {
    const total = listings.length;
    const active = listings.filter(
      (listing) => listing.isActive !== false
    ).length;
    const offers = listings.filter((listing) => listing.offer).length;
    const rent = listings.filter((listing) => listing.type === "rent").length;
    const sale = listings.filter((listing) => listing.type === "sale").length;
    return {
      total,
      active,
      inactive: total - active,
      offers,
      rent,
      sale,
    };
  }, [listings]);

  const summaryMetrics = [
    {
      key: "total",
      label: "Total listings",
      value: summary.total,
      note: "All entries",
      accent: "from-indigo-500/20 to-indigo-100/40 text-indigo-600",
    },
    {
      key: "active",
      label: "Active",
      value: summary.active,
      note: "Live now",
      accent: "from-emerald-500/20 to-emerald-100/40 text-emerald-600",
    },
    {
      key: "inactive",
      label: "Inactive",
      value: summary.inactive,
      note: "Hidden",
      accent: "from-slate-500/20 to-slate-100/40 text-slate-600",
    },
    {
      key: "offers",
      label: "Offers",
      value: summary.offers,
      note: "Discounted",
      accent: "from-amber-500/20 to-amber-100/40 text-amber-600",
    },
    {
      key: "ratio",
      label: "Rent vs Sale",
      value: `${summary.rent}/${summary.sale}`,
      note: "Rent / Sale",
      accent: "from-sky-500/20 to-sky-100/40 text-sky-600",
    },
  ];

  const loadListings = useCallback(async () => {
    if (!currentUser?._id) return;

    const parseJson = async (response) => {
      const text = await response.text();
      if (!response.ok) {
        let message;
        try {
          message = text ? JSON.parse(text).message : undefined;
        } catch {
          message = undefined;
        }
        throw new Error(message || "Failed to fetch your listings");
      }
      if (!text) return [];
      try {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error("Unexpected listings payload");
        }
        return parsed;
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Invalid listings data"
        );
      }
    };

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/user/listings/${currentUser._id}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const listingsData = await parseJson(response);
      setListings(listingsData);
    } catch (err) {
      setError(err.message);
      setMessage(null);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?._id]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const requestDelete = async () => {
    if (!confirm.listing) return;
    try {
      const res = await fetch(`/api/listing/delete/${confirm.listing._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete listing");
      }
      setListings((prev) =>
        prev.filter((listing) => listing._id !== confirm.listing._id)
      );
      setMessage("Listing deleted successfully");
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirm({ open: false, listing: null });
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-xl">
        <div className="flex flex-col gap-6 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Your workspace
            </p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  My Listings
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-500">
                  Manage the properties you've published and keep details up to
                  date.
                </p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
                Updates show instantly after each change
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {loading && listings.length === 0
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Card
                    key={`summary-skeleton-${index}`}
                    className="border-none bg-slate-100 shadow-none animate-pulse"
                  >
                    <CardContent className="space-y-4 py-6">
                      <div className="h-3 w-24 rounded-full bg-slate-200" />
                      <div className="h-8 w-16 rounded-lg bg-slate-200" />
                      <div className="h-5 w-24 rounded-full bg-slate-200" />
                    </CardContent>
                  </Card>
                ))
              : summaryMetrics.map((metric) => (
                  <Card
                    key={metric.key}
                    className="relative overflow-hidden border-none bg-white/90 shadow-lg shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl"
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
                        {metric.value}
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
        </div>
      </section>

      {(error || message) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || message}
        </div>
      )}

      <Card className="border-slate-200/70 shadow-md">
        <CardHeader className="flex flex-col gap-3 rounded-2xl bg-slate-50/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-slate-900">
              Your listings
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">
              Only listings created by {currentUser?.username || "you"}
            </CardDescription>
          </div>
          <Button
            onClick={() => navigate("/account/create-listing")}
            className="rounded-xl px-5 py-2.5"
          >
            Create new listing
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 px-0 py-6 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white/60 py-14 text-sm text-slate-500">
              Loading your listings...
            </div>
          ) : listings.length === 0 ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-14 text-sm text-slate-500">
              You haven't created any listings yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <Table className="bg-white text-sm">
                <THead>
                  <TR className="bg-slate-50 text-slate-600">
                    <TH className="w-[110px]">Image</TH>
                    <TH className="w-[220px]">Name</TH>
                    <TH>Created</TH>
                    <TH>Status</TH>
                    <TH>Price</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {listings.map((listing) => (
                    <TR key={listing._id} className="bg-white/60">
                      <TD>
                        <div className="h-14 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
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
                      </TD>
                      <TD className="max-w-[220px] align-top">
                        <div className="flex flex-col gap-1">
                          <Link
                            to={`/listing/${listing._id}`}
                            className="truncate text-sm font-semibold text-slate-900 hover:text-indigo-600 hover:underline"
                          >
                            {listing.name}
                          </Link>
                          <span className="truncate text-xs text-slate-500">
                            {listing.address || "Address hidden"}
                          </span>
                        </div>
                      </TD>
                      <TD className="text-sm text-slate-500">
                        {listing.createdAt
                          ? new Date(listing.createdAt).toLocaleDateString()
                          : "—"}
                      </TD>
                      <TD>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={
                              listing.isActive !== false ? "success" : "outline"
                            }
                            className="w-fit"
                          >
                            {listing.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                          {listing.offer && (
                            <Badge className="w-fit bg-amber-100 text-amber-700">
                              Offer
                            </Badge>
                          )}
                        </div>
                      </TD>
                      <TD className="text-sm font-semibold text-slate-900">
                        ${listing.regularPrice?.toLocaleString() || "—"}
                      </TD>
                      <TD>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="rounded-lg"
                            onClick={() => navigate(`/listing/${listing._id}`)}
                          >
                            View
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            className="rounded-lg"
                            onClick={() =>
                              navigate(`/update-listing/${listing._id}`)
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-lg"
                            onClick={() =>
                              setConfirm({ open: true, listing: listing })
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 shadow-md">
        <CardHeader className="rounded-2xl bg-slate-50/70 px-6 py-5">
          <CardTitle className="text-xl font-semibold text-slate-900">
            Account snapshot
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            Quick glance at your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-inner">
                <img
                  src={
                    currentUser?.avatar ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                  }
                  alt={currentUser?.username}
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 rounded-full ring-8 ring-white/40" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-900">
                  {currentUser?.username || "Member"}
                </p>
                <p className="text-xs text-slate-500">{currentUser?.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <Badge
                variant="outline"
                className="rounded-full border-slate-200 bg-slate-50 px-3 py-1"
              >
                Listings: {listings.length}
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border-slate-200 bg-slate-50 px-3 py-1"
              >
                Offers: {listings.filter((l) => l.offer).length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={confirm.open}
        onOpenChange={(open) =>
          !open && setConfirm({ open: false, listing: null })
        }
        title="Delete listing"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setConfirm({ open: false, listing: null })}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="!bg-red-600 hover:!bg-red-700 text-white"
              onClick={requestDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete "{confirm.listing?.name}"? This action
          cannot be undone.
        </p>
      </Dialog>
    </div>
  );
}

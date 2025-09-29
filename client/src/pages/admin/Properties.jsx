import React, { useState, useEffect, useCallback } from "react";
import { Table, THead, TBody, TR, TH, TD } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Dialog } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const statusTabs = [
  {
    value: "all",
    label: "All",
    description: "Every property in the system",
  },
  {
    value: "active",
    label: "Active",
    description: "Currently visible to buyers",
  },
  {
    value: "inactive",
    label: "Inactive",
    description: "Temporarily hidden listings",
  },
];

const selectFilters = [
  {
    key: "type",
    label: "Type",
    width: "w-28",
    options: [
      { value: "all", label: "All" },
      { value: "sale", label: "Sale" },
      { value: "rent", label: "Rent" },
    ],
  },
  {
    key: "offer",
    label: "Offer",
    width: "w-24",
    options: [
      { value: "all", label: "All" },
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
  },
  {
    key: "furnished",
    label: "Furnished",
    width: "w-28",
    options: [
      { value: "all", label: "All" },
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
  },
  {
    key: "parking",
    label: "Parking",
    width: "w-24",
    options: [
      { value: "all", label: "All" },
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
  },
];

const initialFilters = {
  type: "all",
  status: "all",
  offer: "all",
  furnished: "all",
  parking: "all",
};

const emptyConfirmState = {
  open: false,
  listing: null,
  action: null,
  title: "",
  description: "",
};

const normalizeBooleanFilter = (value) => {
  if (value === null || typeof value === "undefined" || value === "all") {
    return null;
  }

  if (value === true || value === "true" || value === "yes") {
    return "true";
  }

  if (value === false || value === "false" || value === "no") {
    return "false";
  }

  return null;
};

export default function Properties() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [filters, setFilters] = useState(() => ({ ...initialFilters }));
  const [refreshToken, setRefreshToken] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmState, setConfirmState] = useState(emptyConfirmState);
  const [actionLoading, setActionLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      setSummaryError(null);
      const res = await fetch("/api/admin/listings/summary", {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load property summary");
      }
      const data = await res.json();
      setSummary({
        total: typeof data?.total === "number" ? data.total : 0,
        active: typeof data?.active === "number" ? data.active : 0,
        inactive: typeof data?.inactive === "number" ? data.inactive : 0,
        offers: typeof data?.offers === "number" ? data.offers : 0,
      });
    } catch (err) {
      setSummary(null);
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadListings = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        const searchTerm = appliedSearch.trim();
        if (searchTerm) params.set("search", searchTerm);
        if (filters.type !== "all") params.set("type", filters.type);
        if (filters.status !== "all") {
          params.set(
            "isActive",
            filters.status === "active" ? "true" : "false"
          );
        }

        const offerValue = normalizeBooleanFilter(filters.offer);
        if (offerValue !== null) params.set("offer", offerValue);

        const furnishedValue = normalizeBooleanFilter(filters.furnished);
        if (furnishedValue !== null) params.set("furnished", furnishedValue);

        const parkingValue = normalizeBooleanFilter(filters.parking);
        if (parkingValue !== null) params.set("parking", parkingValue);

        const res = await fetch(`/api/admin/listings?${params.toString()}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to fetch listings");
        }
        const data = await res.json();
        if (!ignore) {
          setListings(data.items || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
          setListings([]);
          setTotalPages(1);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadListings();

    return () => {
      ignore = true;
    };
  }, [appliedSearch, filters, page, limit, refreshToken]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    const wasPageChanged = page !== 1;

    if (wasPageChanged) {
      setPage(1);
    }

    if (trimmed !== appliedSearch) {
      setAppliedSearch(trimmed);
    } else if (!wasPageChanged) {
      setRefreshToken((token) => token + 1);
    }
  };

  const handleFilterChange = (key, value) => {
    if (filters[key] === value) return;

    setFilters({ ...filters, [key]: value });

    if (page !== 1) {
      setPage(1);
    }
  };

  const handleResetFilters = () => {
    setFilters({ ...initialFilters });
    setSearchQuery("");
    const shouldResetPage = page !== 1;

    if (shouldResetPage) {
      setPage(1);
    }

    if (appliedSearch !== "") {
      setAppliedSearch("");
    }
  };

  const openConfirm = (listing, action) => {
    const copy = {
      toggle: {
        title: listing.isActive ? "Mark as unavailable" : "Activate listing",
        description: listing.isActive
          ? `Hide ${listing.name} from the marketplace?`
          : `Make ${listing.name} visible to users immediately?`,
      },
      delete: {
        title: "Delete listing",
        description: `Permanently remove ${listing.name}? This can’t be undone.`,
      },
    };

    setConfirmState({
      open: true,
      listing,
      action,
      title: copy[action].title,
      description: copy[action].description,
    });
  };

  const closeConfirm = () => setConfirmState({ ...emptyConfirmState });

  const performAction = async () => {
    if (!confirmState.listing || !confirmState.action) return;

    try {
      setActionLoading(true);
      if (confirmState.action === "toggle") {
        const res = await fetch(
          `/api/admin/listings/${confirmState.listing._id}/active`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !confirmState.listing.isActive }),
          }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to update listing");
        }
      } else if (confirmState.action === "delete") {
        const res = await fetch(
          `/api/admin/listings/${confirmState.listing._id}`,
          {
            method: "DELETE",
          }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to delete listing");
        }
      }

      setRefreshToken((token) => token + 1);
      await fetchSummary();
      closeConfirm();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (value) => {
    if (!value) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-transparent text-slate-900 shadow-xl">
        <div className="flex flex-col gap-6 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Admin control center
            </p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Properties overview
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-500">
                  Monitor every listing, keep your portfolio curated, and ensure
                  the best properties stay front and center.
                </p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
                Updated in real time from the live database
              </div>
            </div>
          </div>

          {summaryError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {summaryError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Card
                    key={`summary-skeleton-${index}`}
                    className="border-none bg-white/70 shadow-lg shadow-slate-200/60 animate-pulse"
                  >
                    <CardContent className="space-y-4 py-6">
                      <div className="h-3 w-24 rounded-full bg-slate-200" />
                      <div className="h-8 w-16 rounded-lg bg-slate-200" />
                      <div className="h-5 w-28 rounded-full bg-slate-200" />
                    </CardContent>
                  </Card>
                ))
              : [
                  {
                    key: "total",
                    label: "Total listings",
                    value: summary?.total ?? 0,
                    note: "Across the entire marketplace",
                    accent:
                      "from-indigo-500/20 to-indigo-100/40 text-indigo-600",
                  },
                  {
                    key: "active",
                    label: "Active",
                    value: summary?.active ?? 0,
                    note: "Currently discoverable",
                    accent:
                      "from-emerald-500/20 to-emerald-100/40 text-emerald-600",
                  },
                  {
                    key: "inactive",
                    label: "Inactive",
                    value: summary?.inactive ?? 0,
                    note: "Hidden until reactivated",
                    accent: "from-slate-500/20 to-slate-100/40 text-slate-600",
                  },
                  {
                    key: "offers",
                    label: "On offer",
                    value: summary?.offers ?? 0,
                    note: "Promoted with incentives",
                    accent: "from-amber-500/20 to-amber-100/40 text-amber-600",
                  },
                ].map((metric) => (
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
                        {numberFormatter.format(metric.value)}
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

      <Card className="border-slate-200/70 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-slate-900">
            Property workspace
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Search, filter, and moderate listings without leaving the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap gap-3">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => handleFilterChange("status", tab.value)}
                    className={`group flex flex-1 min-w-[160px] items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                      filters.status === tab.value
                        ? "border-slate-900 bg-slate-900 text-white shadow"
                        : "border-transparent bg-white text-slate-700 shadow-sm hover:border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{tab.label}</div>
                      <div
                        className={`text-xs ${
                          filters.status === tab.value
                            ? "text-white/70"
                            : "text-slate-500"
                        }`}
                      >
                        {tab.description}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        filters.status === tab.value
                          ? "bg-white/10 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {filters.status === tab.value ? "Selected" : "Choose"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col gap-3 md:flex-row"
            >
              <div className="flex-1">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Search by title
                </label>
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Start typing a property name or keyword"
                  className="mt-1 h-11 rounded-xl border-slate-200 bg-white"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  type="submit"
                  variant="default"
                  className="h-11 rounded-xl px-6"
                >
                  Search
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResetFilters}
                  className="h-11 rounded-xl px-5"
                >
                  Reset
                </Button>
              </div>
            </form>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {selectFilters.map((filter) => (
                <div key={filter.key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {filter.label}
                  </label>
                  <Select
                    value={filters[filter.key]}
                    onChange={(event) =>
                      handleFilterChange(filter.key, event.target.value)
                    }
                    className={`h-11 rounded-xl border-slate-200 bg-white ${filter.width}`}
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            {loading ? (
              <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                Fetching listings…
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="bg-white">
                  <THead>
                    <TR className="bg-slate-50">
                      <TH className="w-[120px]">Preview</TH>
                      <TH className="w-[220px]">Title</TH>
                      <TH>Owner</TH>
                      <TH>Pricing</TH>
                      <TH className="w-[90px]">Type</TH>
                      <TH className="w-[120px]">Status</TH>
                      <TH className="text-right">Actions</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {listings.length === 0 ? (
                      <TR className="hover:bg-transparent">
                        <TD
                          colSpan={7}
                          className="py-10 text-center text-sm text-slate-500"
                        >
                          No listings matched the current filters.
                        </TD>
                      </TR>
                    ) : (
                      listings.map((listing) => (
                        <TR key={listing._id} className="bg-white/50">
                          <TD>
                            <div className="h-16 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                              {listing.imageUrls?.[0] ? (
                                <img
                                  src={listing.imageUrls[0]}
                                  alt={listing.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-500">
                                  No image
                                </div>
                              )}
                            </div>
                          </TD>
                          <TD className="max-w-[220px] font-medium text-slate-900">
                            <div className="truncate" title={listing.name}>
                              {listing.name}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {listing.address || "Address hidden"}
                            </div>
                          </TD>
                          <TD className="align-top text-xs text-slate-500">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(listing.userRef)}
                              className="font-mono text-[11px] text-indigo-600 hover:underline"
                            >
                              {listing.userRef || "—"}
                            </button>
                          </TD>
                          <TD className="text-sm font-semibold text-slate-900">
                            <div>
                              {currencyFormatter.format(
                                listing.regularPrice || 0
                              )}
                            </div>
                            {listing.offer && listing.discountPrice ? (
                              <div className="text-xs text-emerald-600">
                                Offer:{" "}
                                {currencyFormatter.format(
                                  listing.discountPrice
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500">
                                No offer
                              </div>
                            )}
                          </TD>
                          <TD>
                            <Badge variant="outline" className="capitalize">
                              {listing.type || "—"}
                            </Badge>
                          </TD>
                          <TD>
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant={
                                  listing.isActive ? "success" : "outline"
                                }
                              >
                                {listing.isActive ? "Active" : "Inactive"}
                              </Badge>
                              {listing.offer && (
                                <Badge className="bg-amber-100 text-amber-700">
                                  Offer
                                </Badge>
                              )}
                            </div>
                          </TD>
                          <TD>
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="rounded-lg"
                                onClick={() => setSelectedListing(listing)}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant={
                                  listing.isActive ? "outline" : "success"
                                }
                                className="rounded-lg"
                                onClick={() => openConfirm(listing, "toggle")}
                              >
                                {listing.isActive ? "Deactivate" : "Activate"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="rounded-lg"
                                onClick={() => openConfirm(listing, "delete")}
                              >
                                Delete
                              </Button>
                            </div>
                          </TD>
                        </TR>
                      ))
                    )}
                  </TBody>
                </Table>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <div>
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-lg"
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={page === totalPages || totalPages === 0}
                onClick={() =>
                  setPage((prev) => (prev < totalPages ? prev + 1 : prev))
                }
                className="rounded-lg"
              >
                Next
              </Button>
            </div>
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
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setSelectedListing(null)}
            >
              Close
            </Button>
          </div>
        }
      >
        {selectedListing && (
          <div className="space-y-6 text-sm">
            <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={selectedListing.isActive ? "success" : "outline"}
                  className="rounded-full"
                >
                  {selectedListing.isActive ? "Active" : "Inactive"}
                </Badge>
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
                Created {new Date(selectedListing.createdAt).toLocaleString()}
                {selectedListing.updatedAt
                  ? ` • Updated ${new Date(
                      selectedListing.updatedAt
                    ).toLocaleString()}`
                  : ""}
              </p>
            </section>

            <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 sm:grid-cols-2">
              {[
                {
                  label: "Regular Price",
                  value: currencyFormatter.format(
                    selectedListing.regularPrice || 0
                  ),
                },
                {
                  label: "Discount Price",
                  value: selectedListing.discountPrice
                    ? currencyFormatter.format(selectedListing.discountPrice)
                    : "Not set",
                },
                { label: "Bedrooms", value: selectedListing.bedrooms },
                { label: "Bathrooms", value: selectedListing.bathrooms },
                {
                  label: "Parking",
                  value: selectedListing.parking ? "Yes" : "No",
                },
                {
                  label: "Furnished",
                  value: selectedListing.furnished ? "Yes" : "No",
                },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {item.value ?? "—"}
                  </p>
                </div>
              ))}
              <div className="sm:col-span-2 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Owner Reference
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedListing.userRef)}
                  className="inline-flex items-center gap-2 font-mono text-xs text-indigo-600 hover:underline"
                >
                  {selectedListing.userRef}
                </button>
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
                  Media Gallery
                </p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                  {selectedListing.imageUrls?.length || 0} item(s)
                </span>
              </div>
              {selectedListing.imageUrls?.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {selectedListing.imageUrls.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={url}
                        alt={`listing-${index}`}
                        className="h-28 w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(url)}
                        className="absolute bottom-2 right-2 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100"
                      >
                        Copy URL
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No media available.</p>
              )}
            </section>
          </div>
        )}
      </Dialog>

      <Dialog
        open={confirmState.open}
        onOpenChange={(open) => !open && closeConfirm()}
        title={confirmState.title || "Confirm action"}
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={actionLoading}
              onClick={closeConfirm}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={
                confirmState.action === "delete" ? "destructive" : "default"
              }
              disabled={actionLoading}
              onClick={performAction}
            >
              {actionLoading ? "Working…" : "Confirm"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">{confirmState.description}</p>
      </Dialog>
    </div>
  );
}

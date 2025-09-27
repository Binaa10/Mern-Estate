import React, { useState, useEffect, useCallback } from "react";
import { Table, THead, TBody, TR, TH, TD } from "../../components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";

import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";

export default function Properties() {
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [offerFilter, setOfferFilter] = useState("all");
  const [furnishedFilter, setFurnishedFilter] = useState("all");
  const [parkingFilter, setParkingFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState({
    open: false,
    listing: null,
    action: null,
    title: "",
    description: "",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      setSummaryError(null);
      const endpoints = [
        "/api/admin/listings?page=1&limit=1",
        "/api/admin/listings?isActive=true&page=1&limit=1",
        "/api/admin/listings?isActive=false&page=1&limit=1",
        "/api/admin/listings?offer=true&page=1&limit=1",
      ];
      const responses = await Promise.all(endpoints.map((url) => fetch(url)));
      const datasets = await Promise.all(
        responses.map(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || "Failed to load property summary");
          }
          return res.json();
        })
      );
      const [allData, activeData, inactiveData, offerData] = datasets;
      const getTotal = (data) =>
        typeof data?.total === "number"
          ? data.total
          : Array.isArray(data?.items)
          ? data.items.length
          : 0;
      setSummary({
        total: getTotal(allData),
        active: getTotal(activeData),
        inactive: getTotal(inactiveData),
        offers: getTotal(offerData),
      });
    } catch (err) {
      setSummary(null);
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search.trim()) params.set("search", search.trim());
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (offerFilter !== "all") params.set("offer", offerFilter);
      if (furnishedFilter !== "all") params.set("furnished", furnishedFilter);
      if (parkingFilter !== "all") params.set("parking", parkingFilter);
      const res = await fetch(`/api/admin/listings?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to fetch listings");
      }
      const data = await res.json();
      setListings(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    limit,
    typeFilter,
    statusFilter,
    offerFilter,
    furnishedFilter,
    parkingFilter,
  ]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  const openConfirm = (listing, action) => {
    const map = {
      toggle: {
        title: listing.isActive ? "Make Unavailable" : "Make Available",
        description: listing.isActive
          ? `Mark ${listing.name} as unavailable? It will be hidden from users.`
          : `Reactivate ${listing.name}? It will become visible to users.`,
      },
      delete: {
        title: "Delete Listing",
        description: `Permanently delete ${listing.name}? This cannot be undone.`,
      },
    };
    setConfirm({
      open: true,
      listing,
      action,
      title: map[action].title,
      description: map[action].description,
    });
  };

  const performAction = async () => {
    if (!confirm.listing) return;
    try {
      setActionLoading(true);
      if (confirm.action === "toggle") {
        const res = await fetch(
          `/api/admin/listings/${confirm.listing._id}/active`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !confirm.listing.isActive }),
          }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to update listing");
        }
      } else if (confirm.action === "delete") {
        const res = await fetch(`/api/admin/listings/${confirm.listing._id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to delete listing");
        }
      }
      await fetchListings();
      setConfirm({
        open: false,
        listing: null,
        action: null,
        title: "",
        description: "",
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          All Properties
        </h1>
        <p className="text-sm text-slate-500">
          Complete list of listed properties
        </p>
      </div>
      <div className="space-y-2">
        {summaryError && (
          <div className="text-sm text-red-700 bg-red-100 border border-red-200 rounded px-3 py-2">
            {summaryError}
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryLoading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border bg-white p-4 shadow-sm animate-pulse"
                >
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="mt-3 h-8 w-12 bg-slate-200 rounded" />
                  <div className="mt-4 h-6 w-24 bg-slate-200 rounded-full" />
                </div>
              ))
            : [
                {
                  label: "Total Listings",
                  value: summary?.total ?? 0,
                  helper: "All listings",
                  helperClass: "bg-emerald-100 text-emerald-700",
                },
                {
                  label: "Active",
                  value: summary?.active ?? 0,
                  helper: "Currently live",
                  helperClass: "bg-green-100 text-green-700",
                },
                {
                  label: "Inactive",
                  value: summary?.inactive ?? 0,
                  helper: "Hidden listings",
                  helperClass: "bg-slate-200 text-slate-700",
                },
                {
                  label: "On Offer",
                  value: summary?.offers ?? 0,
                  helper: "Discounted",
                  helperClass: "bg-amber-100 text-amber-700",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border bg-white p-5 shadow-sm flex flex-col gap-3"
                >
                  <span className="text-sm font-medium text-slate-500">
                    {card.label}
                  </span>
                  <span className="text-3xl font-semibold text-slate-900">
                    {card.value}
                  </span>
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${card.helperClass}`}
                  >
                    {card.helper}
                  </span>
                </div>
              ))}
        </div>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Properties</CardTitle>
          <CardDescription>Showing real listings from database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">
                  Status:
                </span>
                {["all", "active", "inactive"].map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={statusFilter === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setStatusFilter(s);
                      setPage(1);
                    }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <form
              onSubmit={onSearchSubmit}
              className="flex flex-col sm:flex-row gap-2"
            >
              <Input
                type="text"
                placeholder="Search listing name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline">
                Search
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                  setOfferFilter("all");
                  setFurnishedFilter("all");
                  setParkingFilter("all");
                  setPage(1);
                  fetchListings();
                }}
              >
                Reset
              </Button>
            </form>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Type:
                </span>
                <Select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-24"
                >
                  <option value="all">All</option>
                  <option value="sale">Sale</option>
                  <option value="rent">Rent</option>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Offer:
                </span>
                <Select
                  value={offerFilter}
                  onChange={(e) => {
                    setOfferFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-20"
                >
                  <option value="all">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Furnished:
                </span>
                <Select
                  value={furnishedFilter}
                  onChange={(e) => {
                    setFurnishedFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-24"
                >
                  <option value="all">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Parking:
                </span>
                <Select
                  value={parkingFilter}
                  onChange={(e) => {
                    setParkingFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-20"
                >
                  <option value="all">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </div>
            </div>
          </div>
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading listings...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Image</TH>
                    <TH>Title</TH>
                    <TH>Owner</TH>
                    <TH>Price</TH>
                    <TH>Type</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {listings.length === 0 && (
                    <TR>
                      <TD
                        colSpan={7}
                        className="text-center text-sm py-8 text-slate-500"
                      >
                        No listings found
                      </TD>
                    </TR>
                  )}
                  {listings.map((l) => (
                    <TR key={l._id}>
                      <TD>
                        <div className="h-12 w-16 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                          {l.imageUrls?.[0] && (
                            <img
                              src={l.imageUrls[0]}
                              alt={l.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      </TD>
                      <TD className="font-medium max-w-[200px] truncate">
                        {l.name}
                      </TD>
                      <TD className="truncate max-w-[120px] text-xs">
                        {l.userRef}
                      </TD>
                      <TD className="font-medium">
                        ${l.regularPrice?.toLocaleString()}
                      </TD>
                      <TD>
                        <Badge variant="outline" className="capitalize">
                          {l.type}
                        </Badge>
                      </TD>
                      <TD>
                        <div className="flex flex-col gap-1">
                          <Badge variant={l.isActive ? "success" : "outline"}>
                            {l.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {l.offer && (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                              Offer
                            </Badge>
                          )}
                        </div>
                      </TD>
                      <TD>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => setSelected(l)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className={
                              l.isActive
                                ? "!bg-red-600 hover:!bg-red-700 text-white"
                                : "!bg-green-600 hover:!bg-green-700 text-white"
                            }
                            onClick={() => openConfirm(l, "toggle")}
                          >
                            {l.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="!bg-red-600 hover:!bg-red-700 text-white"
                            onClick={() => openConfirm(l, "delete")}
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
          <div className="flex justify-between items-center mt-4 text-sm">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title="Listing Details"
        footer={
          <div className="w-full flex justify-between items-center">
            <div className="text-xs text-slate-400">
              ID: {selected?._id?.slice(0, 8)}… (full copied when clicked)
            </div>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-6 text-sm">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold tracking-tight">
                  {selected.name}
                </h2>
                <Badge variant={selected.isActive ? "success" : "outline"}>
                  {selected.isActive ? "Active" : "Inactive"}
                </Badge>
                {selected.offer && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    Offer
                  </Badge>
                )}
                <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                  {selected.type}
                </Badge>
              </div>
              <div className="text-xs text-slate-500 flex gap-4 flex-wrap">
                <span>
                  Created: {new Date(selected.createdAt).toLocaleString()}
                </span>
                {selected.updatedAt && (
                  <span>
                    Updated: {new Date(selected.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Regular Price
                </p>
                <p className="font-medium">
                  ${selected.regularPrice?.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Discount Price
                </p>
                <p className="font-medium">
                  {selected.discountPrice
                    ? `$${selected.discountPrice.toLocaleString()}`
                    : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Offer
                </p>
                <p className="font-medium">{selected.offer ? "Yes" : "No"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Bedrooms
                </p>
                <p className="font-medium">{selected.bedrooms}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Bathrooms
                </p>
                <p className="font-medium">{selected.bathrooms}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Owner User Ref
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs break-all">
                    {selected.userRef}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selected.userRef);
                    }}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Furnished
                </p>
                <p className="font-medium">
                  {selected.furnished ? "Yes" : "No"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Parking
                </p>
                <p className="font-medium">{selected.parking ? "Yes" : "No"}</p>
              </div>
            </div>

            {/* Description */}
            {selected.description && (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Description
                </p>
                <p className="leading-relaxed text-slate-700 whitespace-pre-line">
                  {selected.description}
                </p>
              </div>
            )}

            {/* Images */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Images ({selected.imageUrls?.length || 0})
              </p>
              {(!selected.imageUrls || selected.imageUrls.length === 0) && (
                <p className="text-xs text-slate-500">No images uploaded.</p>
              )}
              {selected.imageUrls?.length > 0 && (
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                  {selected.imageUrls.map((url, i) => (
                    <div
                      key={i}
                      className="relative group border rounded overflow-hidden bg-slate-50"
                    >
                      <img
                        src={url}
                        alt={`img-${i}`}
                        className="h-24 w-full object-cover group-hover:opacity-90 transition"
                      />
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(url)}
                        className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Additional moderation actions can be added later.
            </p>
          </div>
        )}
      </Dialog>
      {confirm.open && (
        <Dialog
          open={confirm.open}
          onOpenChange={(o) =>
            !o &&
            setConfirm({
              open: false,
              listing: null,
              action: null,
              title: "",
              description: "",
            })
          }
          title={confirm.title}
          footer={
            <>
              <Button
                variant="outline"
                disabled={actionLoading}
                onClick={() =>
                  setConfirm({
                    open: false,
                    listing: null,
                    action: null,
                    title: "",
                    description: "",
                  })
                }
              >
                Cancel
              </Button>
              <Button
                variant="default"
                disabled={actionLoading}
                onClick={performAction}
              >
                {actionLoading ? "Working..." : "Confirm"}
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-600">{confirm.description}</p>
        </Dialog>
      )}
    </div>
  );
}

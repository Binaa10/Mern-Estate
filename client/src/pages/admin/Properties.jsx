import React, { useState, useEffect } from "react";
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

// Fetch real listings from /api/admin/listings

export default function Properties() {
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
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

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search.trim()) params.set("search", search.trim());
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
  }, [page, limit]);

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
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Properties</CardTitle>
          <CardDescription>Showing real listings from database</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onSearchSubmit}
            className="flex flex-col sm:flex-row gap-2 mb-4"
          >
            <input
              type="text"
              placeholder="Search listing name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-md px-3 py-2 w-full text-sm"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearch("");
                setPage(1);
                fetchListings();
              }}
            >
              Reset
            </Button>
          </form>
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
                    <TH>Title</TH>
                    <TH>Owner</TH>
                    <TH>Price</TH>
                    <TH>Offer</TH>
                    <TH>Active</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {listings.length === 0 && (
                    <TR>
                      <TD
                        colSpan={5}
                        className="text-center text-sm py-8 text-slate-500"
                      >
                        No listings found
                      </TD>
                    </TR>
                  )}
                  {listings.map((l) => (
                    <TR key={l._id}>
                      <TD className="font-medium">{l.name}</TD>
                      <TD className="truncate max-w-[140px]">{l.userRef}</TD>
                      <TD>${l.regularPrice?.toLocaleString()}</TD>
                      <TD>
                        <Badge variant={l.offer ? "success" : "outline"}>
                          {l.offer ? "Offer" : "—"}
                        </Badge>
                      </TD>
                      <TD>
                        <Badge variant={l.isActive ? "success" : "outline"}>
                          {l.isActive ? "Yes" : "No"}
                        </Badge>
                      </TD>
                      <TD>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelected(l)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openConfirm(l, "toggle")}
                          >
                            {l.isActive ? "Make Unavailable" : "Make Available"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
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

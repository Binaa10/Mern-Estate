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

const DEFAULT_AVATAR =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

export default function AdminMyListings() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, listing: null });

  const summary = useMemo(() => {
    const total = listings.length;
    const active = listings.filter((listing) => listing.isActive).length;
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

  const loadListings = useCallback(async () => {
    if (!currentUser?._id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to fetch your listings");
      }
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
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
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">My Listings</h1>
        <p className="text-sm text-slate-500">
          Manage the properties created under your admin account
        </p>
      </div>

      {(error || message) && (
        <div
          className={`text-sm border px-3 py-2 rounded ${
            error
              ? "text-red-700 bg-red-100 border-red-200"
              : "text-green-700 bg-green-100 border-green-200"
          }`}
        >
          {error || message}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: "Total Listings",
            value: summary.total,
            helper: "All entries",
            helperClass: "bg-indigo-100 text-indigo-700",
          },
          {
            label: "Active",
            value: summary.active,
            helper: "Live now",
            helperClass: "bg-emerald-100 text-emerald-700",
          },
          {
            label: "Inactive",
            value: summary.inactive,
            helper: "Hidden",
            helperClass: "bg-slate-200 text-slate-700",
          },
          {
            label: "Offers",
            value: summary.offers,
            helper: "Discounted",
            helperClass: "bg-amber-100 text-amber-700",
          },
          {
            label: "Rent vs Sale",
            value: `${summary.rent}/${summary.sale}`,
            helper: "Rent / Sale",
            helperClass: "bg-slate-100 text-slate-700",
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

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Your Listings</CardTitle>
            <CardDescription>
              Only listings created by {currentUser?.username || "you"}
            </CardDescription>
          </div>
          <Button onClick={() => navigate("/admin/create-listing")}>
            Create New Listing
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading your listings...
            </div>
          ) : listings.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              You haven't created any listings yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Image</TH>
                    <TH>Name</TH>
                    <TH>Created</TH>
                    <TH>Status</TH>
                    <TH>Price</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {listings.map((listing) => (
                    <TR key={listing._id}>
                      <TD>
                        <div className="h-12 w-16 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                          {listing.imageUrls?.[0] ? (
                            <img
                              src={listing.imageUrls[0]}
                              alt={listing.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                              No image
                            </div>
                          )}
                        </div>
                      </TD>
                      <TD className="max-w-[220px]">
                        <div className="flex flex-col">
                          <Link
                            to={`/listing/${listing._id}`}
                            className="font-medium text-slate-900 dark:text-slate-100 hover:underline truncate"
                          >
                            {listing.name}
                          </Link>
                          <span className="text-xs text-slate-500 truncate">
                            {listing.address}
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
                            variant={listing.isActive ? "success" : "outline"}
                          >
                            {listing.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {listing.offer && (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                              Offer
                            </Badge>
                          )}
                        </div>
                      </TD>
                      <TD className="font-medium">
                        ${listing.regularPrice?.toLocaleString() || "—"}
                      </TD>
                      <TD>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/listing/${listing._id}`)}
                          >
                            View
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() =>
                              navigate(`/update-listing/${listing._id}`)
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
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

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Account Snapshot</CardTitle>
            <CardDescription>
              Quick glance at your admin profile
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full overflow-hidden bg-slate-100">
                <img
                  src={currentUser?.avatar || DEFAULT_AVATAR}
                  alt={currentUser?.username}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold">{currentUser?.username}</p>
                <p className="text-xs text-slate-500">{currentUser?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="uppercase tracking-wide">
                Listings: {listings.length}
              </Badge>
              <Badge variant="outline" className="uppercase tracking-wide">
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
        title="Delete Listing"
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

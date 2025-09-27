import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "../../components/ui/table";
import { Dialog } from "../../components/ui/dialog";
import {
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineOfficeBuilding,
  HiOutlineUser,
} from "react-icons/hi";

const quickLinks = [
  {
    label: "Analytics",
    to: "/admin/analytics",
    desc: "Traffic, growth trends, and KPI charts (mock data).",
    icon: HiOutlineChartBar,
  },
  {
    label: "Users",
    to: "/admin/users",
    desc: "Manage accounts: approve, deactivate, inspect profiles.",
    icon: HiOutlineUsers,
  },
  {
    label: "Properties",
    to: "/admin/properties",
    desc: "Review and moderate listed properties with status controls.",
    icon: HiOutlineOfficeBuilding,
  },
  {
    label: "Profile",
    to: "/admin/profile",
    desc: "Update your admin account details and password.",
    icon: HiOutlineUser,
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    users: null,
    listings: null,
    listingsToday: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingCount, setPendingCount] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState(null);
  const [recentListings, setRecentListings] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    const parseJsonBody = async (response, context) => {
      const raw = await response.text();
      if (!response.ok) {
        let message;
        try {
          message = raw ? JSON.parse(raw).message : undefined;
        } catch {
          message = undefined;
        }
        throw new Error(
          message ||
            `Failed to fetch ${context}${
              response.status ? ` (${response.status})` : ""
            }`
        );
      }
      if (!raw) return {};
      try {
        return JSON.parse(raw);
      } catch {
        throw new Error(`Invalid JSON received for ${context}`);
      }
    };

    const deriveMetrics = async () => {
      const since = new Date();
      since.setHours(0, 0, 0, 0);

      const [usersRes, listingsRes] = await Promise.all([
        fetch("/api/admin/users?page=1&limit=1", {
          credentials: "include",
          headers: { Accept: "application/json" },
        }),
        fetch(
          "/api/admin/listings?limit=100&page=1&sort=createdAt&order=desc",
          {
            credentials: "include",
            headers: { Accept: "application/json" },
          }
        ),
      ]);

      const [usersData, listingsData] = await Promise.all([
        parseJsonBody(usersRes, "user metrics"),
        parseJsonBody(listingsRes, "listing metrics"),
      ]);

      const listingItems = Array.isArray(listingsData.items)
        ? listingsData.items
        : [];
      const listingsToday = listingItems.filter((item) => {
        if (!item?.createdAt) return false;
        const created = new Date(item.createdAt);
        return !Number.isNaN(created.valueOf()) && created >= since;
      }).length;

      const totalUsers =
        typeof usersData.total === "number"
          ? usersData.total
          : Array.isArray(usersData.items)
          ? usersData.items.length
          : 0;
      const totalListings =
        typeof listingsData.total === "number"
          ? listingsData.total
          : listingItems.length;

      return {
        users: totalUsers,
        listings: totalListings,
        listingsToday,
      };
    };

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/admin/metrics", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        const raw = await response.text();
        let parsed;
        if (!response.ok) {
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch {
            parsed = null;
          }
          throw new Error(
            parsed?.message ||
              `Failed to fetch metrics${
                response.status ? ` (${response.status})` : ""
              }`
          );
        }
        if (raw) {
          try {
            parsed = JSON.parse(raw);
          } catch (parseErr) {
            if (import.meta.env.DEV) {
              console.warn(
                "Invalid metrics payload, deriving from listings/users.",
                parseErr
              );
            }
            parsed = await deriveMetrics();
          }
        } else {
          parsed = await deriveMetrics();
        }
        setMetrics({
          users: parsed?.users ?? 0,
          listings: parsed?.listings ?? 0,
          listingsToday: parsed?.listingsToday ?? 0,
        });
      } catch (err) {
        try {
          const fallback = await deriveMetrics();
          setMetrics(fallback);
          setError(null);
        } catch (fallbackError) {
          setError(err.message || fallbackError.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
    // Fetch pending count
    const fetchPendingCount = async () => {
      try {
        const res = await fetch(
          "/api/admin/users?status=pending&limit=1&page=1"
        );
        if (!res.ok) return; // silent
        const data = await res.json();
        setPendingCount(data.total ?? 0);
      } catch {
        setPendingCount(0);
      }
    };
    fetchPendingCount();
    // Fetch recent listings (latest 3)
    const fetchRecent = async () => {
      try {
        setRecentLoading(true);
        const res = await fetch(
          "/api/admin/listings?limit=3&page=1&sort=createdAt&order=desc"
        );
        if (!res.ok) return; // silent
        const data = await res.json();
        setRecentListings(data.items || []);
      } finally {
        setRecentLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const openPending = async () => {
    setPendingOpen(true);
    setPendingLoading(true);
    setPendingError(null);
    try {
      const res = await fetch(
        "/api/admin/users?status=pending&limit=50&page=1&sort=createdAt&order=desc"
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load pending users");
      }
      const data = await res.json();
      setPendingUsers(data.items || []);
    } catch (e) {
      setPendingError(e.message);
    } finally {
      setPendingLoading(false);
    }
  };

  const summary = [
    {
      label: "Total Users",
      value: metrics.users ?? "--",
      accent: "bg-indigo-100 text-indigo-700",
      note: "Count of all users",
    },
    {
      label: "Total Properties",
      value: metrics.listings ?? "--",
      accent: "bg-emerald-100 text-emerald-700",
      note: "All listings",
    },
    {
      label: "New Listings Today",
      value: metrics.listingsToday ?? "--",
      accent: "bg-amber-100 text-amber-700",
      note: "Since midnight",
    },
    {
      label: "Pending Approvals",
      value:
        pendingCount === null ? "…" : pendingCount === 0 ? "0" : pendingCount,
      accent: "bg-rose-100 text-rose-700",
      note: "Users awaiting review",
      action: openPending,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of platform activity</p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((s) => (
          <Card
            key={s.label}
            className={`relative overflow-hidden ${
              s.label === "Pending Approvals" && (pendingCount || 0) > 0
                ? "ring-1 ring-rose-200 bg-rose-50/40"
                : ""
            }`}
            onClick={() => s.action && s.action()}
          >
            <CardHeader className="pb-2">
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-3xl font-bold mt-2">
                {loading ? "…" : s.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div
                className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${s.accent}`}
              >
                {s.note}
              </div>
              {s.label === "Pending Approvals" && pendingCount > 0 && (
                <div className="mt-2 text-[10px] text-rose-600 font-medium">
                  Click to review
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="dark:bg-slate-950 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest property listings</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/properties")}
            className="text-xs"
          >
            View All →
          </Button>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Loading recent listings...
            </div>
          ) : recentListings.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No listings yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Image</TH>
                    <TH>Title</TH>
                    <TH>Type</TH>
                    <TH>Status</TH>
                    <TH>Created</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {recentListings.map((l) => (
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
                      <TD>
                        <Badge variant="outline" className="capitalize">
                          {l.type}
                        </Badge>
                      </TD>
                      <TD>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={l.isActive ? "success" : "outline"}
                            className="text-xs"
                          >
                            {l.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {l.offer && (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                              Offer
                            </Badge>
                          )}
                        </div>
                      </TD>
                      <TD className="text-sm text-slate-500">
                        {new Date(l.createdAt).toLocaleDateString()}
                      </TD>
                      <TD className="text-right">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => setSelectedProperty(l)}
                          className="text-xs"
                        >
                          View
                        </Button>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Users Section */}
      {pendingOpen && (
        <Card className="border-rose-200 bg-rose-50/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Pending Users</CardTitle>
                <CardDescription>
                  Accounts awaiting approval ({pendingCount ?? 0})
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="default"
                onClick={() => setPendingOpen(false)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {pendingLoading ? (
              <div className="text-sm text-slate-500 py-4">Loading…</div>
            ) : pendingError ? (
              <div className="text-sm text-red-600 py-2">{pendingError}</div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-sm text-slate-500 py-4">
                No pending users.
              </div>
            ) : (
              <div className="overflow-x-auto border rounded bg-white">
                <table className="w-full text-xs">
                  <thead className="bg-rose-100/70 text-rose-800">
                    <tr>
                      <th className="text-left font-medium px-2 py-1">User</th>
                      <th className="text-left font-medium px-2 py-1">Email</th>
                      <th className="text-left font-medium px-2 py-1">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((u) => (
                      <tr key={u._id} className="border-t">
                        <td className="px-2 py-1 font-medium">{u.username}</td>
                        <td className="px-2 py-1">{u.email}</td>
                        <td className="px-2 py-1">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pendingUsers.length >= 50 && (
                  <div className="text-[10px] px-2 py-1 bg-rose-50 text-rose-600">
                    Showing first 50
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="dark:bg-slate-950 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access key admin functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((q) => (
              <Button
                key={q.to}
                variant="outline"
                className="h-auto p-4 justify-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                onClick={() => navigate(q.to)}
              >
                <q.icon className="h-6 w-6 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="font-medium text-sm">{q.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {q.desc}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Details Modal */}
      <Dialog
        open={!!selectedProperty}
        onOpenChange={(o) => !o && setSelectedProperty(null)}
        title="Property Details"
        footer={
          <div className="w-full flex justify-between items-center">
            <div className="text-xs text-slate-400">
              ID: {selectedProperty?._id?.slice(0, 8)}… (full copied when
              clicked)
            </div>
            <Button variant="default" onClick={() => setSelectedProperty(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedProperty && (
          <div className="space-y-6 text-sm">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold tracking-tight">
                  {selectedProperty.name}
                </h2>
                <Badge
                  variant={selectedProperty.isActive ? "success" : "outline"}
                >
                  {selectedProperty.isActive ? "Active" : "Inactive"}
                </Badge>
                {selectedProperty.offer && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    Offer
                  </Badge>
                )}
                <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                  {selectedProperty.type}
                </Badge>
              </div>
              <div className="text-xs text-slate-500 flex gap-4 flex-wrap">
                <span>
                  Created:{" "}
                  {new Date(selectedProperty.createdAt).toLocaleString()}
                </span>
                {selectedProperty.updatedAt && (
                  <span>
                    Updated:{" "}
                    {new Date(selectedProperty.updatedAt).toLocaleString()}
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
                  ${selectedProperty.regularPrice?.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Discount Price
                </p>
                <p className="font-medium">
                  {selectedProperty.discountPrice
                    ? `$${selectedProperty.discountPrice.toLocaleString()}`
                    : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Offer
                </p>
                <p className="font-medium">
                  {selectedProperty.offer ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {/* Description */}
            {selectedProperty.description && (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Description
                </p>
                <p className="leading-relaxed text-slate-700 whitespace-pre-line">
                  {selectedProperty.description}
                </p>
              </div>
            )}

            {/* Images */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Images ({selectedProperty.imageUrls?.length || 0})
              </p>
              {(!selectedProperty.imageUrls ||
                selectedProperty.imageUrls.length === 0) && (
                <p className="text-xs text-slate-500">No images uploaded.</p>
              )}
              {selectedProperty.imageUrls?.length > 0 && (
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                  {selectedProperty.imageUrls.map((url, i) => (
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
              View full details and management options in the Properties
              section.
            </p>
          </div>
        )}
      </Dialog>

      {/* Footer removed as requested */}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { getListingStatusMeta } from "../../utils/listingStatus";
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
    desc: "Manage accounts: deactivate or inspect profiles.",
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
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    users: null,
    listings: null,
    listingsToday: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    const fetchRecent = async () => {
      try {
        setRecentLoading(true);
        const res = await fetch(
          "/api/admin/listings?limit=3&page=1&sort=createdAt&order=desc"
        );
        if (!res.ok) return;
        const data = await res.json();
        setRecentListings(data.items || []);
      } finally {
        setRecentLoading(false);
      }
    };

    fetchRecent();
  }, []);

  const summary = [
    {
      label: "Total Users",
      value: metrics.users ?? "--",
      accent: "bg-indigo-100/80 text-indigo-700",
      note: "Count of all users",
      icon: HiOutlineUsers,
    },
    {
      label: "Total Properties",
      value: metrics.listings ?? "--",
      accent: "bg-emerald-100/80 text-emerald-700",
      note: "All listings",
      icon: HiOutlineOfficeBuilding,
    },
    {
      label: "New Listings Today",
      value: metrics.listingsToday ?? "--",
      accent: "bg-amber-100/80 text-amber-700",
      note: "Since midnight",
      icon: HiOutlineChartBar,
    },
  ];

  const selectedPropertyStatus = selectedProperty
    ? getListingStatusMeta(selectedProperty)
    : null;
  const selectedPropertyStatusBadgeClass = [
    "rounded-full",
    selectedPropertyStatus?.badge?.className || "",
  ]
    .join(" ")
    .trim();

  const copyToClipboard = (value) => {
    if (!value) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-[1px]">
      <div className="absolute inset-0 translate-y-[-60%] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)]" />
      <div className="relative h-full w-full space-y-10 rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-emerald-50 via-white to-slate-100 p-6 sm:p-8 lg:p-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Dashboard
          </h1>
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-slate-400">
            Overview of platform activity
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summary.map((s) => {
            const Icon = s.icon;
            return (
              <Card
                key={s.label}
                className="group relative overflow-hidden border-none bg-white/80 shadow-lg shadow-emerald-100/40 transition hover:-translate-y-1 hover:shadow-xl"
                onClick={() => s.action?.()}
              >
                <div className="absolute inset-x-6 top-6 h-24 rounded-full bg-gradient-to-br from-emerald-100/60 via-white to-transparent blur-2xl" />
                <CardHeader className="relative z-10 pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardDescription className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                        {s.label}
                      </CardDescription>
                      <CardTitle className="mt-4 text-3xl font-bold text-slate-900">
                        {loading ? "…" : s.value}
                      </CardTitle>
                    </div>
                    {Icon && (
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-emerald-300 shadow-lg shadow-slate-900/40">
                        <Icon className="h-6 w-6" />
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${s.accent}`}
                  >
                    {s.note}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-none bg-white/80 shadow-xl shadow-emerald-100/50">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-100/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-900">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Latest property listings
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/properties")}
              className="rounded-full border-slate-200 px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600"
            >
              View All →
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {recentLoading ? (
              <div className="py-10 text-center text-sm font-medium text-slate-500">
                Loading recent listings...
              </div>
            ) : recentListings.length === 0 ? (
              <div className="py-10 text-center text-sm font-medium text-slate-500">
                No listings yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-inner shadow-emerald-50">
                <div className="overflow-x-auto">
                  <Table>
                    <THead>
                      <TR className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                        <TH>Image</TH>
                        <TH>Title</TH>
                        <TH>Type</TH>
                        <TH>Status</TH>
                        <TH>Created</TH>
                        <TH className="text-right">Actions</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {recentListings.map((l) => {
                        const { label, badge } = getListingStatusMeta(l);
                        const badgeClassName = [
                          "text-xs capitalize",
                          badge?.className || "",
                        ]
                          .join(" ")
                          .trim();

                        return (
                          <TR
                            key={l._id}
                            className="group border-t border-slate-100/80"
                          >
                            <TD>
                              <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                {l.imageUrls?.[0] && (
                                  <img
                                    src={l.imageUrls[0]}
                                    alt={l.name}
                                    className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                  />
                                )}
                              </div>
                            </TD>
                            <TD className="max-w-[220px] truncate font-medium text-slate-700">
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
                                  variant={badge?.variant || "outline"}
                                  className={badgeClassName || undefined}
                                >
                                  {label}
                                </Badge>
                                {l.offer && (
                                  <Badge className="bg-amber-100 text-amber-700 text-xs">
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
                                className="rounded-full px-4 text-xs font-semibold"
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
            )}
          </CardContent>
        </Card>

        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="px-0">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Quick Actions
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Access key admin functions
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((q) => (
                <button
                  key={q.to}
                  type="button"
                  onClick={() => navigate(q.to)}
                  className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/80 p-5 text-left shadow-lg shadow-emerald-100/40 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow">
                    <q.icon className="h-5 w-5" />
                  </span>
                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-semibold text-slate-900">
                      {q.label}
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-2">
                      {q.desc}
                    </div>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500 group-hover:text-emerald-600">
                    Open
                    <span aria-hidden="true">↗</span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Dialog
          open={!!selectedProperty}
          onOpenChange={(o) => !o && setSelectedProperty(null)}
          title={selectedProperty?.name || "Listing details"}
          footer={
            <div className="flex w-full items-center justify-between">
              <div className="text-xs text-slate-400">
                ID: {selectedProperty?._id ?? "—"}
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setSelectedProperty(null)}
              >
                Close
              </Button>
            </div>
          }
        >
          {selectedProperty && (
            <div className="space-y-6 text-sm">
              <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      selectedPropertyStatus?.badge?.variant || "outline"
                    }
                    className={selectedPropertyStatusBadgeClass || undefined}
                  >
                    {selectedPropertyStatus?.label || "Inactive"}
                  </Badge>
                  <Badge className="rounded-full bg-slate-200/70 text-slate-700">
                    {selectedProperty.type}
                  </Badge>
                  {selectedProperty.offer && (
                    <Badge className="rounded-full bg-amber-100 text-amber-700">
                      Offer available
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Created{" "}
                  {new Date(selectedProperty.createdAt).toLocaleString()}
                  {selectedProperty.updatedAt
                    ? ` • Updated ${new Date(
                        selectedProperty.updatedAt
                      ).toLocaleString()}`
                    : ""}
                </p>
              </section>

              <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 sm:grid-cols-2">
                {[
                  {
                    label: "Regular Price",
                    value: currencyFormatter.format(
                      selectedProperty.regularPrice || 0
                    ),
                  },
                  {
                    label: "Discount Price",
                    value: selectedProperty.discountPrice
                      ? currencyFormatter.format(selectedProperty.discountPrice)
                      : "Not set",
                  },
                  { label: "Bedrooms", value: selectedProperty.bedrooms },
                  { label: "Bathrooms", value: selectedProperty.bathrooms },
                  {
                    label: "Parking",
                    value: selectedProperty.parking ? "Yes" : "No",
                  },
                  {
                    label: "Furnished",
                    value: selectedProperty.furnished ? "Yes" : "No",
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
                    onClick={() => copyToClipboard(selectedProperty.userRef)}
                    className="inline-flex items-center gap-2 font-mono text-xs text-indigo-600 hover:underline"
                  >
                    {selectedProperty.userRef}
                  </button>
                </div>
              </section>

              {selectedProperty.description && (
                <section className="space-y-2 rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Description
                  </p>
                  <p className="leading-relaxed text-slate-700">
                    {selectedProperty.description}
                  </p>
                </section>
              )}

              <section className="space-y-2 rounded-2xl border border-slate-200 bg-white px-5 py-5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Media Gallery
                  </p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                    {selectedProperty.imageUrls?.length || 0} item(s)
                  </span>
                </div>
                {selectedProperty.imageUrls?.length ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {selectedProperty.imageUrls.map((url, index) => (
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
      </div>
    </div>
  );
}

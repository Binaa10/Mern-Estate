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

const quickLinks = [
  {
    label: "Analytics",
    to: "/admin/analytics",
    desc: "Traffic, growth trends, and KPI charts (mock data).",
  },
  {
    label: "Users",
    to: "/admin/users",
    desc: "Manage accounts: approve, deactivate, inspect profiles.",
  },
  {
    label: "Properties",
    to: "/admin/properties",
    desc: "Review and moderate listed properties with status controls.",
  },
  {
    label: "Profile",
    to: "/admin/profile",
    desc: "Update your admin account details and password.",
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

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/metrics");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to fetch metrics");
        }
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        setError(err.message);
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
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest 3 property listings</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
          {recentLoading && (
            <p className="text-slate-500 text-xs">Loading recent listings…</p>
          )}
          {!recentLoading && recentListings.length === 0 && (
            <p className="text-slate-500 text-xs">No listings yet.</p>
          )}
          <ul className="space-y-3">
            {recentListings.map((l) => (
              <li
                key={l._id}
                className="flex items-start gap-3 p-2 rounded-md border dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer"
                onClick={() => navigate("/admin/properties")}
              >
                <div className="h-12 w-16 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  {l.imageUrls?.[0] && (
                    <img
                      src={l.imageUrls[0]}
                      alt={l.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 dark:text-slate-200 truncate">
                    {l.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {l.description?.slice(0, 120) || "No description"}
                  </p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge
                      variant={l.isActive ? "success" : "outline"}
                      className="text-[10px]"
                    >
                      {l.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {l.offer && (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                        Offer
                      </Badge>
                    )}
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-[10px]">
                      {l.type}
                    </Badge>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap pl-2">
                  {new Date(l.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
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
                variant="outline"
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

      {/* Quick Links Sections */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((q) => (
          <Card
            key={q.to}
            className="cursor-pointer group hover:shadow-md transition dark:bg-slate-950 dark:border-slate-800"
            onClick={() => navigate(q.to)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-slate-400 group-hover:bg-indigo-500 transition" />
                {q.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {q.desc}
              <div className="mt-2 text-indigo-600 dark:text-indigo-400 font-medium text-[11px]">
                Open →
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer removed as requested */}
    </div>
  );
}

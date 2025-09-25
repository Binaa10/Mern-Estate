import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

const actions = [
  { label: "Analytics", to: "/admin/analytics" },
  { label: "Users", to: "/admin/users" },
  { label: "Properties", to: "/admin/properties" },
  { label: "Profile", to: "/admin/profile" },
];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    users: null,
    listings: null,
    listingsToday: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  }, []);

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
      value: "--",
      accent: "bg-pink-100 text-pink-700",
      note: "Future feature",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of platform activity
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {actions.map((a) => (
            <Button key={a.to} asChild variant="outline" className="">
              <Link to={a.to}>{a.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label} className="relative overflow-hidden">
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest notable system events (mock)</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-500 space-y-2">
          <p>No recent activity yet.</p>
          <p className="text-xs">(Integrate with audit trail later)</p>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  HiOutlineUsers,
  HiOutlineOfficeBuilding,
  HiOutlineUserAdd,
  HiOutlineOfficeBuilding as HiOutlineBuildingAdd,
} from "react-icons/hi";

const MONTHS_TO_SHOW = 6;
const formatNumber = new Intl.NumberFormat();

const buildMonthlySeries = (items, dateKey, valueGetter, options = {}) => {
  const { months = MONTHS_TO_SHOW, startDate = null, endDate = null } = options;

  const parseBoundary = (value, endOfDay = false) => {
    if (!value) return null;
    const parsed = value instanceof Date ? new Date(value) : new Date(value);
    if (Number.isNaN(parsed.valueOf())) return null;
    parsed.setHours(
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0
    );
    return parsed;
  };

  const rangeStart = parseBoundary(startDate, false);
  const rangeEnd = parseBoundary(endDate, true);

  const anchorEnd = rangeEnd ? new Date(rangeEnd) : new Date();
  const endMonth = new Date(anchorEnd.getFullYear(), anchorEnd.getMonth(), 1);

  let startMonth = rangeStart
    ? new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1)
    : new Date(endMonth.getFullYear(), endMonth.getMonth() - (months - 1), 1);

  let totalMonths =
    (endMonth.getFullYear() - startMonth.getFullYear()) * 12 +
    (endMonth.getMonth() - startMonth.getMonth()) +
    1;

  if (!Number.isFinite(totalMonths) || totalMonths < months) {
    totalMonths = months;
    startMonth = new Date(
      endMonth.getFullYear(),
      endMonth.getMonth() - (months - 1),
      1
    );
  }

  const buckets = new Map();
  const labels = [];

  for (let i = totalMonths - 1; i >= 0; i -= 1) {
    const base = new Date(endMonth.getFullYear(), endMonth.getMonth() - i, 1);
    const key = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    labels.push({
      key,
      label: base.toLocaleString("default", { month: "short" }),
    });
    buckets.set(key, 0);
  }

  items.forEach((item) => {
    const rawDate = item?.[dateKey];
    if (!rawDate) return;
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.valueOf())) return;
    if (rangeStart && parsed < rangeStart) return;
    if (rangeEnd && parsed > rangeEnd) return;
    const bucketKey = `${parsed.getFullYear()}-${String(
      parsed.getMonth() + 1
    ).padStart(2, "0")}`;
    if (!buckets.has(bucketKey)) return;
    const current = buckets.get(bucketKey) || 0;
    buckets.set(bucketKey, current + (valueGetter(item, parsed) || 0));
  });

  return labels.map(({ key, label }) => ({
    month: label,
    value: buckets.get(key) || 0,
  }));
};

export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalUsers: null,
    totalProperties: null,
    newUsers7d: null,
    newProperties7d: null,
  });
  const [userItems, setUserItems] = useState([]);
  const [listingItems, setListingItems] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [appliedRange, setAppliedRange] = useState({ start: null, end: null });
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [filterError, setFilterError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filterItemsByRange = useCallback((items, dateKey, range) => {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    const hasStart = Boolean(range?.start);
    const hasEnd = Boolean(range?.end);
    if (!hasStart && !hasEnd) {
      return items.slice();
    }

    const start = hasStart ? new Date(range.start) : null;
    const end = hasEnd ? new Date(range.end) : null;

    return items.filter((item) => {
      const rawDate = item?.[dateKey];
      if (!rawDate) return false;
      const parsed = new Date(rawDate);
      if (Number.isNaN(parsed.valueOf())) return false;
      if (start && parsed < start) return false;
      if (end && parsed > end) return false;
      return true;
    });
  }, []);

  useEffect(() => {
    let active = true;

    const parseJsonBody = async (response, context) => {
      const raw = await response.text();
      if (!response.ok) {
        let message;
        try {
          message = raw ? JSON.parse(raw).message : undefined;
        } catch (err) {
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
      } catch (err) {
        throw new Error(`Invalid JSON received for ${context}`);
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [usersRes, listingsRes] = await Promise.all([
          fetch("/api/admin/users?limit=500&page=1&sort=createdAt&order=desc", {
            credentials: "include",
            headers: { Accept: "application/json" },
          }),
          fetch(
            "/api/admin/listings?limit=500&page=1&sort=createdAt&order=desc",
            {
              credentials: "include",
              headers: { Accept: "application/json" },
            }
          ),
        ]);

        const [usersData, listingsData] = await Promise.all([
          parseJsonBody(usersRes, "users"),
          parseJsonBody(listingsRes, "listings"),
        ]);

        if (!active) return;

        const users = Array.isArray(usersData.items) ? usersData.items : [];
        const listings = Array.isArray(listingsData.items)
          ? listingsData.items
          : [];

        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);

        const newUsers7d = users.filter((user) => {
          if (!user?.createdAt) return false;
          const created = new Date(user.createdAt);
          return !Number.isNaN(created.valueOf()) && created >= sevenDaysAgo;
        }).length;

        const newProperties7d = listings.filter((listing) => {
          if (!listing?.createdAt) return false;
          const created = new Date(listing.createdAt);
          return !Number.isNaN(created.valueOf()) && created >= sevenDaysAgo;
        }).length;

        setMetrics({
          totalUsers:
            typeof usersData.total === "number"
              ? usersData.total
              : users.length,
          totalProperties:
            typeof listingsData.total === "number"
              ? listingsData.total
              : listings.length,
          newUsers7d,
          newProperties7d,
        });

        setUserItems(users);
        setListingItems(listings);
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load analytics data");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const range = isFilterActive ? appliedRange : { start: null, end: null };
    const nextUsers = filterItemsByRange(userItems, "createdAt", range);
    const nextListings = filterItemsByRange(listingItems, "createdAt", range);
    setFilteredUsers(nextUsers);
    setFilteredListings(nextListings);
  }, [
    userItems,
    listingItems,
    appliedRange,
    isFilterActive,
    filterItemsByRange,
  ]);

  const handleApplyFilters = useCallback(
    (event) => {
      event?.preventDefault?.();
      if (loading) return;

      const hasStart = Boolean(startDate);
      const hasEnd = Boolean(endDate);

      const parseInputDate = (value, endOfDay = false) => {
        if (!value) return null;
        const parsed = new Date(value);
        if (Number.isNaN(parsed.valueOf())) return null;
        if (endOfDay) {
          parsed.setHours(23, 59, 59, 999);
        } else {
          parsed.setHours(0, 0, 0, 0);
        }
        return parsed;
      };

      const start = hasStart ? parseInputDate(startDate, false) : null;
      const end = hasEnd ? parseInputDate(endDate, true) : null;

      if (hasStart && !start) {
        setFilterError("Please provide a valid start date.");
        return;
      }
      if (hasEnd && !end) {
        setFilterError("Please provide a valid end date.");
        return;
      }
      if (start && end && start > end) {
        setFilterError("Start date must be before the end date.");
        return;
      }

      if (!start && !end) {
        setAppliedRange({ start: null, end: null });
        setIsFilterActive(false);
        setFilterError(null);
        return;
      }

      const range = { start, end };
      const nextUsers = filterItemsByRange(userItems, "createdAt", range);
      const nextListings = filterItemsByRange(listingItems, "createdAt", range);

      setAppliedRange(range);
      setIsFilterActive(true);
      setFilterError(null);
      setFilteredUsers(nextUsers);
      setFilteredListings(nextListings);
    },
    [endDate, filterItemsByRange, listingItems, loading, startDate, userItems]
  );

  const displayMetrics = useMemo(() => {
    if (!isFilterActive) {
      return metrics;
    }

    const referenceEnd = appliedRange.end
      ? new Date(appliedRange.end)
      : new Date();
    referenceEnd.setHours(23, 59, 59, 999);
    const windowStart = new Date(referenceEnd);
    windowStart.setDate(windowStart.getDate() - 6);
    windowStart.setHours(0, 0, 0, 0);

    const countRecent = (items) =>
      items.filter((item) => {
        const rawDate = item?.createdAt;
        if (!rawDate) return false;
        const parsed = new Date(rawDate);
        if (Number.isNaN(parsed.valueOf())) return false;
        return parsed >= windowStart && parsed <= referenceEnd;
      }).length;

    return {
      totalUsers: filteredUsers.length,
      totalProperties: filteredListings.length,
      newUsers7d: countRecent(filteredUsers),
      newProperties7d: countRecent(filteredListings),
    };
  }, [
    appliedRange.end,
    filteredListings,
    filteredUsers,
    isFilterActive,
    metrics,
  ]);

  const monthlyOptions = useMemo(
    () =>
      appliedRange.start || appliedRange.end
        ? { startDate: appliedRange.start, endDate: appliedRange.end }
        : {},
    [appliedRange.end, appliedRange.start]
  );

  const userGrowthData = useMemo(() => {
    const series = buildMonthlySeries(
      filteredUsers,
      "createdAt",
      () => 1,
      monthlyOptions
    );
    return series.map((entry) => ({
      month: entry.month,
      users: entry.value,
    }));
  }, [filteredUsers, monthlyOptions]);

  const propertyTrendData = useMemo(() => {
    const series = buildMonthlySeries(
      filteredListings,
      "createdAt",
      () => 1,
      monthlyOptions
    );
    return series.map((entry) => ({
      month: entry.month,
      properties: entry.value,
    }));
  }, [filteredListings, monthlyOptions]);

  const revenueData = useMemo(() => {
    const series = buildMonthlySeries(
      filteredListings,
      "createdAt",
      (item) => {
        const value = item?.offer ? item.discountPrice : item?.regularPrice;
        return typeof value === "number" && Number.isFinite(value) ? value : 0;
      },
      monthlyOptions
    );
    return series.map((entry) => ({
      month: entry.month,
      revenue: entry.value,
    }));
  }, [filteredListings, monthlyOptions]);

  const propertyTypeData = useMemo(() => {
    if (!filteredListings.length) {
      return [
        { name: "Sale", value: 0, color: "#6366f1" },
        { name: "Rent", value: 0, color: "#22c55e" },
      ];
    }

    const counts = filteredListings.reduce(
      (acc, listing) => {
        const type = String(listing?.type || "").toLowerCase();
        if (type === "sale") acc.sale += 1;
        else if (type === "rent") acc.rent += 1;
        else acc.other += 1;
        return acc;
      },
      { sale: 0, rent: 0, other: 0 }
    );

    const data = [
      { name: "Sale", value: counts.sale, color: "#6366f1" },
      { name: "Rent", value: counts.rent, color: "#22c55e" },
    ];

    if (counts.other > 0) {
      data.push({ name: "Other", value: counts.other, color: "#f97316" });
    }

    return data;
  }, [filteredListings]);

  const metricsConfig = useMemo(() => {
    const values = displayMetrics || {};
    const totalNote = isFilterActive ? "Within selected range" : "All time";
    const recentNote = isFilterActive ? "Last 7 days in range" : "Last 7 days";

    return [
      {
        label: "Total Users",
        value: values.totalUsers,
        note: totalNote,
        icon: HiOutlineUsers,
        accent: "from-indigo-500/20 to-indigo-100/40 text-indigo-600",
      },
      {
        label: "Total Properties",
        value: values.totalProperties,
        note: totalNote,
        icon: HiOutlineOfficeBuilding,
        accent: "from-emerald-500/20 to-emerald-100/40 text-emerald-600",
      },
      {
        label: "New Users (7d)",
        value: values.newUsers7d,
        note: recentNote,
        icon: HiOutlineUserAdd,
        accent: "from-sky-500/20 to-sky-100/40 text-sky-600",
      },
      {
        label: "New Properties (7d)",
        value: values.newProperties7d,
        note: recentNote,
        icon: HiOutlineBuildingAdd,
        accent: "from-amber-500/20 to-amber-100/40 text-amber-600",
      },
    ];
  }, [displayMetrics, isFilterActive]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-[1px]">
      <div className="absolute inset-0 translate-y-[-55%] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_60%)]" />
      <div className="relative h-full w-full space-y-10 rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Analytics
            </h1>
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-slate-400">
              Key performance indicators and trends
            </p>
          </div>
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
              {error}
            </div>
          )}
        </div>

        <Card className="border-none bg-white/85 shadow-xl shadow-indigo-100/40">
          <CardHeader className="pb-5">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Filters
            </CardTitle>
            <CardDescription>Adjust date range and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleApplyFilters}
              className="grid gap-4 md:grid-cols-3"
            >
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="rounded-2xl border-slate-200 bg-white/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="rounded-2xl border-slate-200 bg-white/80"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Apply Filters
                </Button>
              </div>
            </form>
            {filterError && (
              <p className="mt-3 text-sm font-semibold text-rose-600">
                {filterError}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricsConfig.map((metric) => {
            const Icon = metric.icon;
            const valueDisplay =
              metric.value === null || typeof metric.value === "undefined"
                ? loading
                  ? "…"
                  : "--"
                : formatNumber.format(metric.value);
            return (
              <Card
                key={metric.label}
                className="relative overflow-hidden border-none bg-white/90 shadow-lg shadow-indigo-100/40 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${metric.accent} opacity-40`}
                />
                <div className="absolute inset-x-6 top-6 h-24 rounded-full bg-white/40 blur-2xl" />
                <CardHeader className="relative z-10 pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardDescription className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                        {metric.label}
                      </CardDescription>
                      <CardTitle className="mt-4 text-3xl font-bold text-slate-900">
                        {valueDisplay}
                      </CardTitle>
                    </div>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/30">
                      <Icon className="h-6 w-6" />
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-600">
                    {metric.note}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          <Card className="border-none bg-white/90 shadow-xl shadow-indigo-100/60">
            <CardHeader className="border-b border-slate-100/80 pb-6">
              <CardTitle className="text-xl font-semibold text-slate-900">
                User Growth
              </CardTitle>
              <CardDescription>
                Monthly user registration trends
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#6366f1" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/90 shadow-xl shadow-indigo-100/60">
            <CardHeader className="border-b border-slate-100/80 pb-6">
              <CardTitle className="text-xl font-semibold text-slate-900">
                Property Listings Trend
              </CardTitle>
              <CardDescription>
                Monthly property listing activity
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={propertyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} />
                  <Bar
                    dataKey="properties"
                    fill="#22c55e"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/90 shadow-xl shadow-indigo-100/60">
            <CardHeader className="border-b border-slate-100/80 pb-6">
              <CardTitle className="text-xl font-semibold text-slate-900">
                Revenue Analytics
              </CardTitle>
              <CardDescription>
                Monthly potential revenue from listings
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `$${formatNumber.format(value)}`,
                      "Potential Revenue",
                    ]}
                    cursor={{ stroke: "#f59e0b", strokeDasharray: "4 4" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#f59e0b" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/90 shadow-xl shadow-indigo-100/60">
            <CardHeader className="border-b border-slate-100/80 pb-6">
              <CardTitle className="text-xl font-semibold text-slate-900">
                Property Types
              </CardTitle>
              <CardDescription>
                Distribution of sale vs rent listings
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={90}
                    dataKey="value"
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${formatNumber.format(value)}`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

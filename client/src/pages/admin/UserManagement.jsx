import React, { useState, useEffect, useCallback } from "react";
import { Table, THead, TBody, TR, TH, TD } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Dialog } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";

const statusTabs = [
  { value: "all", label: "All" },
  { value: "approved", label: "Active" },
  { value: "deactivated", label: "Inactive" },
];

const statusMetaMap = {
  approved: {
    label: "Active",
    variant: "success",
  },
  deactivated: {
    label: "Inactive",
    variant: "outline",
  },
};

const formatNumber = new Intl.NumberFormat();

const getStatusMeta = (status) =>
  statusMetaMap[status] || {
    label: status,
    variant: "outline",
  };

const normalizeStatus = (status) =>
  status === "pending" ? "approved" : status;

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm, setConfirm] = useState({
    open: false,
    user: null,
    nextStatus: null,
    title: "",
    description: "",
  });
  const [userListings, setUserListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingStats, setListingStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      setSummaryError(null);
      const res = await fetch("/api/admin/users/summary", {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load summary");
      }
      const data = await res.json();
      setSummary({
        total: Number.isFinite(data?.total) ? data.total : 0,
        active: Number.isFinite(data?.active) ? data.active : 0,
        inactive: Number.isFinite(data?.inactive) ? data.inactive : 0,
      });
    } catch (err) {
      setSummary(null);
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    const fetchUserListings = async () => {
      if (!selectedUser) return;
      try {
        setListingsLoading(true);
        setUserListings([]);
        setListingStats(null);
        const params = new URLSearchParams({
          userId: selectedUser._id,
          limit: "100",
          page: "1",
          sort: "createdAt",
          order: "desc",
        });
        const res = await fetch(`/api/admin/listings?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch user listings");
        const data = await res.json();
        const items = data.items || [];
        setUserListings(items);
        const total = data.total ?? items.length;
        const active = items.filter((listing) => listing.isActive).length;
        const inactive = total - active;
        const offers = items.filter((listing) => listing.offer).length;
        const sale = items.filter((listing) => listing.type === "sale").length;
        const rent = items.filter((listing) => listing.type === "rent").length;
        setListingStats({ total, active, inactive, offers, sale, rent });
      } catch (err) {
        setListingStats({ error: err.message });
      } finally {
        setListingsLoading(false);
      }
    };
    fetchUserListings();
  }, [selectedUser]);

  const onSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const openConfirm = (user, nextStatus) => {
    const copy = {
      approved: {
        title: "Activate User",
        description: `Activate ${user.username}'s account so they can access the platform immediately.`,
      },
      deactivated: {
        title: "Deactivate User",
        description: `Deactivate ${user.username}'s account and prevent new sign-ins until it is activated again.`,
      },
    };
    setConfirm({
      open: true,
      user,
      nextStatus,
      title: copy[nextStatus].title,
      description: copy[nextStatus].description,
    });
  };

  const closeConfirm = () =>
    setConfirm({
      open: false,
      user: null,
      nextStatus: null,
      title: "",
      description: "",
    });

  const performStatusChange = async () => {
    if (!confirm.user) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/users/${confirm.user._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: confirm.nextStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update status");
      }
      closeConfirm();
      await fetchUsers();
      await fetchSummary();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const selectedStatusMeta = selectedUser
    ? getStatusMeta(normalizeStatus(selectedUser.status))
    : null;

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-[1px]">
        <div className="absolute inset-0 translate-y-[-55%] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_60%)]" />
        <div className="relative h-full w-full space-y-10 rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              User Management
            </h1>
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-slate-400">
              Search and manage platform accounts
            </p>
            {summaryError && (
              <div className="mt-2 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
                {summaryError}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {summaryLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Card
                    key={index}
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
                    label: "Total Users",
                    value: summary?.total ?? 0,
                    note: "All accounts",
                    accent:
                      "from-indigo-500/20 to-indigo-100/40 text-indigo-600",
                  },
                  {
                    label: "Active Users",
                    value: summary?.active ?? 0,
                    note: "Currently activated",
                    accent:
                      "from-emerald-500/20 to-emerald-100/40 text-emerald-600",
                  },
                  {
                    label: "Inactive Users",
                    value: summary?.inactive ?? 0,
                    note: "Access disabled",
                    accent: "from-rose-500/20 to-rose-100/40 text-rose-600",
                  },
                ].map((metric) => (
                  <Card
                    key={metric.label}
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
                        {formatNumber.format(metric.value)}
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

          <Card className="border-none bg-white/90 shadow-xl shadow-slate-200/70">
            <CardHeader className="flex flex-col gap-4 border-b border-slate-100/70 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Users
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Displaying live user data from the database
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setStatusFilter("all");
                  setPage(1);
                }}
                className="rounded-full border-slate-200 px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
              >
                Reset Filters
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {statusTabs.map((tab) => (
                    <Button
                      key={tab.value}
                      type="button"
                      variant={
                        statusFilter === tab.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setStatusFilter(tab.value);
                        setPage(1);
                      }}
                      className={`rounded-full px-4 text-xs font-semibold transition ${
                        statusFilter === tab.value
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
                <form
                  onSubmit={onSearchSubmit}
                  className="flex w-full gap-2 lg:w-auto"
                >
                  <Input
                    type="text"
                    placeholder="Search username or email"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="rounded-2xl border-slate-200 bg-white/80"
                  />
                  <Button
                    type="submit"
                    variant="default"
                    className="rounded-2xl bg-slate-900 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    Search
                  </Button>
                </form>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="py-12 text-center text-sm font-medium text-slate-500">
                  Loading users...
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-inner shadow-slate-200/60">
                  <div className="overflow-x-auto">
                    <Table>
                      <THead>
                        <TR className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                          <TH className="py-4">Username</TH>
                          <TH>Email</TH>
                          <TH>Status</TH>
                          <TH>Role</TH>
                          <TH className="text-right">Actions</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {users.length === 0 && (
                          <TR>
                            <TD
                              colSpan={5}
                              className="py-10 text-center text-sm font-medium text-slate-500"
                            >
                              No users found.
                            </TD>
                          </TR>
                        )}
                        {users.map((user) => {
                          const effectiveStatus = normalizeStatus(user.status);
                          const statusMeta = getStatusMeta(effectiveStatus);
                          return (
                            <TR
                              key={user._id}
                              className="border-t border-slate-100/80"
                            >
                              <TD className="py-4 font-medium text-slate-800">
                                {user.username}
                              </TD>
                              <TD className="text-sm text-slate-500">
                                {user.email}
                              </TD>
                              <TD>
                                <Badge variant={statusMeta.variant}>
                                  {statusMeta.label}
                                </Badge>
                              </TD>
                              <TD>
                                <Badge
                                  variant={user.isAdmin ? "success" : "outline"}
                                >
                                  {user.isAdmin ? "Admin" : "Member"}
                                </Badge>
                              </TD>
                              <TD>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setSelectedUser(user)}
                                    className="rounded-full px-4 text-xs font-semibold"
                                  >
                                    View Profile
                                  </Button>
                                  {effectiveStatus !== "approved" && (
                                    <Button
                                      size="sm"
                                      variant="success"
                                      className="rounded-full px-4 text-xs font-semibold"
                                      onClick={() =>
                                        openConfirm(user, "approved")
                                      }
                                    >
                                      Activate
                                    </Button>
                                  )}
                                  {effectiveStatus === "approved" && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="rounded-full px-4 text-xs font-semibold"
                                      onClick={() =>
                                        openConfirm(user, "deactivated")
                                      }
                                    >
                                      Deactivate
                                    </Button>
                                  )}
                                </div>
                              </TD>
                            </TR>
                          );
                        })}
                      </TBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="rounded-full border-slate-200 px-4 text-xs font-semibold"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="rounded-full border-slate-200 px-4 text-xs font-semibold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        title="User Profile"
        footer={
          <div className="flex w-full items-center justify-between">
            <div className="text-xs font-medium text-slate-400">
              ID: {selectedUser?._id?.slice(0, 8)}…
            </div>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedUser && selectedStatusMeta && (
          <div className="space-y-8 text-sm text-slate-600">
            <section className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-slate-100/80 p-6 shadow-lg shadow-slate-200/70">
              <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-indigo-200/20 blur-3xl" />
              <div className="absolute -bottom-32 left-6 h-64 w-64 rounded-full bg-emerald-200/20 blur-3xl" />
              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative flex h-24 w-24 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/40 to-indigo-200/20 blur-xl" />
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-[3px] border-white shadow-lg shadow-slate-300/60 ring-4 ring-white/70">
                      <img
                        src={
                          selectedUser.avatar ||
                          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                        }
                        alt={selectedUser.username}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src =
                            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        {selectedUser.username}
                      </h2>
                      <Badge variant={selectedStatusMeta.variant}>
                        {selectedStatusMeta.label}
                      </Badge>
                      {selectedUser.isAdmin && (
                        <Badge className="border-indigo-200 bg-indigo-100 text-indigo-700">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>
                        Created:{" "}
                        {new Date(selectedUser.createdAt).toLocaleString()}
                      </span>
                      {selectedUser.updatedAt && (
                        <span>
                          Updated:{" "}
                          {new Date(selectedUser.updatedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid w-full gap-4 text-xs md:w-auto md:grid-cols-2">
                  <div className="flex flex-col gap-1 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                    <p className="font-semibold text-slate-400">Membership</p>
                    <div className="flex items-center gap-2 text-slate-800">
                      <span className="text-sm font-semibold capitalize">
                        {selectedUser.isAdmin ? "Administrator" : "Member"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Assigned automatically based on account privileges.
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                    <p className="font-semibold text-slate-400">Status</p>
                    <div className="flex items-center gap-2 text-slate-800">
                      <Badge variant={selectedStatusMeta.variant}>
                        {selectedStatusMeta.label}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Users with inactive status can’t sign in until reenabled.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm shadow-slate-200/60">
                <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Contact
                </h3>
                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-slate-500">Email</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-slate-800 break-all">
                        {selectedUser.email}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(selectedUser.email)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-slate-500">ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-700 break-all">
                        {selectedUser._id}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(selectedUser._id)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm shadow-slate-200/60">
                <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Account Insights
                </h3>
                <div className="mt-4 grid gap-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                    <span className="font-medium text-slate-500">
                      Email Verified
                    </span>
                    <Badge
                      variant={
                        selectedUser.emailVerified ? "success" : "outline"
                      }
                    >
                      {selectedUser.emailVerified ? "Yes" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                    <span className="font-medium text-slate-500">
                      Two-factor
                    </span>
                    <Badge
                      variant={
                        selectedUser.twoFactorEnabled ? "success" : "outline"
                      }
                    >
                      {selectedUser.twoFactorEnabled ? "Enabled" : "Not set"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Security fields default to “Not set” if the account hasn’t
                    configured them yet.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Listing Summary
                  </p>
                  <p className="text-xs text-slate-400">
                    Metrics aggregated from the most recent records.
                  </p>
                </div>
                {listingsLoading && (
                  <span className="text-xs text-slate-400">Refreshing…</span>
                )}
              </div>
              {listingsLoading ? (
                <div className="text-xs text-slate-500">Loading listings…</div>
              ) : listingStats?.error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs font-medium text-rose-600">
                  {listingStats.error}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                  {[
                    { key: "total", label: "Total" },
                    { key: "active", label: "Active" },
                    { key: "inactive", label: "Inactive" },
                    { key: "offers", label: "Offers" },
                    { key: "sale", label: "Sale" },
                    { key: "rent", label: "Rent" },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className="relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-slate-900/5 via-white to-slate-50 p-3 shadow-sm"
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                        {label}
                      </div>
                      <div className="mt-2 text-xl font-bold text-slate-900">
                        {listingStats?.[key] ?? 0}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-slate-400">
                Counts are limited to the first 100 listings for performance
                considerations.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Recent Listings
                </p>
                {!listingsLoading && userListings.length > 5 && (
                  <span className="text-[11px] text-slate-400">
                    Showing 5 of {userListings.length}
                  </span>
                )}
              </div>
              {listingsLoading ? (
                <div className="text-xs text-slate-500">Loading…</div>
              ) : userListings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-xs text-slate-500">
                  No listings created by this user yet.
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-inner">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-900/5 text-slate-600">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider">
                          Active
                        </th>
                        <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {userListings.slice(0, 5).map((listing) => (
                        <tr
                          key={listing._id}
                          className="border-t border-slate-100/70"
                        >
                          <td className="max-w-[180px] truncate px-3 py-2 font-medium text-slate-800">
                            {listing.name}
                          </td>
                          <td className="px-3 py-2 capitalize text-slate-600">
                            {listing.type}
                          </td>
                          <td className="px-3 py-2">
                            <Badge
                              variant={listing.isActive ? "success" : "outline"}
                            >
                              {listing.isActive ? "Yes" : "No"}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-slate-500">
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {userListings.length > 5 && (
                    <div className="bg-slate-900/5 px-3 py-2 text-[11px] text-slate-500">
                      + {userListings.length - 5} more listings not shown in
                      this preview.
                    </div>
                  )}
                </div>
              )}
            </section>

            <p className="text-[11px] text-slate-400">
              Profile data is read-only. Administrative actions and notes will
              surface here in future iterations.
            </p>
          </div>
        )}
      </Dialog>

      {confirm.open && (
        <Dialog
          open={confirm.open}
          onOpenChange={(open) => !open && closeConfirm()}
          title={confirm.title}
          footer={
            <>
              <Button
                variant="outline"
                disabled={actionLoading}
                onClick={closeConfirm}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                disabled={actionLoading}
                onClick={performStatusChange}
              >
                {actionLoading ? "Working..." : "Confirm"}
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-600">{confirm.description}</p>
        </Dialog>
      )}
    </>
  );
}

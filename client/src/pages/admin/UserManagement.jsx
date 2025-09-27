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
import { Select } from "../../components/ui/select";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adminFilter, setAdminFilter] = useState("all");
  const [activationFilter, setActivationFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
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
  // Enhanced profile dialog data
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
      const endpoints = [
        "/api/admin/users?page=1&limit=1",
        "/api/admin/users?status=approved&page=1&limit=1",
        "/api/admin/users?status=pending&page=1&limit=1",
        "/api/admin/users?status=deactivated&page=1&limit=1",
      ];
      const responses = await Promise.all(endpoints.map((url) => fetch(url)));
      const datasets = await Promise.all(
        responses.map(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || "Failed to load summary");
          }
          return res.json();
        })
      );
      const [allData, approvedData, pendingData, deactivatedData] = datasets;
      const getTotal = (data) =>
        typeof data?.total === "number"
          ? data.total
          : Array.isArray(data?.items)
          ? data.items.length
          : 0;
      setSummary({
        total: getTotal(allData),
        approved: getTotal(approvedData),
        pending: getTotal(pendingData),
        deactivated: getTotal(deactivatedData),
      });
    } catch (err) {
      setSummary(null);
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (adminFilter !== "all") params.set("admin", adminFilter);
      if (activationFilter !== "all")
        params.set("activation", activationFilter);
      if (approvalFilter !== "all") params.set("approval", approvalFilter);
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
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    limit,
    statusFilter,
    adminFilter,
    activationFilter,
    approvalFilter,
  ]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Fetch selected user's listings when dialog opens
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
        // Compute stats
        const total = data.total ?? items.length;
        const active = items.filter((l) => l.isActive).length;
        const inactive = total - active;
        const offers = items.filter((l) => l.offer).length;
        const sale = items.filter((l) => l.type === "sale").length;
        const rent = items.filter((l) => l.type === "rent").length;
        setListingStats({ total, active, inactive, offers, sale, rent });
      } catch (e) {
        setListingStats({ error: e.message });
      } finally {
        setListingsLoading(false);
      }
    };
    fetchUserListings();
  }, [selectedUser]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openConfirm = (user, nextStatus) => {
    const map = {
      approved: {
        title: "Approve User",
        description: `Approve account for ${user.username}? They will be able to sign in.`,
      },
      deactivated: {
        title: "Deactivate User",
        description: `Deactivate ${user.username}? They will be prevented from signing in.`,
      },
      pending: {
        title: "Mark Pending",
        description: `Return ${user.username} to pending state?`,
      },
    };
    setConfirm({
      open: true,
      user,
      nextStatus,
      title: map[nextStatus].title,
      description: map[nextStatus].description,
    });
  };

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
      await fetchUsers();
      setConfirm({
        open: false,
        user: null,
        nextStatus: null,
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
          User Management
        </h1>
        <p className="text-sm text-slate-500">
          Search and inspect user accounts
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
                  label: "Total Users",
                  value: summary?.total ?? 0,
                  helper: "Count of all users",
                  helperClass: "bg-indigo-100 text-indigo-700",
                },
                {
                  label: "Approved",
                  value: summary?.approved ?? 0,
                  helper: "Active accounts",
                  helperClass: "bg-emerald-100 text-emerald-700",
                },
                {
                  label: "Pending",
                  value: summary?.pending ?? 0,
                  helper: "Awaiting review",
                  helperClass: "bg-amber-100 text-amber-700",
                },
                {
                  label: "Deactivated",
                  value: summary?.deactivated ?? 0,
                  helper: "Suspended users",
                  helperClass: "bg-rose-100 text-rose-700",
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
          <CardTitle className="text-lg">Users</CardTitle>
          <CardDescription>Showing real users from database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2 self-center">
                Status:
              </span>
              {["all", "approved", "pending", "deactivated"].map((s) => (
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
            <form
              onSubmit={onSearchSubmit}
              className="flex flex-col sm:flex-row gap-2"
            >
              <Input
                type="text"
                placeholder="Search username or email"
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
                  setStatusFilter("all");
                  setAdminFilter("all");
                  setActivationFilter("all");
                  setApprovalFilter("all");
                  setPage(1);
                  fetchUsers();
                }}
              >
                Reset
              </Button>
            </form>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">
                Roles:
              </span>
              <Select
                value={adminFilter}
                onChange={(e) => {
                  setAdminFilter(e.target.value);
                  setPage(1);
                }}
                className="w-32"
              >
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="user">Staff</option>
              </Select>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Activation:
                </span>
                <Select
                  value={activationFilter}
                  onChange={(e) => {
                    setActivationFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-28"
                >
                  <option value="all">All</option>
                  <option value="activated">Activated</option>
                  <option value="deactivated">Deactivated</option>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Approval:
                </span>
                <Select
                  value={approvalFilter}
                  onChange={(e) => {
                    setApprovalFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-24"
                >
                  <option value="all">All</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
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
              Loading users...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Username</TH>
                    <TH>Email</TH>
                    <TH>Status</TH>
                    <TH>Roles</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {users.length === 0 && (
                    <TR>
                      <TD
                        colSpan={4}
                        className="text-center text-sm py-8 text-slate-500"
                      >
                        No users found
                      </TD>
                    </TR>
                  )}
                  {users.map((u) => (
                    <TR key={u._id}>
                      <TD className="font-medium">{u.username}</TD>
                      <TD>{u.email}</TD>
                      <TD>
                        <Badge
                          variant={
                            u.status === "approved"
                              ? "success"
                              : u.status === "pending"
                              ? "warning"
                              : "outline"
                          }
                        >
                          {u.status}
                        </Badge>
                      </TD>
                      <TD>
                        <Badge variant={u.isAdmin ? "success" : "outline"}>
                          {u.isAdmin ? "Admin" : "User"}
                        </Badge>
                      </TD>
                      <TD>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setSelectedUser(u)}
                          >
                            View
                          </Button>
                          {u.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="!bg-green-600 hover:!bg-green-700 text-white"
                                onClick={() => openConfirm(u, "approved")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                className="!bg-red-600 hover:!bg-red-700 text-white"
                                onClick={() => openConfirm(u, "deactivated")}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {u.status === "approved" && (
                            <Button
                              size="sm"
                              variant="default"
                              className="!bg-red-600 hover:!bg-red-700 text-white"
                              onClick={() => openConfirm(u, "deactivated")}
                            >
                              Deactivate
                            </Button>
                          )}
                          {u.status === "deactivated" && (
                            <Button
                              size="sm"
                              variant="default"
                              className="!bg-green-500 hover:!bg-green-600 text-white"
                              onClick={() => openConfirm(u, "approved")}
                            >
                              Re-Approve
                            </Button>
                          )}
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
        open={!!selectedUser}
        onOpenChange={(o) => !o && setSelectedUser(null)}
        title="User Profile"
        footer={
          <div className="w-full flex justify-between items-center">
            <div className="text-xs text-slate-400">
              ID: {selectedUser?._id?.slice(0, 8)}… (click to copy)
            </div>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-6 text-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full overflow-hidden ring-2 ring-slate-200 bg-slate-100 flex-shrink-0">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.username}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight">
                      {selectedUser.username}
                    </h2>
                    <Badge
                      variant={
                        selectedUser.status === "approved"
                          ? "success"
                          : selectedUser.status === "pending"
                          ? "warning"
                          : "outline"
                      }
                    >
                      {selectedUser.status}
                    </Badge>
                    {selectedUser.isAdmin && (
                      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap gap-4">
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
            </div>

            {/* Contact */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs break-all">
                    {selectedUser.email}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(selectedUser.email)
                    }
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  User ID
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[10px] break-all">
                    {selectedUser._id}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(selectedUser._id)
                    }
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Listing Stats */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Listing Summary
              </p>
              {listingsLoading ? (
                <div className="text-xs text-slate-500">Loading listings…</div>
              ) : listingStats?.error ? (
                <div className="text-xs text-red-600">{listingStats.error}</div>
              ) : (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
                  <div className="p-2 rounded border bg-white">
                    <p className="text-[10px] uppercase text-slate-500">
                      Total
                    </p>
                    <p className="text-sm font-semibold">
                      {listingStats?.total ?? 0}
                    </p>
                  </div>
                  <div className="p-2 rounded border bg-white">
                    <p className="text-[10px] uppercase text-slate-500">
                      Active
                    </p>
                    <p className="text-sm font-semibold">
                      {listingStats?.active ?? 0}
                    </p>
                  </div>
                  <div className="p-2 rounded border bg-white">
                    <p className="text-[10px] uppercase text-slate-500">
                      Inactive
                    </p>
                    <p className="text-sm font-semibold">
                      {listingStats?.inactive ?? 0}
                    </p>
                  </div>
                  <div className="p-2 rounded border bg-white">
                    <p className="text-[10px] uppercase text-slate-500">
                      Offers
                    </p>
                    <p className="text-sm font-semibold">
                      {listingStats?.offers ?? 0}
                    </p>
                  </div>
                  <div className="p-2 rounded border bg-white">
                    <p className="text-[10px] uppercase text-slate-500">Sale</p>
                    <p className="text-sm font-semibold">
                      {listingStats?.sale ?? 0}
                    </p>
                  </div>
                  <div className="p-2 rounded border bg-white">
                    <p className="text-[10px] uppercase text-slate-500">Rent</p>
                    <p className="text-sm font-semibold">
                      {listingStats?.rent ?? 0}
                    </p>
                  </div>
                </div>
              )}
              <p className="text-[10px] text-slate-400">
                Counts limited to first 100 listings for performance.
              </p>
            </div>

            {/* Recent Listings */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Recent Listings
              </p>
              {listingsLoading ? (
                <div className="text-xs text-slate-500">Loading…</div>
              ) : userListings.length === 0 ? (
                <div className="text-xs text-slate-500">
                  No listings created by this user.
                </div>
              ) : (
                <div className="border rounded overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="text-left font-medium px-2 py-1">
                          Name
                        </th>
                        <th className="text-left font-medium px-2 py-1">
                          Type
                        </th>
                        <th className="text-left font-medium px-2 py-1">
                          Active
                        </th>
                        <th className="text-left font-medium px-2 py-1">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {userListings.slice(0, 5).map((l) => (
                        <tr key={l._id} className="border-t">
                          <td className="px-2 py-1 font-medium truncate max-w-[140px]">
                            {l.name}
                          </td>
                          <td className="px-2 py-1 capitalize">{l.type}</td>
                          <td className="px-2 py-1">
                            <Badge variant={l.isActive ? "success" : "outline"}>
                              {l.isActive ? "Yes" : "No"}
                            </Badge>
                          </td>
                          <td className="px-2 py-1">
                            {new Date(l.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {userListings.length > 5 && (
                    <div className="text-[10px] px-2 py-1 text-slate-500 bg-slate-50 border-t">
                      + {userListings.length - 5} more (showing 5)
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              Data intended for administrative oversight. Additional actions can
              be added here later.
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
              user: null,
              nextStatus: null,
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
                    user: null,
                    nextStatus: null,
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
    </div>
  );
}

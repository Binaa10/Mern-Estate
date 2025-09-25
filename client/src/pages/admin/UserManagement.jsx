import React, { useState, useEffect } from "react";
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

// We will fetch real users from /api/admin/users

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
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
  }, [page, limit, statusFilter]);

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
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Users</CardTitle>
          <CardDescription>Showing real users from database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
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
              <input
                type="text"
                placeholder="Search username or email"
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
                  fetchUsers();
                }}
              >
                Reset
              </Button>
            </form>
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
                    <TH>Admin</TH>
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
                                variant="outline"
                                onClick={() => openConfirm(u, "approved")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openConfirm(u, "deactivated")}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {u.status === "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openConfirm(u, "deactivated")}
                            >
                              Deactivate
                            </Button>
                          )}
                          {u.status === "deactivated" && (
                            <Button
                              size="sm"
                              variant="outline"
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
          <Button variant="outline" onClick={() => setSelectedUser(null)}>
            Close
          </Button>
        }
      >
        {selectedUser && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Username:</span>{" "}
              {selectedUser.username}
            </p>
            <p>
              <span className="font-medium">Email:</span> {selectedUser.email}
            </p>
            <p>
              <span className="font-medium">Admin:</span>{" "}
              {selectedUser.isAdmin ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-medium">Status:</span> {selectedUser.status}
            </p>
            <p className="text-xs text-slate-500">
              Created: {new Date(selectedUser.createdAt).toLocaleString()}
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

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
} from "../../redux/user/userSlice";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export default function AdminProfile() {
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.user);
  const [form, setForm] = useState({
    name: currentUser?.username || "",
    email: currentUser?.email || "",
    avatar: currentUser?.avatar || "",
    password: "",
    newPassword: "",
  });
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser?._id) return;
    try {
      dispatch(updateUserStart());
      const payload = {
        username: form.name,
        email: form.email,
        avatar: form.avatar,
      };
      if (form.newPassword) {
        if (!form.password) {
          setMessage("Enter current password to set a new one");
          return;
        }
        payload.password = form.newPassword; // backend hashes
      }
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Update failed");
      }
      const data = await res.json();
      dispatch(updateUserSuccess(data));
      setMessage("Profile updated successfully");
      setEditing(false);
      setForm((f) => ({ ...f, password: "", newPassword: "" }));
    } catch (err) {
      dispatch(updateUserFailure(err.message));
      setMessage(err.message);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setMessage("Changes discarded");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Profile</h1>
        <p className="text-sm text-slate-500">
          Manage your administrative account settings
        </p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full overflow-hidden ring-2 ring-slate-200 bg-slate-100 flex-shrink-0">
              <img
                src={
                  currentUser?.avatar ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                }
                alt={currentUser?.username}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">
                  {currentUser?.username}
                </h2>
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                  Admin
                </Badge>
              </div>
              <p className="text-sm text-slate-600">{currentUser?.email}</p>
              <p className="text-xs text-slate-500">
                Member since{" "}
                {new Date(currentUser?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {message && (
        <div
          className={`text-sm border px-3 py-2 rounded ${
            message.includes("successfully")
              ? "text-green-700 bg-green-100 border-green-200"
              : "text-red-700 bg-red-100 border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>Update your identification details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  disabled={!editing}
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  disabled={!editing}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                name="avatar"
                disabled={!editing}
                value={form.avatar}
                onChange={handleChange}
                placeholder="Enter avatar URL"
              />
            </div>
            <CardFooter className="flex gap-2 px-0 pt-2">
              {!editing && (
                <Button type="button" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              )}
              {editing && (
                <>
                  <Button type="submit" variant="success" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {/* Password Update Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Password & Security</CardTitle>
          <CardDescription>
            Change your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Current Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  disabled={!editing}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  disabled={!editing}
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Password must be at least 6 characters long and contain a mix of
              letters and numbers.
            </div>
            <CardFooter className="flex gap-2 px-0 pt-2">
              {!editing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  Change Password
                </Button>
              )}
              {editing && form.newPassword && (
                <>
                  <Button type="submit" variant="success" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

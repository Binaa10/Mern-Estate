import React, { useState } from "react";
import { useSelector } from "react-redux";
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

export default function AdminProfile() {
  const { currentUser } = useSelector((state) => state.user);
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

  const handleSave = (e) => {
    e.preventDefault();
    // Placeholder: would call backend
    setMessage("Profile updated (mock)");
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setMessage("Changes discarded");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Profile</h1>
        <p className="text-sm text-slate-500">
          Manage your administrative account settings
        </p>
      </div>
      {message && (
        <div className="text-sm text-green-700 bg-green-100 border border-green-200 px-3 py-2 rounded">
          {message}
        </div>
      )}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Profile Information</CardTitle>
          <CardDescription>
            Update identification and security details
          </CardDescription>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  disabled={!editing}
                  value={form.email}
                  onChange={handleChange}
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
              />
            </div>
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
                />
              </div>
            </div>
            <CardFooter className="flex gap-2 px-0 pt-2">
              {!editing && (
                <Button type="button" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              )}
              {editing && (
                <>
                  <Button type="submit" variant="success">
                    Save
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

import React, { useEffect, useRef, useState } from "react";
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
import { storage } from "../../appWrite/appwriteConfig.js";
import { ID, Permission, Role } from "appwrite";
import { HiOutlinePencil } from "react-icons/hi";

const DEFAULT_AVATAR =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
const AVATAR_BUCKET_ID = "67fed0b9001c2550df97";

export default function AdminProfile() {
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.user);
  const [form, setForm] = useState({
    name: currentUser?.username || "",
    email: currentUser?.email || "",
    avatar: currentUser?.avatar || DEFAULT_AVATAR,
    password: "",
    newPassword: "",
  });
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(
    form.avatar || DEFAULT_AVATAR
  );
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [passwordEditing, setPasswordEditing] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    setForm({
      name: currentUser?.username || "",
      email: currentUser?.email || "",
      avatar: currentUser?.avatar || DEFAULT_AVATAR,
      password: "",
      newPassword: "",
    });
    setAvatarPreview(currentUser?.avatar || DEFAULT_AVATAR);
    setProfileEditing(false);
    setPasswordEditing(false);
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAvatarClick = () => {
    if (avatarUploading) return;
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const response = await storage.createFile(
        AVATAR_BUCKET_ID,
        ID.unique(),
        file,
        [Permission.read(Role.any()), Permission.update(Role.any())]
      );
      const fileUrl = storage.getFileView(AVATAR_BUCKET_ID, response.$id);
      setForm((prev) => ({ ...prev, avatar: fileUrl }));
      setAvatarPreview(fileUrl);
      setMessage("Avatar updated successfully. Remember to save your profile.");
      setProfileEditing(true);
    } catch (error) {
      console.error("Avatar upload failed", error);
      setMessage("Failed to upload avatar. Please try again.");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const performUpdate = async (payload, successMessage) => {
    if (!currentUser?._id) return false;
    try {
      dispatch(updateUserStart());
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
      setMessage(successMessage);
      setForm((f) => ({ ...f, password: "", newPassword: "" }));
      return true;
    } catch (err) {
      dispatch(updateUserFailure(err.message));
      setMessage(err.message);
      return false;
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const success = await performUpdate(
      {
        username: form.name,
        email: form.email,
        avatar: form.avatar,
      },
      "Profile updated successfully"
    );
    if (success) {
      setProfileEditing(false);
    }
  };

  const handleProfileCancel = () => {
    setProfileEditing(false);
    setMessage("Profile changes discarded");
    setForm({
      name: currentUser?.username || "",
      email: currentUser?.email || "",
      avatar: currentUser?.avatar || DEFAULT_AVATAR,
      password: "",
      newPassword: "",
    });
    setAvatarPreview(currentUser?.avatar || DEFAULT_AVATAR);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!form.password || !form.newPassword) {
      setMessage("Enter current and new password to continue");
      return;
    }
    if (form.newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long");
      return;
    }
    const success = await performUpdate(
      {
        username: form.name,
        email: form.email,
        avatar: form.avatar,
        password: form.newPassword,
      },
      "Password updated successfully"
    );
    if (success) {
      setPasswordEditing(false);
    }
  };

  const handlePasswordCancel = () => {
    setPasswordEditing(false);
    setMessage("Password update cancelled");
    setForm((prev) => ({ ...prev, password: "", newPassword: "" }));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-xl">
        <div className="flex flex-col gap-6 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Account center
            </p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Admin Profile
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-500">
                  Manage your administrative account settings
                </p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
                Changes sync immediately after saving
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-inner">
                <img
                  src={currentUser?.avatar || DEFAULT_AVATAR}
                  alt={currentUser?.username}
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 rounded-full ring-8 ring-white/40" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {currentUser?.username || "Admin"}
                  </h2>
                  <Badge className="rounded-full bg-indigo-100 text-indigo-700">
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
            <div className="grid w-full gap-3 sm:max-w-sm sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                  Email
                </span>
                <span className="mt-1 block truncate text-sm font-semibold text-slate-900">
                  {currentUser?.email || "—"}
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                  Member since
                </span>
                <span className="mt-1 block text-sm font-semibold text-slate-900">
                  {new Date(currentUser?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${
            /success/i.test(message)
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Personal Information Card */}
      <Card className="border-slate-200/70 shadow-md">
        <CardHeader className="rounded-2xl bg-slate-50/70 px-6 py-5">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Personal Information
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            Update your identification details
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-6">
          <form onSubmit={handleProfileSave} className="space-y-6">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div
                className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full ring-2 ring-slate-200 bg-slate-100"
                role="button"
                tabIndex={0}
                title="Change profile picture"
                onClick={handleAvatarClick}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleAvatarClick();
                  }
                }}
              >
                <img
                  src={avatarPreview || DEFAULT_AVATAR}
                  alt="Profile avatar preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAvatarClick();
                  }}
                  disabled={avatarUploading}
                  title="Change profile picture"
                  className="absolute bottom-0 right-0 inline-flex h-10 w-10 translate-x-1/4 translate-y-1/4 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-lg transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
                  aria-label="Change profile picture"
                >
                  <HiOutlinePencil className="h-5 w-5" />
                </button>
                {avatarUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white">
                    Uploading...
                  </div>
                )}
              </div>
              <p className="max-w-sm rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-500">
                Click the pencil icon to update your profile picture. Remember
                to save your changes after uploading.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  disabled={!profileEditing}
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="rounded-xl border-slate-200 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  disabled={!profileEditing}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="rounded-xl border-slate-200 bg-white"
                />
              </div>
            </div>
            <CardFooter className="flex flex-wrap gap-2 px-0 pt-2">
              {!profileEditing && (
                <Button
                  type="button"
                  onClick={() => {
                    setProfileEditing(true);
                    setPasswordEditing(false);
                    setMessage(null);
                  }}
                  className="rounded-xl px-4"
                >
                  Edit Profile
                </Button>
              )}
              {profileEditing && (
                <>
                  <Button
                    type="submit"
                    variant="success"
                    disabled={loading}
                    className="rounded-xl px-4"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleProfileCancel}
                    className="rounded-xl px-4"
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
      <Card className="border-slate-200/70 shadow-md">
        <CardHeader className="rounded-2xl bg-slate-50/70 px-6 py-5">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Password & Security
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            Change your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-6">
          <form onSubmit={handlePasswordSave} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Current Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  disabled={!passwordEditing}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  className="rounded-xl border-slate-200 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  disabled={!passwordEditing}
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="rounded-xl border-slate-200 bg-white"
                />
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-500">
              Password must be at least 6 characters long and contain a mix of
              letters and numbers.
            </div>
            <CardFooter className="flex flex-wrap gap-2 px-0 pt-2">
              {!passwordEditing && (
                <Button
                  type="button"
                  onClick={() => {
                    setPasswordEditing(true);
                    setProfileEditing(false);
                    setMessage(null);
                  }}
                  className="rounded-xl px-4"
                >
                  Change Password
                </Button>
              )}
              {passwordEditing && (
                <>
                  <Button
                    type="submit"
                    variant="success"
                    disabled={loading || !form.password || !form.newPassword}
                    className="rounded-xl px-4"
                  >
                    {loading ? "Updating..." : "Save Password"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePasswordCancel}
                    className="rounded-xl px-4"
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

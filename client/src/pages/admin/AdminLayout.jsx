import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  HiOutlineHome,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineOfficeBuilding,
  HiOutlineUser,
  HiOutlinePlusCircle,
  HiOutlineClipboardList,
} from "react-icons/hi";

const links = [
  { to: "/admin", label: "Dashboard", end: true, icon: HiOutlineHome },
  { to: "/admin/analytics", label: "Analytics", icon: HiOutlineChartBar },
  { to: "/admin/users", label: "Users", icon: HiOutlineUsers },
  {
    to: "/admin/properties",
    label: "Properties",
    icon: HiOutlineOfficeBuilding,
  },
  {
    to: "/admin/create-listing",
    label: "Create Listing",
    icon: HiOutlinePlusCircle,
  },
  {
    to: "/admin/my-listings",
    label: "My Listings",
    icon: HiOutlineClipboardList,
  },
  { to: "/admin/profile", label: "Profile", icon: HiOutlineUser },
];

export default function AdminLayout() {
  const { currentUser } = useSelector((s) => s.user);

  return (
    <div className="min-h-[calc(100vh-60px)] flex bg-slate-50 dark:bg-slate-900 dark:text-slate-100 transition-colors">
      <aside className="w-60 hidden md:flex flex-col border-r bg-white dark:bg-slate-950 dark:border-slate-800">
        <div className="p-4 border-b dark:border-slate-800">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">
            Admin Panel
          </h2>
          {currentUser && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {currentUser.email}
            </p>
          )}
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition " +
                (isActive
                  ? "bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800")
              }
            >
              <l.icon className="h-5 w-5" />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t dark:border-slate-800 flex flex-col gap-2 text-xs text-slate-400 dark:text-slate-500">
          {/* Removed theme toggle - now in header */}
          {/* Removed © year as requested */}
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <div className="md:hidden border-b bg-white dark:bg-slate-950 dark:border-slate-800 p-2 flex gap-2 overflow-x-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                "flex items-center gap-2 whitespace-nowrap rounded px-3 py-1 text-sm " +
                (isActive
                  ? "bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300")
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </div>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

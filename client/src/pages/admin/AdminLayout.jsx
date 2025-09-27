import React, { useState, useEffect, useMemo } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useSelector } from "react-redux";
import {
  HiOutlineHome,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineOfficeBuilding,
  HiOutlineUser,
  HiOutlineMoon,
  HiOutlineSun,
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
  const location = useLocation();
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("admin-theme")
      ? localStorage.getItem("admin-theme")
      : "light"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const activeLink = useMemo(() => {
    const path = location.pathname.replace(/\/$/, "");
    return (
      links.find((l) => (l.end ? path === l.to : path.startsWith(l.to))) ?? null
    );
  }, [location.pathname]);

  const pageTitle = activeLink?.label || "Admin";

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
        <header className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {pageTitle}
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="gap-2"
              aria-label="Toggle theme"
              title={
                theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
            >
              {theme === "light" ? (
                <HiOutlineMoon className="h-4 w-4" />
              ) : (
                <HiOutlineSun className="h-4 w-4" />
              )}
              <span className="hidden sm:block">
                {theme === "light" ? "Dark" : "Light"}
              </span>
            </Button>
          </div>
        </header>

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

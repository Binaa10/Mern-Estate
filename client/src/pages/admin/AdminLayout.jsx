import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useSelector } from "react-redux";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/properties", label: "Properties" },
  { to: "/admin/profile", label: "Profile" },
];

export default function AdminLayout() {
  const { currentUser } = useSelector((s) => s.user);
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
                "block rounded-md px-3 py-2 text-sm font-medium transition " +
                (isActive
                  ? "bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800")
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t dark:border-slate-800 flex flex-col gap-2 text-xs text-slate-400 dark:text-slate-500">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="justify-center"
          >
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </Button>
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
                "whitespace-nowrap rounded px-3 py-1 text-sm " +
                (isActive
                  ? "bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300")
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="ml-auto"
          >
            {theme === "light" ? "Dark" : "Light"}
          </Button>
        </div>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

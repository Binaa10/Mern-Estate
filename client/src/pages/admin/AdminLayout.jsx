import React from "react";
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
  return (
    <div className="min-h-[calc(100vh-60px)] flex bg-slate-50">
      <aside className="w-60 hidden md:flex flex-col border-r bg-white">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-slate-700">Admin Panel</h2>
          {currentUser && (
            <p className="text-xs text-slate-500 mt-1 truncate">
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
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100")
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t text-xs text-slate-400">
          © {new Date().getFullYear()}
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <div className="md:hidden border-b bg-white p-2 flex gap-2 overflow-x-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                "whitespace-nowrap rounded px-3 py-1 text-sm " +
                (isActive
                  ? "bg-slate-900 text-white"
                  : "bg-slate-200 text-slate-700")
              }
            >
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

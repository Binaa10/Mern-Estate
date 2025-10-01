import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  HiOutlineHome,
  HiOutlinePlusCircle,
  HiOutlineClipboardList,
  HiOutlineUser,
} from "react-icons/hi";
import { FiMenu, FiX } from "react-icons/fi";

const links = [
  { to: "/account", label: "Dashboard", end: true, icon: HiOutlineHome },
  {
    to: "/account/create-listing",
    label: "Create Listing",
    icon: HiOutlinePlusCircle,
  },
  {
    to: "/account/my-listings",
    label: "My Listings",
    icon: HiOutlineClipboardList,
  },
  { to: "/account/profile", label: "Profile", icon: HiOutlineUser },
];

export default function UserLayout() {
  const { currentUser } = useSelector((s) => s.user);
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="bg-slate-50 pb-10 dark:bg-slate-900 dark:text-slate-100 transition-colors">
      <div className="mx-auto flex min-h-[calc(100vh-60px)] w-full max-w-7xl flex-col gap-0 px-0 sm:px-4 md:flex-row md:px-6">
        <aside className="hidden w-full max-w-xs shrink-0 flex-col border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950 md:flex">
          <div className="border-b p-4 dark:border-slate-800">
            <h2 className="font-semibold text-slate-700 dark:text-slate-200">
              Member Hub
            </h2>
            {currentUser && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                {currentUser.email}
              </p>
            )}
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition " +
                  (isActive
                    ? "bg-slate-900 text-white shadow-sm dark:bg-slate-200 dark:text-slate-900"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
                }
              >
                <l.icon className="h-5 w-5" />
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t p-4 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
            <p>Access your saved listings and account tools.</p>
          </div>
        </aside>
        <div className="flex w-full flex-1 flex-col rounded-none bg-white shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/60 dark:bg-slate-950 dark:ring-slate-800 md:ml-6 md:rounded-2xl">
          <div className="flex items-center justify-between border-b bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 md:hidden">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Member Hub
              </span>
              {currentUser?.email && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {currentUser.email}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white text-slate-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400 dark:focus-visible:ring-offset-slate-950"
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-account-nav"
            >
              {isMobileNavOpen ? (
                <FiX className="h-5 w-5" />
              ) : (
                <FiMenu className="h-5 w-5" />
              )}
            </button>
          </div>
          {isMobileNavOpen && (
            <nav
              id="mobile-account-nav"
              className="flex flex-col gap-1 border-b bg-white px-4 pb-3 pt-2 dark:border-slate-800 dark:bg-slate-950 md:hidden"
            >
              {links.map((l) => (
                <NavLink
                  key={`${l.to}-mobile`}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition " +
                    (isActive
                      ? "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
                  }
                >
                  <l.icon className="h-5 w-5" />
                  {l.label}
                </NavLink>
              ))}
            </nav>
          )}
          <main className="flex-1 space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

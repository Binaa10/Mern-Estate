//import React from "react";
import { FaSearch } from "react-icons/fa";
import {
  FiArrowUpRight,
  FiChevronDown,
  FiGrid,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
} from "../redux/user/userSlice";
import { useTheme } from "../hooks/useTheme";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentLocation = useLocation();
  const menuRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  const primaryLinks = [
    { to: "/", label: "Home", match: (path) => path === "/" },
    {
      to: "/search",
      label: "Browse",
      match: (path) => path.startsWith("/search"),
    },
    {
      to: "/about",
      label: "About",
      match: (path) => path.startsWith("/about"),
    },
  ];

  if (currentUser?.isAdmin) {
    primaryLinks.push({
      to: "/admin",
      label: "Admin",
      match: (path) => path.startsWith("/admin"),
    });
  } else if (currentUser) {
    primaryLinks.push({
      to: "/account",
      label: "User",
      match: (path) => path.startsWith("/account"),
    });
  }

  const isLinkActive = (link) =>
    link.match
      ? link.match(currentLocation.pathname)
      : currentLocation.pathname === link.to;

  const handleSubmit = (event) => {
    event.preventDefault();
    const urlParams = new URLSearchParams(currentLocation.search);
    urlParams.set("searchTerm", searchTerm);
    navigate(`/search?${urlParams.toString()}`);
  };

  const renderSearchForm = ({ className = "", inputClassName = "" } = {}) => (
    <form
      onSubmit={handleSubmit}
      className={`group flex min-w-0 flex-1 items-center gap-2 rounded-full border border-slate-400/60 bg-slate-100/95 px-3 py-1.5 text-slate-700 shadow-sm backdrop-blur transition-colors focus-within:border-green-300 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-200 ${className}`}
    >
      <FaSearch
        className="shrink-0 text-slate-400 transition-colors group-focus-within:text-slate-600 dark:text-slate-500 dark:group-focus-within:text-slate-200"
        aria-hidden="true"
      />
      <input
        type="text"
        placeholder="Search properties"
        className={`min-w-0 flex-1 bg-transparent text-xs sm:text-sm focus:outline-none ${inputClassName}`}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      <button
        type="submit"
        aria-label="Search listings"
        className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-500/30 dark:text-emerald-300"
      >
        Go
      </button>
    </form>
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(currentLocation.search);
    setSearchTerm(urlParams.get("searchTerm") || "");
  }, [currentLocation.search]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentLocation.pathname]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();

      if (data.success === false) {
        dispatch(signOutUserFailure(data));
        toast.error(
          <span className="text-sm font-medium">Failed to sign out.</span>
        );
        return;
      }

      dispatch(signOutUserSuccess(data));
      toast.success(
        <span className="text-sm font-medium">Signed out successfully!</span>
      );
      navigate("/sign-in");
    } catch (error) {
      dispatch(signOutUserFailure(error));
      toast.error(
        <span className="text-sm font-medium">Failed to sign out.</span>
      );
    } finally {
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="relative z-50 w-full bg-[#1f2936] text-slate-100 shadow-lg shadow-slate-900/20 transition-colors dark:bg-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 py-3 sm:px-4 md:gap-4 md:py-4">
        <div className="flex w-full flex-wrap items-center justify-between gap-2 md:gap-3">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-300 via-emerald-500 to-emerald-600 text-base font-bold text-slate-900 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/40">
              BE
            </div>
            <div>
              <span className="block font-semibold text-base sm:text-xl md:text-2xl text-slate-100">
                Binios <span className="text-green-300">Estate</span>
              </span>
              <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-300/80 sm:block">
                Residential • Commercial • Advisory
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-4 md:gap-6 lg:flex">
            {primaryLinks.map((link) => {
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group relative px-1 text-sm font-medium tracking-wide transition-colors ${
                    active ? "text-white" : "text-slate-200 hover:text-white"
                  }`}
                >
                  <span>{link.label}</span>
                  <span
                    className={`absolute -bottom-2 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-green-300 to-emerald-400 transition-transform duration-200 group-hover:scale-x-100 ${
                      active ? "scale-x-100" : ""
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            {renderSearchForm({
              className: "hidden md:flex w-full max-w-xs lg:max-w-sm",
            })}

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-400/60 bg-[#223042] text-slate-200 shadow-sm transition hover:border-green-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f2936] dark:border-slate-600 dark:bg-slate-800 dark:hover:border-green-500 dark:hover:text-slate-100 dark:focus-visible:ring-offset-slate-900"
            >
              {theme === "dark" ? (
                <HiOutlineSun className="h-5 w-5" />
              ) : (
                <HiOutlineMoon className="h-5 w-5" />
              )}
            </button>

            <Link
              to={
                currentUser
                  ? currentUser.isAdmin
                    ? "/admin/create-listing"
                    : "/account/create-listing"
                  : "/sign-in"
              }
              className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-green-300 via-emerald-500 to-emerald-600 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-lg shadow-emerald-500/25 transition hover:from-green-200 hover:via-emerald-400 hover:to-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f2936] dark:focus-visible:ring-offset-slate-900 md:inline-flex"
            >
              <span>List Property</span>
              <FiArrowUpRight className="h-4 w-4" />
            </Link>

            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={toggleMenu}
                  className="flex items-center gap-1 rounded-full border border-slate-400/60 bg-[#223042] px-1 py-1 pr-2 text-slate-100 shadow-sm transition duration-150 hover:border-green-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f2936] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-green-500 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                >
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-600"
                    src={
                      currentUser.avatar ||
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                    }
                    alt="profile"
                  />
                  <FiChevronDown
                    aria-hidden="true"
                    className={`hidden text-base transition-transform duration-150 sm:block ${
                      isMenuOpen
                        ? "rotate-180 text-green-300"
                        : "text-slate-300 dark:text-slate-500"
                    }`}
                  />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 z-[1100] mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/95 pb-2 pt-3 shadow-2xl backdrop-blur-sm ring-1 ring-black/5 transition dark:border-slate-600 dark:bg-slate-800/95">
                    <div className="border-b border-slate-100/80 px-4 pb-3">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {currentUser.username}
                      </p>
                      {currentUser.email && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {currentUser.email}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col py-1">
                      <button
                        onClick={() =>
                          handleNavigate(
                            currentUser.isAdmin ? "/admin" : "/account"
                          )
                        }
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-100/70 dark:text-slate-200 dark:hover:bg-slate-700"
                        role="menuitem"
                      >
                        <FiGrid
                          className="text-base text-green-500"
                          aria-hidden="true"
                        />
                        <span>Dashboard</span>
                      </button>
                      <button
                        onClick={() =>
                          handleNavigate(
                            currentUser.isAdmin
                              ? "/admin/profile"
                              : "/account/profile"
                          )
                        }
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-100/70 dark:text-slate-200 dark:hover:bg-slate-700"
                        role="menuitem"
                      >
                        <FiUser
                          className="text-base text-blue-500"
                          aria-hidden="true"
                        />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-500/20"
                        role="menuitem"
                      >
                        <FiLogOut className="text-base" aria-hidden="true" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/sign-in"
                className="inline-flex items-center gap-2 rounded-full border border-slate-400/70 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:border-green-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f2936] dark:border-slate-600 dark:hover:border-green-500"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pb-2 lg:hidden">
          {renderSearchForm({ className: "w-full md:hidden" })}
          <div className="flex items-center justify-between gap-2">
            <div className="flex w-full gap-2 overflow-x-auto pb-1">
              {primaryLinks.map((link) => {
                const active = isLinkActive(link);
                return (
                  <Link
                    key={`${link.to}-mobile`}
                    to={link.to}
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition ${
                      active
                        ? "bg-gradient-to-r from-green-300 to-emerald-500 text-slate-900"
                        : "bg-[#223042] text-slate-200 hover:bg-[#2f435c]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <Link
              to={
                currentUser
                  ? currentUser.isAdmin
                    ? "/admin/create-listing"
                    : "/account/create-listing"
                  : "/sign-in"
              }
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-green-400/70 px-2 py-1 text-xs font-semibold text-green-200 transition hover:border-green-300 hover:text-white md:hidden"
            >
              List
              <FiArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

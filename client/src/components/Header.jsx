//import React from "react";
import { FaSearch } from "react-icons/fa";
import { FiChevronDown, FiGrid, FiLogOut, FiUser } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
} from "../redux/user/userSlice";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentLocation = useLocation();
  const menuRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(currentLocation.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(currentLocation.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    setSearchTerm(searchTermFromUrl || "");
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
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

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
    <header className="bg-slate-700 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl ">
            <span className="text-slate-100">Binios</span>
            <span className="text-green-300">Estate</span>
          </h1>
        </Link>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-100 p-3 rounded-lg flex items-center"
        >
          <input
            type="text"
            placeholder="search..."
            className="bg-transparent focus:outline-none w-24 sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className="text-slate-600" />
          </button>
        </form>
        <ul className="flex items-center gap-4">
          <li className="hidden sm:inline text-slate-100 hover:underline">
            <Link to="/">Home</Link>
          </li>
          <li className="hidden sm:inline text-slate-100 hover:underline">
            <Link to="/about">About</Link>
          </li>
          {currentUser?.isAdmin && (
            <li className="hidden sm:inline text-slate-100 hover:underline">
              <Link to="/admin">Admin</Link>
            </li>
          )}
          {currentUser ? (
            <li className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={toggleMenu}
                className="flex items-center gap-2 rounded-full border border-slate-500/30 bg-slate-800/60 px-1.5 py-1 pr-2 text-slate-200 shadow-sm transition duration-150 hover:border-green-300/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-700"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open user menu</span>
                <img
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-900/40"
                  src={currentUser.avatar}
                  alt="profile"
                />
                <FiChevronDown
                  aria-hidden="true"
                  className={`hidden text-base transition-transform duration-150 sm:block ${
                    isMenuOpen ? "rotate-180 text-green-300" : "text-slate-300"
                  }`}
                />
              </button>
              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/95 pb-2 pt-3 shadow-2xl backdrop-blur-sm ring-1 ring-black/5"
                  role="menu"
                >
                  <div className="border-b border-slate-100/80 px-4 pb-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {currentUser.username}
                    </p>
                    {currentUser.email && (
                      <p className="text-xs text-slate-500">
                        {currentUser.email}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col py-1">
                    {currentUser.isAdmin && (
                      <button
                        onClick={() => handleNavigate("/admin")}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100/70"
                        role="menuitem"
                      >
                        <FiGrid
                          className="text-base text-green-500"
                          aria-hidden="true"
                        />
                        <span>Dashboard</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleNavigate("/profile")}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100/70"
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
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      role="menuitem"
                    >
                      <FiLogOut className="text-base" aria-hidden="true" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </li>
          ) : (
            <li className="text-slate-100 hover:underline">
              <Link to="/sign-in">Sign in</Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}

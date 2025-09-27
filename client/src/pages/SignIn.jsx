import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import OAuth from "../components/OAuth.jsx";
import toast from "react-hot-toast";

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());

      const res = await fetch("/api/auth/signin", {
        method: "post",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate("/");

      toast.success(
        <span className="text-sm font-medium animate-pulse">
          Logged in successfully
        </span>
      );
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100">
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-24 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-16">
        <div className="w-full rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-2xl shadow-emerald-100/70 backdrop-blur-sm sm:p-10 lg:p-14">
          <div className="flex flex-col gap-3 text-center lg:text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.5em] text-emerald-500">
              Sign In
            </span>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Sign In
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div className="space-y-2">
              <div className="rounded-2xl border border-emerald-100/80 bg-slate-50/70 px-4 py-3 shadow-inner shadow-emerald-50 focus-within:border-emerald-300">
                <input
                  type="email"
                  placeholder="email"
                  className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  id="email"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="rounded-2xl border border-emerald-100/80 bg-slate-50/70 px-4 py-3 shadow-inner shadow-emerald-50 focus-within:border-emerald-300">
                <input
                  type="password"
                  placeholder="password"
                  className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  id="password"
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-300 hover:via-emerald-400 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-emerald-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-[0.4em] text-emerald-400">
                <span className="bg-white px-4 text-[10px]">Sign In</span>
              </div>
            </div>

            <OAuth />
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600 lg:justify-start">
            <p className="text-slate-500">Dont have an account?</p>
            <Link
              to={"/sign-up"}
              className="font-semibold text-emerald-600 transition hover:text-emerald-500"
            >
              Sign up
            </Link>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

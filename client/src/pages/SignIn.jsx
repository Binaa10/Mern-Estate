import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import { FiCheckCircle } from "react-icons/fi";
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

  const featureList = [
    {
      title: "Track your saved homes",
      description: "See status changes and price updates at a glance.",
    },
    {
      title: "Talk to clients faster",
      description: "Message buyers, share links, and book tours in seconds.",
    },
    {
      title: "Stay organised",
      description: "Keep notes and reminders together for every listing.",
    },
  ];

  const supportNotes = [
    {
      title: "Forgot your password?",
      description: "Select Need help to reset it in under a minute.",
    },
    {
      title: "Prefer Google sign-in?",
      description: "Use the Google button to connect instantly—no extra setup.",
    },
  ];

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
    <main className="relative flex min-h-screen flex-col justify-center bg-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-500/20 to-transparent" />
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-10 text-slate-700">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
              Welcome back
            </span>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
                Sign in to keep your moves on track.
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                Pick up saved searches, send quick updates, and keep deals
                moving without missing a step.
              </p>
            </div>

            <ul className="space-y-5 text-slate-600">
              {featureList.map(({ title, description }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
                    <FiCheckCircle className="h-4 w-4" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-slate-900">
                      {title}
                    </p>
                    <p className="text-sm text-slate-600">{description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-4 text-sm text-slate-600">
              {supportNotes.map(({ title, description }) => (
                <div key={title} className="border-l-2 border-emerald-200 pl-4">
                  <p className="font-semibold text-slate-900">{title}</p>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
              <div className="space-y-1 text-center">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Sign in
                </h2>
                <p className="text-sm text-slate-500">
                  Enter your email and password to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
                  >
                    Email
                  </label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner focus-within:border-emerald-400">
                    <input
                      type="email"
                      id="email"
                      placeholder="you@biniosestate.com"
                      className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      onChange={handleChange}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
                  >
                    Password
                  </label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner focus-within:border-emerald-400">
                    <input
                      type="password"
                      id="password"
                      placeholder="Your secure password"
                      className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      onChange={handleChange}
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
                    />
                    Remember me
                  </label>
                  <Link
                    to="/privacy"
                    className="font-medium text-emerald-600 hover:text-emerald-500"
                  >
                    Need help?
                  </Link>
                </div>

                <button
                  disabled={loading}
                  className="w-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-300 hover:via-emerald-400 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-[0.3em] text-slate-400">
                    <span className="bg-white px-4 text-[10px]">
                      Or continue with
                    </span>
                  </div>
                </div>

                <OAuth />
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600">
                <p className="text-slate-500">New to Binio's Estate?</p>
                <Link
                  to="/sign-up"
                  className="font-semibold text-emerald-600 transition hover:text-emerald-500"
                >
                  Create an account
                </Link>
              </div>

              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <p className="mt-6 text-center text-xs text-slate-400">
                Your sessions are secured with encrypted cookies.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import OAuth from "../components/OAuth.jsx";
import toast from "react-hot-toast";

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const benefitList = [
    {
      title: "Save listings you love",
      description: "Bookmark homes and track updates from one dashboard.",
    },
    {
      title: "Share updates instantly",
      description: "Loop in clients or family members with quick messages.",
    },
    {
      title: "Stay on top of tasks",
      description: "Set reminders so every next step is clear.",
    },
  ];

  const setupNotes = [
    {
      title: "Invite teammates later",
      description: "You can add agents or family once your account is live.",
    },
    {
      title: "Need a faster start?",
      description: "Use Google sign-up to import your details automatically.",
    },
  ];
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await fetch("/api/auth/signup", {
        method: "post",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      navigate("/sign-in");
      toast.success(
        <span className="text-sm font-medium animate-pulse">
          user registered successfully!
        </span>
      );
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col justify-center bg-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-500/20 to-transparent" />
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-10 text-slate-700">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
              Create account
            </span>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
                Join Binio's Estate in a few easy steps.
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                Set up your profile, organise your searches, and invite others
                to follow along.
              </p>
            </div>

            <ul className="space-y-5 text-slate-600">
              {benefitList.map(({ title, description }) => (
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
              {setupNotes.map(({ title, description }) => (
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
                  Create your account
                </h2>
                <p className="text-sm text-slate-500">
                  Fill in the details below to get started.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
                  >
                    Username
                  </label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner focus-within:border-emerald-400">
                    <input
                      type="text"
                      id="username"
                      placeholder="Your unique handle"
                      className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      onChange={handleChange}
                      autoComplete="username"
                    />
                  </div>
                </div>

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
                      placeholder="Minimum 6 characters"
                      className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
                  />
                  I agree to the privacy promise and terms of use.
                </label>

                <button
                  disabled={loading}
                  className="w-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-300 hover:via-emerald-400 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Creating account..." : "Create account"}
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
                <p className="text-slate-500">Already have an account?</p>
                <Link
                  to="/sign-in"
                  className="font-semibold text-emerald-600 transition hover:text-emerald-500"
                >
                  Sign in instead
                </Link>
              </div>

              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <p className="mt-6 text-center text-xs text-slate-400">
                We only use your details to keep your account secure.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import { useMemo, useState } from "react";
import { FiAlertTriangle, FiLock, FiLogIn, FiUser } from "react-icons/fi";
import { loginUser } from "../api/auth";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });

  const [status, setStatus] = useState({ loading: false, server: "" });

  const canSubmit = useMemo(() => {
    return (
      form.username.trim().length > 0 &&
      form.password.trim().length > 0 &&
      !status.loading
    );
  }, [form, status.loading]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, server: "" });

    try {
      await loginUser({
        username: form.username.trim(),
        password: form.password,
      });
      window.dispatchEvent(new Event("auth:changed"));
      setForm({ username: "", password: "" });

      setStatus({ loading: false, server: "" });
    } catch (error) {
      setStatus({
        loading: false,
        server: error?.response?.data?.message || "Unable to login",
      });
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-b from-slate-50 via-white to-sky-50 px-3 py-5 text-slate-900 sm:px-4 sm:py-8">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sky-200/55 blur-3xl sm:h-72 sm:w-72" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-200/45 blur-3xl sm:h-72 sm:w-72" />

      <section className="relative mx-auto grid w-full max-w-5xl gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-3 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.45)] backdrop-blur sm:gap-6 sm:p-4 lg:grid-cols-2 lg:rounded-4xl lg:p-6">
        <aside className="relative hidden h-full overflow-hidden rounded-3xl bg-linear-to-br from-slate-100 to-white p-7 lg:flex lg:flex-col lg:justify-between">
          <img
            src="/logo.png"
            alt="logo"
            className="absolute scale-150 opacity-5"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
              BlockStone Printing
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-slate-900">
              Precision Printing Workspace
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              Sign in to manage live jobs, customer tickets, inventory alerts,
              and production flow from one unified console.
            </p>
          </div>

          <div className="relative mt-8 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Delivery SLA
              </p>
              <p className="mt-1 text-sm font-black text-emerald-600">
                94% on-time
              </p>
            </div>
          </div>
        </aside>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:rounded-[28px] sm:p-6">
          <header className="mb-4 sm:mb-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white sm:h-11 sm:w-11">
              <FiLogIn size={18} />
            </div>
            <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-500 sm:text-sm">
              Sign in to continue to your dashboard.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2 lg:hidden">
              <div className="rounded-lg bg-white px-2.5 py-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  SLA
                </p>
                <p className="text-xs font-black text-emerald-600">
                  94% on-time
                </p>
              </div>
              <div className="rounded-lg bg-white px-2.5 py-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Console
                </p>
                <p className="text-xs font-black text-slate-700">Live Ops</p>
              </div>
            </div>
          </header>

          <form onSubmit={submit} className="space-y-3 sm:space-y-4">
            <label className="block space-y-1 text-sm sm:space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Username
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:border-slate-900 sm:py-2.5">
                <FiUser className="text-slate-500" />
                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={onChange}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                  placeholder="Enter username"
                />
              </div>
            </label>

            <label className="block space-y-1 text-sm sm:space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Password
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:border-slate-900 sm:py-2.5">
                <FiLock className="text-slate-500" />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </label>

            {status.server ? (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                <FiAlertTriangle />
                <span>{status.server}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
            >
              {status.loading ? "Signing you in..." : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Login;

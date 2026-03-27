import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiAtSign,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiShield,
  FiUser,
  FiUserPlus,
} from "react-icons/fi";
import { registerUser } from "../api/auth";

const RegisterPage = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({
    loading: false,
    success: "",
    server: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = useMemo(() => {
    const requiredValues = [
      form.first_name.trim(),
      form.last_name.trim(),
      form.username.trim(),
      form.email.trim(),
      form.password.trim(),
    ];

    return requiredValues.every((value) => value.length > 0) && !status.loading;
  }, [form, status.loading]);

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    setStatus({ loading: true, success: "", server: "" });

    try {
      await registerUser({
        ...form,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
      });

      setStatus({
        loading: false,
        success: "Account created successfully. You can now sign in.",
        server: "",
      });
      setErrors({});
      setForm({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setErrors(error?.response?.data?.errors ?? {});

      setStatus({
        loading: false,
        success: "",
        server:
          error?.response?.data?.message ??
          "Unable to create account. Please try again.",
      });
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-b from-slate-50 via-white to-sky-50 px-3 py-8 text-slate-900 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-sky-200/55 blur-3xl sm:h-80 sm:w-80" />
      <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-indigo-200/45 blur-3xl sm:h-80 sm:w-80" />

      <section className="relative mx-auto grid w-full max-w-5xl gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.45)] backdrop-blur sm:gap-6 sm:p-6 lg:grid-cols-[1.05fr_1.2fr] lg:rounded-4xl">
        <aside className="relative hidden overflow-hidden rounded-3xl bg-linear-to-br from-slate-100 via-white to-slate-50 p-7 lg:flex lg:flex-col lg:justify-between">
          <img
            src="/logo.png"
            alt="logo"
            className="absolute -right-10 -top-6 scale-150 opacity-[0.04]"
          />

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
              BlockStone Printing
            </p>
            <h1 className="text-3xl font-black leading-tight text-slate-900">
              Create your workspace access
            </h1>
            <p className="text-sm text-slate-600">
              Register to coordinate operators, prioritize runs, and keep the
              production floor synced.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.35)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Secure by design
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-black text-emerald-600">
                <FiShield /> Passwords hashed server-side
              </p>
              <p className="text-xs text-slate-500">
                Session tokens rotate on refresh.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.35)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Ready for roles
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-black text-slate-800">
                <FiCheckCircle className="text-emerald-500" /> Default user role
                on sign-up
              </p>
              <p className="text-xs text-slate-500">
                Admins can upgrade later.
              </p>
            </div>
          </div>
        </aside>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.35)] sm:p-6"
        >
          <header className="mb-5 space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <FiUserPlus />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  New account
                </p>
                <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                  Register to continue
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-500 sm:text-sm">
              Fill in your details. We will not share your email with anyone.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                First name
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus-within:border-slate-900">
                <FiUser className="text-slate-500" />
                <input
                  name="first_name"
                  type="text"
                  value={form.first_name}
                  onChange={onFieldChange}
                  placeholder="First name"
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
              {errors.first_name ? (
                <p className="text-xs text-rose-600">{errors.first_name}</p>
              ) : null}
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Last name
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus-within:border-slate-900">
                <FiUser className="text-slate-500" />
                <input
                  name="last_name"
                  type="text"
                  value={form.last_name}
                  onChange={onFieldChange}
                  placeholder="Last name"
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
              {errors.last_name ? (
                <p className="text-xs text-rose-600">{errors.last_name}</p>
              ) : null}
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Username
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus-within:border-slate-900">
                <FiUserPlus className="text-slate-500" />
                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={onFieldChange}
                  placeholder="Username"
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
              {errors.username ? (
                <p className="text-xs text-rose-600">{errors.username}</p>
              ) : null}
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Email
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus-within:border-slate-900">
                <FiAtSign className="text-slate-500" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onFieldChange}
                  placeholder="Email"
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
              {errors.email ? (
                <p className="text-xs text-rose-600">{errors.email}</p>
              ) : null}
            </label>
          </div>

          <label className="mt-3 block space-y-1.5 text-sm">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Password
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus-within:border-slate-900">
              <FiLock className="text-slate-500" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={onFieldChange}
                placeholder="Minimum 8 characters"
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-slate-400 transition hover:text-slate-900"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password ? (
              <p className="text-xs text-rose-600">{errors.password}</p>
            ) : null}
          </label>

          {status.server ? (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {status.server}
            </p>
          ) : null}

          {status.success ? (
            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {status.success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status.loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default RegisterPage;

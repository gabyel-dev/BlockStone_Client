import { useMemo, useState } from "react";
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#10193f_0%,#080b19_40%,#05060f_100%)] px-4 py-10 text-slate-100 sm:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <div className="grid gap-8 rounded-3xl border border-cyan-300/20 bg-slate-900/60 p-6 shadow-[0_0_60px_rgba(12,74,110,0.25)] backdrop-blur-md md:grid-cols-[1fr_1.1fr] md:p-10">
          <aside className="relative overflow-hidden rounded-2xl border border-cyan-200/20 bg-gradient-to-b from-cyan-500/15 via-sky-500/10 to-blue-500/10 p-7">
            <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-300/30 blur-2xl" />
            <span className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-blue-400/20 blur-2xl" />

            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/30 bg-cyan-300/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-cyan-100">
                <FiShield />
                Secure onboarding
              </div>

              <h1 className="font-[Sora] text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Create your BlockStone account
              </h1>

              <p className="max-w-sm text-sm leading-relaxed text-cyan-50/80">
                Quick, clean registration for first-time users. Your password is
                hashed server-side and your account starts with a default user
                role.
              </p>

              <ul className="space-y-2 text-sm text-cyan-50/85">
                <li className="flex items-center gap-2">
                  <FiCheckCircle className="text-cyan-300" />
                  Simple entry-level form
                </li>
                <li className="flex items-center gap-2">
                  <FiCheckCircle className="text-cyan-300" />
                  Inline field validation
                </li>
                <li className="flex items-center gap-2">
                  <FiCheckCircle className="text-cyan-300" />
                  Connected to api.post register endpoint
                </li>
              </ul>
            </div>
          </aside>

          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-2xl border border-slate-700/60 bg-slate-950/70 p-6"
          >
            <h2 className="font-[Sora] text-xl font-semibold text-white">
              Register
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-300">
                  First name
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 transition focus-within:border-cyan-300/80">
                  <FiUser className="text-cyan-300" />
                  <input
                    name="first_name"
                    type="text"
                    value={form.first_name}
                    onChange={onFieldChange}
                    placeholder="First name"
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
                  />
                </div>
                {errors.first_name ? (
                  <p className="text-xs text-rose-300">{errors.first_name}</p>
                ) : null}
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-300">
                  Last name
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 transition focus-within:border-cyan-300/80">
                  <FiUser className="text-cyan-300" />
                  <input
                    name="last_name"
                    type="text"
                    value={form.last_name}
                    onChange={onFieldChange}
                    placeholder="Last name"
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
                  />
                </div>
                {errors.last_name ? (
                  <p className="text-xs text-rose-300">{errors.last_name}</p>
                ) : null}
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-300">
                  Username
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 transition focus-within:border-cyan-300/80">
                  <FiUserPlus className="text-cyan-300" />
                  <input
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={onFieldChange}
                    placeholder="Username"
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
                  />
                </div>
                {errors.username ? (
                  <p className="text-xs text-rose-300">{errors.username}</p>
                ) : null}
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-300">
                  Email
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 transition focus-within:border-cyan-300/80">
                  <FiAtSign className="text-cyan-300" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onFieldChange}
                    placeholder="Email"
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
                  />
                </div>
                {errors.email ? (
                  <p className="text-xs text-rose-300">{errors.email}</p>
                ) : null}
              </label>
            </div>

            <label className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-300">
                Password
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 transition focus-within:border-cyan-300/80">
                <FiLock className="text-cyan-300" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={onFieldChange}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-slate-300 transition hover:text-cyan-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-rose-300">{errors.password}</p>
              ) : null}
            </label>

            {status.server ? (
              <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                {status.server}
              </p>
            ) : null}

            {status.success ? (
              <p className="rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
                {status.success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status.loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default RegisterPage;

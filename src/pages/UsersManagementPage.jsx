import { useEffect, useMemo, useState } from "react";
import {
  FiLoader,
  FiMail,
  FiSearch,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { getUsers } from "../api/auth";

const USERS_CACHE_KEY = "users-management-cache-v1";

const readUsersCache = () => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(USERS_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.users) ? parsed.users : [];
  } catch {
    return [];
  }
};

const writeUsersCache = (users) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      USERS_CACHE_KEY,
      JSON.stringify({
        users,
        cachedAt: Date.now(),
      }),
    );
  } catch {
    // Keep UI functional when localStorage is unavailable.
  }
};

const UsersManagementPage = () => {
  const location = useLocation();
  const activeMenu = location.state?.menu || "Users Management";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const cachedUsers = readUsersCache();
    if (cachedUsers.length > 0) {
      setUsers(cachedUsers);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getUsers();
        const userList = response?.data?.data ?? [];

        if (isMounted) {
          setUsers(userList);
          writeUsersCache(userList);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load users. Please refresh and try again.");
          setUsers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const admins = users.filter(
      (entry) => String(entry?.role || "").toLowerCase() === "admin",
    ).length;
    const regularUsers = users.filter(
      (entry) => String(entry?.role || "").toLowerCase() !== "admin",
    ).length;

    return {
      total: users.length,
      admins,
      users: regularUsers,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return users.filter((entry) => {
      const role = String(entry?.role || "").toLowerCase();
      const isAdmin = role === "admin";
      const roleMatches =
        roleFilter === "all" ||
        (roleFilter === "admin" && isAdmin) ||
        (roleFilter === "user" && !isAdmin);

      const fullName = `${entry?.first_name || ""} ${entry?.last_name || ""}`
        .trim()
        .toLowerCase();
      const username = String(entry?.username || "").toLowerCase();
      const email = String(entry?.email || "").toLowerCase();

      const searchMatches =
        query.length === 0 ||
        fullName.includes(query) ||
        username.includes(query) ||
        email.includes(query);

      return roleMatches && searchMatches;
    });
  }, [users, roleFilter, searchText]);

  return (
    <main className="w-full py-7 text-slate-900">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            {activeMenu}
          </p>
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
            User Access Control
          </h1>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          {loading ? "Loading Users" : `${filteredUsers.length} visible users`}
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-linear-to-br from-slate-50 via-white to-sky-50 p-6 xl:col-span-8">
          <div className="absolute -right-14 -top-16 h-52 w-52 rounded-full bg-sky-200/45 blur-3xl" />

          <div className="relative">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
              Team Overview
            </p>
            <h2 className="text-2xl font-black text-slate-900">
              Manage user roles and quickly find team members.
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Total
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {stats.total}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Admins
                </p>
                <p className="mt-2 text-2xl font-black text-indigo-700">
                  {stats.admins}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Users
                </p>
                <p className="mt-2 text-2xl font-black text-emerald-700">
                  {stats.users}
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-[30px] border border-slate-200 bg-white p-6 xl:col-span-4">
          <h3 className="text-lg font-black text-slate-900">Filters</h3>

          <div className="mt-5 space-y-4">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search name, username, email"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
              <button
                onClick={() => setRoleFilter("all")}
                className={`rounded-lg px-2 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  roleFilter === "all"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRoleFilter("admin")}
                className={`rounded-lg px-2 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  roleFilter === "admin"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setRoleFilter("user")}
                className={`rounded-lg px-2 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  roleFilter === "user"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                User
              </button>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900">User Directory</h3>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Cached locally
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <FiLoader className="animate-spin" size={16} />
              Loading users...
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No users matched your filter and search.
              </div>
            ) : (
              filteredUsers.map((entry) => {
                const isAdmin =
                  String(entry?.role || "").toLowerCase() === "admin";

                return (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-slate-700">
                        {isAdmin ? (
                          <FiShield size={18} />
                        ) : (
                          <FiUser size={18} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">
                          {entry.first_name} {entry.last_name}
                        </p>
                        <p className="truncate text-xs font-medium text-slate-500">
                          @{entry.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                        <FiMail size={12} /> {entry.email}
                      </span>
                      <span
                        className={`rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                          isAdmin
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {isAdmin ? "Admin" : "User"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-[30px] border border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Access Control
            </p>
            <h3 className="text-xl font-black">Roles and search are live</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white">
            <FiUsers size={16} /> {filteredUsers.length} members displayed
          </div>
        </div>
      </section>
    </main>
  );
};

export default UsersManagementPage;

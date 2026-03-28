import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiLoader,
  FiMail,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { useLocation, useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { deleteUser, updateUserRole } from "../api/auth";
import ConfirmActionModal from "../components/common/ConfirmActionModal";
import { useUsersData } from "./users-management/hooks/useUsersData";
import { buildUserStats, filterUsers } from "./users-management/utils/metrics";

const UsersManagementPage = () => {
  const { user: currentUser } = useOutletContext();
  const location = useLocation();
  const activeMenu = location.state?.menu || "Users Management";

  const { users, loading, error, reloadUsers } = useUsersData();
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [confirmState, setConfirmState] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const motionSafe = (props) => (shouldReduceMotion ? {} : props);

  const handleConfirmAction = async () => {
    if (!confirmState) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (confirmState.type === "role") {
        await updateUserRole({
          id: confirmState.user.id,
          role: confirmState.nextRole,
        });
        toast.success(`Role updated to ${confirmState.nextRole}.`);
      }

      if (confirmState.type === "delete") {
        await deleteUser(confirmState.user.id);
        toast.success("User deleted.");
      }

      setConfirmState(null);
      await reloadUsers();
    } catch (requestError) {
      toast.error(
        requestError?.response?.data?.message ||
          "Unable to complete this action.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    return buildUserStats(users);
  }, [users]);

  const filteredUsers = useMemo(() => {
    return filterUsers({ users, roleFilter, searchText });
  }, [users, roleFilter, searchText]);

  return (
    <motion.main
      className="w-full py-7 text-slate-900 pr-6 pl-6 md:pl-0"
      {...motionSafe({
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
      })}
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            {activeMenu}
          </p>
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
            User Access Control
          </h1>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-12">
        <motion.div
          className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-linear-to-br from-slate-50 via-white to-sky-50 p-6 xl:col-span-8"
          {...motionSafe({
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.05 },
          })}
        >
          <div className="absolute hidden md:block -right-14 -top-16 h-52 w-52 rounded-full bg-sky-200/45 blur-3xl" />

          <div className="relative ">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
              Team Overview
            </p>
            <h2 className="text-2xl font-black text-slate-900">
              Manage user roles and quickly find team members.
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <motion.div
                {...motionSafe({
                  initial: { opacity: 0, y: 6 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.1 },
                })}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Total
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {stats.total}
                </p>
              </motion.div>
              <motion.div
                {...motionSafe({
                  initial: { opacity: 0, y: 6 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.15 },
                })}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Admins
                </p>
                <p className="mt-2 text-2xl font-black text-indigo-700">
                  {stats.admins}
                </p>
              </motion.div>
              <motion.div
                {...motionSafe({
                  initial: { opacity: 0, y: 6 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.2 },
                })}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Users
                </p>
                <p className="mt-2 text-2xl font-black text-emerald-700">
                  {stats.users}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.aside
          className="rounded-[30px] border border-slate-200 bg-white p-6 xl:col-span-4"
          {...motionSafe({
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.1 },
          })}
        >
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
        </motion.aside>
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
                  <motion.div
                    key={entry.id}
                    {...motionSafe({
                      initial: { opacity: 0, y: 6 },
                      animate: { opacity: 1, y: 0 },
                    })}
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

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmState({
                              type: "role",
                              user: entry,
                              nextRole: isAdmin ? "user" : "admin",
                            })
                          }
                          disabled={
                            String(currentUser?.id || "") ===
                            String(entry.id || "")
                          }
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isAdmin ? "Set User" : "Set Admin"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmState({
                              type: "delete",
                              user: entry,
                            })
                          }
                          disabled={
                            String(currentUser?.id || "") ===
                            String(entry.id || "")
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 transition hover:border-rose-400 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FiTrash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
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

      <ConfirmActionModal
        open={Boolean(confirmState)}
        title={
          confirmState?.type === "delete"
            ? "Delete user account?"
            : "Update user role?"
        }
        message={
          confirmState?.type === "delete"
            ? `This will permanently remove ${confirmState?.user?.first_name || "this user"}.`
            : `Change ${confirmState?.user?.first_name || "this user"} to ${confirmState?.nextRole}?`
        }
        confirmLabel={
          confirmState?.type === "delete" ? "Delete user" : "Update role"
        }
        confirmTone={confirmState?.type === "delete" ? "danger" : "primary"}
        isSubmitting={isSubmitting}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirmAction}
      />
    </motion.main>
  );
};

export default UsersManagementPage;

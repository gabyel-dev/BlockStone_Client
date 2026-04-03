import { useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  FiLoader,
  FiLock,
  FiPlus,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { useLocation, useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { deleteUser, registerUser, updateUserRole } from "../api/auth";
import ConfirmActionModal from "../components/common/ConfirmActionModal";
import { useMotionSafe } from "../hooks/useMotionSafe";
import { useOnlineUsers } from "./users-management/hooks/useOnlineUsers";
import { useUsersData } from "./users-management/hooks/useUsersData";
import { buildUserStats, filterUsers } from "./users-management/utils/metrics";

const INITIAL_ADD_USER_FORM = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
};

const UsersManagementPage = () => {
  const outletContext = useOutletContext() ?? {};
  const currentUser = outletContext?.user ?? null;
  const location = useLocation();
  const activeMenu = location.state?.menu || "Users Management";

  const { users, loading, error, reloadUsers } = useUsersData();
  const isCurrentUserAdmin =
    String(currentUser?.role || "").toLowerCase() === "admin";
  const { isUserOnline, onlineCount } = useOnlineUsers({
    enabled: isCurrentUserAdmin,
  });
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [confirmState, setConfirmState] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddUserSubmitting, setIsAddUserSubmitting] = useState(false);
  const [addUserForm, setAddUserForm] = useState(INITIAL_ADD_USER_FORM);
  const [addUserErrors, setAddUserErrors] = useState({});
  const [addUserServerError, setAddUserServerError] = useState("");
  const motionSafe = useMotionSafe();

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

  const onOpenAddUserModal = () => {
    setIsAddUserOpen(true);
    setAddUserErrors({});
    setAddUserServerError("");
  };

  const onCloseAddUserModal = () => {
    if (isAddUserSubmitting) {
      return;
    }

    setIsAddUserOpen(false);
    setAddUserForm(INITIAL_ADD_USER_FORM);
    setAddUserErrors({});
    setAddUserServerError("");
  };

  const onAddUserFieldChange = (event) => {
    const { name, value } = event.target;
    setAddUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const canSubmitAddUser =
    addUserForm.first_name.trim().length > 0 &&
    addUserForm.last_name.trim().length > 0 &&
    addUserForm.username.trim().length > 0 &&
    addUserForm.email.trim().length > 0 &&
    addUserForm.password.length >= 8;

  const onSubmitAddUser = async (event) => {
    event.preventDefault();

    if (!canSubmitAddUser) {
      return;
    }

    try {
      setIsAddUserSubmitting(true);
      setAddUserErrors({});
      setAddUserServerError("");

      await registerUser({
        first_name: addUserForm.first_name.trim(),
        last_name: addUserForm.last_name.trim(),
        username: addUserForm.username.trim(),
        email: addUserForm.email.trim().toLowerCase(),
        password: addUserForm.password,
      });

      toast.success("User account created.");
      onCloseAddUserModal();
      await reloadUsers();
    } catch (requestError) {
      setAddUserErrors(requestError?.response?.data?.errors ?? {});
      setAddUserServerError(
        requestError?.response?.data?.message ||
          "Unable to create user account.",
      );
    } finally {
      setIsAddUserSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return filterUsers({ users, roleFilter, searchText });
  }, [users, roleFilter, searchText]);

  return (
    <Motion.main
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
        <Motion.div
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
              <Motion.div
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
              </Motion.div>
              <Motion.div
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
              </Motion.div>
              <Motion.div
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
              </Motion.div>
            </div>
          </div>
        </Motion.div>

        <Motion.aside
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
        </Motion.aside>
      </section>

      <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900">User Directory</h3>
          <button
            type="button"
            onClick={onOpenAddUserModal}
            className="hidden md:inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            <FiPlus size={14} />
            Add User
          </button>
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
              filteredUsers.filter(Boolean).map((entry) => {
                const isAdmin =
                  String(entry?.role || "").toLowerCase() === "admin";
                const online = isUserOnline(entry.id);

                return (
                  <Motion.div
                    key={entry.id}
                    {...motionSafe({
                      initial: { opacity: 0, y: 6 },
                      animate: { opacity: 1, y: 0 },
                    })}
                    className="flex flex-col md:flex-row items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
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

                    <div className="flex  items-end justify-end w-full gap-2">
                      <span
                        className={`rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                          online
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {online ? "Online" : "Offline"}
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
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </Motion.div>
                );
              })
            )}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-[30px] border border-slate-200 bg-slate-900 bg-linear-to-r from-slate-900 to-slate-800 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Access Control
            </p>
            <h3 className="text-xl font-black">Roles and search are live</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white">
            <FiUsers size={16} /> {filteredUsers.length} members displayed
            {isCurrentUserAdmin ? ` · ${onlineCount} online` : ""}
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

      {isAddUserOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/50 p-4">
          <Motion.div
            className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
            {...motionSafe({
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
            })}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Users Management
                </p>
                <h3 className="text-lg font-black text-slate-900">Add User</h3>
              </div>

              <button
                type="button"
                onClick={onCloseAddUserModal}
                disabled={isAddUserSubmitting}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>
            </div>

            {addUserServerError ? (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {addUserServerError}
              </div>
            ) : null}

            <form className="space-y-3" onSubmit={onSubmitAddUser}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  First name
                  <input
                    name="first_name"
                    value={addUserForm.first_name}
                    onChange={onAddUserFieldChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                    placeholder="Juan"
                  />
                  {addUserErrors?.first_name ? (
                    <span className="mt-1 block text-xs text-rose-600">
                      {addUserErrors.first_name}
                    </span>
                  ) : null}
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Last name
                  <input
                    name="last_name"
                    value={addUserForm.last_name}
                    onChange={onAddUserFieldChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                    placeholder="Dela Cruz"
                  />
                  {addUserErrors?.last_name ? (
                    <span className="mt-1 block text-xs text-rose-600">
                      {addUserErrors.last_name}
                    </span>
                  ) : null}
                </label>
              </div>

              <label className="text-sm font-semibold text-slate-700">
                Username
                <input
                  name="username"
                  value={addUserForm.username}
                  onChange={onAddUserFieldChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                  placeholder="juan.delacruz"
                />
                {addUserErrors?.username ? (
                  <span className="mt-1 block text-xs text-rose-600">
                    {addUserErrors.username}
                  </span>
                ) : null}
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Email
                <input
                  type="email"
                  name="email"
                  value={addUserForm.email}
                  onChange={onAddUserFieldChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                  placeholder="juan@email.com"
                />
                {addUserErrors?.email ? (
                  <span className="mt-1 block text-xs text-rose-600">
                    {addUserErrors.email}
                  </span>
                ) : null}
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Password
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 focus-within:border-slate-900">
                  <FiLock className="shrink-0 text-slate-400" size={15} />
                  <input
                    type="password"
                    name="password"
                    value={addUserForm.password}
                    onChange={onAddUserFieldChange}
                    className="w-full text-sm outline-none"
                    placeholder="Minimum 8 characters"
                  />
                </div>
                {addUserErrors?.password ? (
                  <span className="mt-1 block text-xs text-rose-600">
                    {addUserErrors.password}
                  </span>
                ) : null}
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!canSubmitAddUser || isAddUserSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAddUserSubmitting ? (
                    <>
                      <FiLoader className="animate-spin" size={14} />
                      Creating account...
                    </>
                  ) : (
                    "Create user"
                  )}
                </button>
              </div>
            </form>
          </Motion.div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onOpenAddUserModal}
        className="fixed bottom-24 right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-slate-900 text-white shadow-[0_14px_30px_-16px_rgba(15,23,42,0.65)] transition hover:bg-slate-700 md:hidden"
        aria-label="Add user"
      >
        <FiPlus size={20} />
      </button>
    </Motion.main>
  );
};

export default UsersManagementPage;

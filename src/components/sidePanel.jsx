import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MdAttachMoney,
  MdDashboard,
  MdInventory,
  MdKeyboardArrowUp,
  MdLogout,
  MdPrint,
  MdSettings,
} from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import { logoutUser } from "../api/auth";
import LogoutModal from "./logoutModal";

const SidePanel = ({ user }) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <MdDashboard size={20} /> },
    { name: "POS", path: "/pos", icon: <MdPrint size={20} /> },
    { name: "Sales", path: "/sales", icon: <MdAttachMoney size={20} /> },
    { name: "Users Management", path: "/users", icon: <FaUsers size={20} /> },
    { name: "Inventory", path: "/inventory", icon: <MdInventory size={20} /> },
  ];

  const mobileNavItems = navItems.filter(
    (item) => item.name !== "Users Management",
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logoutUser();
    } catch {
      await logoutUser();
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
    window.dispatchEvent(new Event("auth:changed"));
    navigate("/login", { replace: true });
    setIsLoggingOut(false);
  };

  return (
    <>
      {isLoggingOut ? (
        <div className="fixed inset-0 z-120 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px]">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-lg">
            Logging out...
          </div>
        </div>
      ) : null}

      {isOpen && (
        <LogoutModal
          onClose={setIsOpen}
          handleLogout={handleLogout}
          loggingOut={isLoggingOut}
        />
      )}

      <div className="relative hidden lg:block">
        <aside
          className={`sticky top-6 mx-5 flex h-fit min-w-72 flex-col justify-between overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)] ${
            isLoggingOut ? "pointer-events-none" : ""
          }`}
        >
          <div>
            <div className="border-b border-slate-200 bg-linear-to-br from-slate-50 via-white to-sky-50 p-6">
              <div className="flex items-center gap-4">
                <img
                  src="https://cdn.vectorstock.com/i/500p/43/97/default-avatar-photo-placeholder-icon-grey-vector-38594397.jpg"
                  alt="profile"
                  className="h-12 w-12 rounded-full border-2 border-slate-900 object-cover"
                />

                <div className="flex min-w-0 flex-col">
                  <h2 className="truncate text-sm font-black tracking-tight text-slate-900">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {user?.role || "Production"}
                  </p>
                </div>
              </div>
            </div>

            <nav className="p-4">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Main
              </p>

              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  state={{ menu: item.name }}
                  className={({ isActive }) =>
                    `group mb-1.5 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-[0_12px_22px_-16px_rgba(15,23,42,0.9)]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500 group-hover:bg-white"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="border-t border-slate-200 p-4">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Workspace
            </p>

            <button className="mb-1.5 cursor-pointer  flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500">
                <MdSettings size={18} />
              </span>
              Settings
            </button>

            <button
              onClick={() => setIsOpen(true)}
              className="flex cursor-pointer  w-full outline-none items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-100 text-rose-500">
                <MdLogout size={18} />
              </span>
              Logout
            </button>
          </div>
        </aside>
      </div>

      <nav
        className={`fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_18px_34px_-20px_rgba(15,23,42,0.55)] backdrop-blur lg:hidden ${
          isLoggingOut ? "pointer-events-none" : ""
        }`}
      >
        <div className="grid grid-cols-5 items-end gap-1">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              state={{ menu: item.name }}
              className={({ isActive }) =>
                `group flex min-h-15 flex-col items-center justify-center rounded-xl px-1 py-2 text-[11px] font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-lg transition ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-white"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="mt-1 truncate text-[10px] leading-tight">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          <div ref={profileMenuRef} className="relative flex justify-center">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="group flex min-h-15 w-full flex-col items-center justify-center rounded-xl px-1 py-2 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <span className="relative">
                <img
                  src="https://cdn.vectorstock.com/i/500p/43/97/default-avatar-photo-placeholder-icon-grey-vector-38594397.jpg"
                  alt="profile"
                  className="h-7 w-7 rounded-full border border-slate-300 object-cover"
                />
                <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-slate-100 text-slate-600">
                  <MdKeyboardArrowUp
                    size={12}
                    className={
                      isProfileMenuOpen ? "rotate-180 transition" : "transition"
                    }
                  />
                </span>
              </span>
              <span className="mt-1 truncate text-[10px] leading-tight">
                Profile
              </span>
            </button>

            {isProfileMenuOpen ? (
              <div className="absolute bottom-17 right-0 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.55)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate("/users", { state: { menu: "Users Management" } });
                  }}
                  className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <FaUsers size={14} />
                  View Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                  }}
                  className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <MdSettings size={14} />
                  Settings
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setIsProfileMenuOpen(false);
                    setIsOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                >
                  <MdLogout size={14} />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </nav>
    </>
  );
};

export default SidePanel;

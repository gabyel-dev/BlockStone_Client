import { NavLink } from "react-router-dom";
import { FaUsers } from "react-icons/fa6";
import { MdKeyboardArrowUp, MdLogout, MdSettings } from "react-icons/md";
import { PROFILE_IMAGE_URL } from "./config";

const MobileSidePanel = ({
  navigate,
  mobileNavItems,
  inventorySubItems,
  isLoggingOut,
  isInventoryActive,
  isStocksActive,
  isServicesActive,
  isMobileInventoryMenuOpen,
  profileMenuRef,
  isProfileMenuOpen,
  setIsProfileMenuOpen,
  setIsMobileInventoryMenuOpen,
  onOpenLogout,
}) => {
  return (
    <nav
      className={`fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-slate-100 p-2 shadow-[0_18px_34px_-20px_rgba(15,23,42,0.55)] backdrop-blur lg:hidden bg-black/40 ${
        isLoggingOut ? "pointer-events-none" : ""
      }`}
    >
      <div className="grid grid-cols-5 items-end gap-1">
        {mobileNavItems.map((item) => {
          if (item.name === "Inventory") {
            return (
              <div key={item.name} className="relative flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsMobileInventoryMenuOpen((prev) => !prev)}
                  className={`group flex min-h-15 w-full flex-col items-center justify-center rounded-xl px-1 py-2 text-[11px] font-semibold transition-all duration-150 ${
                    isInventoryActive || isMobileInventoryMenuOpen
                      ? "bg-slate-900/30 text-white backdrop-blur-2xl"
                      : "text-slate-100 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg transition">
                    <item.Icon size={20} />
                  </span>
                  <MdKeyboardArrowUp
                    size={12}
                    className={`mt-0.5 transition ${
                      isMobileInventoryMenuOpen ? "rotate-0" : "rotate-180"
                    }`}
                  />
                </button>

                {isMobileInventoryMenuOpen ? (
                  <div className="absolute bottom-17 left-1/2 w-36 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.55)]">
                    {inventorySubItems.map((subItem) => {
                      const isSubActive =
                        subItem.name === "Stocks"
                          ? isStocksActive
                          : isServicesActive;

                      return (
                        <button
                          key={subItem.name}
                          type="button"
                          onClick={() => {
                            setIsMobileInventoryMenuOpen(false);
                            navigate(subItem.path, { state: subItem.state });
                          }}
                          className={`mb-1 last:mb-0 flex w-full items-center justify-start rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                            isSubActive
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          {subItem.name}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              state={{ menu: item.name }}
              onClick={() => setIsMobileInventoryMenuOpen(false)}
              className={({ isActive }) =>
                `group flex min-h-15 flex-col items-center justify-center rounded-xl px-1 py-2 text-[11px] font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-slate-900/30 text-white backdrop-blur-2xl"
                    : "text-slate-100 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg transition">
                <item.Icon size={20} />
              </span>
            </NavLink>
          );
        })}

        <div ref={profileMenuRef} className="relative flex justify-center">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="group flex min-h-15 w-full flex-col items-center justify-center rounded-xl px-1 py-2 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <span className="relative">
              <img
                src={PROFILE_IMAGE_URL}
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
          </button>

          {isProfileMenuOpen ? (
            <div className="absolute bottom-17 right-0 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.55)]">
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsMobileInventoryMenuOpen(false);
                  navigate("/users", { state: { menu: "Users Management" } });
                }}
                className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <FaUsers size={14} />
                Manage users
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsMobileInventoryMenuOpen(false);
                  navigate("/settings", { state: { menu: "Settings" } });
                }}
                className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <MdSettings size={14} />
                Settings
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsMobileInventoryMenuOpen(false);
                  onOpenLogout();
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
  );
};

export default MobileSidePanel;

import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  MdInventory,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdKeyboardArrowUp,
  MdLogout,
  MdSettings,
} from "react-icons/md";
import { PROFILE_IMAGE_URL } from "./config";

const DesktopSidePanel = ({
  user,
  isLoggingOut,
  mainNavItems,
  inventorySubItems,
  isInventoryActive,
  isStocksActive,
  isServicesActive,
  isInventoryMenuOpen,
  onInventoryMouseEnter,
  onInventoryMouseLeave,
  onToggleInventoryPin,
  onOpenLogout,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCollapsedInventoryMenuOpen, setIsCollapsedInventoryMenuOpen] =
    useState(false);
  const inventoryFlyoutRef = useRef(null);

  useEffect(() => {
    if (!isCollapsed || !isCollapsedInventoryMenuOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (
        inventoryFlyoutRef.current &&
        !inventoryFlyoutRef.current.contains(event.target)
      ) {
        setIsCollapsedInventoryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCollapsed, isCollapsedInventoryMenuOpen]);

  return (
    <div className="relative hidden lg:block">
      <aside
        className={`sticky top-6 z-70 mx-5 flex h-fit flex-col justify-between rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)] transition-[width,min-width] duration-200 ${
          isCollapsed
            ? "w-24 min-w-24 overflow-visible"
            : "w-72 min-w-72 overflow-hidden"
        } ${isLoggingOut ? "pointer-events-none" : ""}`}
      >
        <div>
          <div className="relative border-b border-slate-200 bg-linear-to-br from-slate-50 via-white to-sky-50 p-6">
            <button
              type="button"
              onClick={() => {
                setIsCollapsed((prev) => !prev);
                setIsCollapsedInventoryMenuOpen(false);
              }}
              className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <MdKeyboardDoubleArrowRight size={16} />
              ) : (
                <MdKeyboardDoubleArrowLeft size={16} />
              )}
            </button>

            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "gap-4"
              }`}
            >
              <img
                src={PROFILE_IMAGE_URL}
                alt="profile"
                className="h-12 w-12 rounded-full border-2 border-slate-900 object-cover"
              />

              {!isCollapsed ? (
                <div className="flex min-w-0 flex-col">
                  <h2 className="truncate text-sm font-black tracking-tight text-slate-900">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {user?.role || "Production"}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <nav className="p-4">
            {!isCollapsed ? (
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Main
              </p>
            ) : null}

            {mainNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                state={{ menu: item.name }}
                title={item.name}
                className={({ isActive }) =>
                  `group mb-1.5 flex w-full items-center rounded-xl py-3 text-sm font-semibold transition-all duration-150 ${
                    isCollapsed ? "justify-center px-2" : "gap-3 px-3"
                  } ${
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
                      <item.Icon size={20} />
                    </span>
                    {!isCollapsed ? (
                      <span className="truncate">{item.name}</span>
                    ) : null}
                  </>
                )}
              </NavLink>
            ))}

            <div
              ref={inventoryFlyoutRef}
              className="relative mt-2"
              onMouseEnter={() => {
                if (!isCollapsed) {
                  onInventoryMouseEnter();
                }
              }}
              onMouseLeave={() => {
                if (!isCollapsed) {
                  onInventoryMouseLeave();
                }
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (isCollapsed) {
                    setIsCollapsedInventoryMenuOpen((prev) => !prev);
                    return;
                  }

                  onToggleInventoryPin();
                }}
                title="Inventory"
                className={`group flex w-full items-center rounded-xl py-3 text-sm font-semibold transition-all duration-150 ${
                  isCollapsed ? "justify-center px-2" : "gap-3 px-3"
                } ${
                  isInventoryActive
                    ? "bg-slate-900 text-white shadow-[0_12px_22px_-16px_rgba(15,23,42,0.9)]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                    isInventoryActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-white"
                  }`}
                >
                  <MdInventory size={20} />
                </span>
                {!isCollapsed ? (
                  <span className="truncate">Inventory</span>
                ) : null}
                {!isCollapsed ? (
                  <MdKeyboardArrowUp
                    size={16}
                    className={`ml-auto transition ${
                      isInventoryMenuOpen ? "rotate-0" : "rotate-180"
                    }`}
                  />
                ) : null}
              </button>

              {!isCollapsed && isInventoryMenuOpen ? (
                <div className="mt-1 ml-10 grid gap-1">
                  {inventorySubItems.map((subItem) => {
                    const isSubActive =
                      subItem.name === "Stocks"
                        ? isStocksActive
                        : isServicesActive;

                    return (
                      <NavLink
                        key={subItem.name}
                        to={subItem.path}
                        state={subItem.state}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold tracking-[0.02em] transition ${
                          isSubActive
                            ? "bg-slate-900 text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {subItem.name}
                      </NavLink>
                    );
                  })}
                </div>
              ) : null}

              {isCollapsed && isCollapsedInventoryMenuOpen ? (
                <div className="absolute top-0 left-full z-120 ml-2 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.55)]">
                  {inventorySubItems.map((subItem) => {
                    const isSubActive =
                      subItem.name === "Stocks"
                        ? isStocksActive
                        : isServicesActive;

                    return (
                      <NavLink
                        key={subItem.name}
                        to={subItem.path}
                        state={subItem.state}
                        onClick={() => setIsCollapsedInventoryMenuOpen(false)}
                        className={`mb-1 last:mb-0 flex w-full items-center justify-start rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                          isSubActive
                            ? "bg-slate-900 text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {subItem.name}
                      </NavLink>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </nav>
        </div>

        <div className="border-t border-slate-200 p-4">
          {!isCollapsed ? (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Workspace
            </p>
          ) : null}

          <NavLink
            to="/settings"
            state={{ menu: "Settings" }}
            title="Settings"
            className={({ isActive }) =>
              `mb-1.5 flex w-full items-center rounded-xl py-3 text-sm font-semibold transition ${
                isCollapsed ? "justify-center px-2" : "gap-3 px-3"
              } ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <MdSettings size={18} />
                </span>
                {!isCollapsed ? "Settings" : null}
              </>
            )}
          </NavLink>

          <button
            onClick={onOpenLogout}
            title="Logout"
            className={`flex w-full cursor-pointer items-center rounded-xl py-3 text-sm font-semibold text-rose-600 outline-none transition hover:bg-rose-50 hover:text-rose-700 ${
              isCollapsed ? "justify-center px-2" : "gap-3 px-3"
            }`}
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-100 text-rose-500">
              <MdLogout size={18} />
            </span>
            {!isCollapsed ? "Logout" : null}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default DesktopSidePanel;

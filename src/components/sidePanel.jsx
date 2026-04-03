import { useLocation, useNavigate } from "react-router-dom";
import LogoutModal from "./logoutModal";
import DesktopSidePanel from "./side-panel/DesktopSidePanel";
import MobileSidePanel from "./side-panel/MobileSidePanel";
import {
  INVENTORY_SUB_ITEMS,
  MAIN_NAV_ITEMS,
  MOBILE_NAV_ITEMS,
} from "./side-panel/config";
import { useSidePanelState } from "./side-panel/useSidePanelState";

const SidePanel = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    profileMenuRef,
    isLoggingOut,
    isProfileMenuOpen,
    isLogoutModalOpen,
    isMobileInventoryMenuOpen,
    isInventoryMenuOpen,
    isInventoryActive,
    isStocksActive,
    isServicesActive,
    setIsProfileMenuOpen,
    setIsLogoutModalOpen,
    setIsInventoryMenuPinned,
    setIsInventoryMenuHovered,
    setIsMobileInventoryMenuOpen,
    handleLogout,
  } = useSidePanelState({ location, navigate });

  return (
    <>
      {isLoggingOut ? (
        <div className="fixed inset-0 z-120 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px]">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-lg">
            Logging out...
          </div>
        </div>
      ) : null}

      {isLogoutModalOpen ? (
        <LogoutModal
          onClose={setIsLogoutModalOpen}
          handleLogout={handleLogout}
          loggingOut={isLoggingOut}
        />
      ) : null}

      <DesktopSidePanel
        user={user}
        isLoggingOut={isLoggingOut}
        mainNavItems={MAIN_NAV_ITEMS}
        inventorySubItems={INVENTORY_SUB_ITEMS}
        isInventoryActive={isInventoryActive}
        isStocksActive={isStocksActive}
        isServicesActive={isServicesActive}
        isInventoryMenuOpen={isInventoryMenuOpen}
        onInventoryMouseEnter={() => setIsInventoryMenuHovered(true)}
        onInventoryMouseLeave={() => setIsInventoryMenuHovered(false)}
        onToggleInventoryPin={() => setIsInventoryMenuPinned((prev) => !prev)}
        onOpenLogout={() => setIsLogoutModalOpen(true)}
      />

      <MobileSidePanel
        navigate={navigate}
        mobileNavItems={MOBILE_NAV_ITEMS}
        inventorySubItems={INVENTORY_SUB_ITEMS}
        isLoggingOut={isLoggingOut}
        isInventoryActive={isInventoryActive}
        isStocksActive={isStocksActive}
        isServicesActive={isServicesActive}
        isMobileInventoryMenuOpen={isMobileInventoryMenuOpen}
        profileMenuRef={profileMenuRef}
        isProfileMenuOpen={isProfileMenuOpen}
        setIsProfileMenuOpen={setIsProfileMenuOpen}
        setIsMobileInventoryMenuOpen={setIsMobileInventoryMenuOpen}
        onOpenLogout={() => setIsLogoutModalOpen(true)}
      />
    </>
  );
};

export default SidePanel;

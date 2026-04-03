import { useEffect, useRef, useState } from "react";
import { logoutUser } from "../../api/auth";

export const useSidePanelState = ({ location, navigate }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isInventoryMenuPinned, setIsInventoryMenuPinned] = useState(false);
  const [isInventoryMenuHovered, setIsInventoryMenuHovered] = useState(false);
  const [isMobileInventoryMenuOpen, setIsMobileInventoryMenuOpen] =
    useState(false);
  const profileMenuRef = useRef(null);

  const isInventoryRoute = location.pathname === "/inventory";
  const activeInventoryView = String(location.state?.inventoryView || "Stocks");
  const isStocksActive = isInventoryRoute && activeInventoryView !== "Services";
  const isServicesActive =
    isInventoryRoute && activeInventoryView === "Services";
  const isInventoryActive = isStocksActive || isServicesActive;

  const isInventoryMenuOpen =
    isInventoryActive || isInventoryMenuPinned || isInventoryMenuHovered;

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
    setIsLogoutModalOpen(false);
  };

  return {
    profileMenuRef,
    isLoggingOut,
    isProfileMenuOpen,
    isLogoutModalOpen,
    isInventoryMenuPinned,
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
  };
};

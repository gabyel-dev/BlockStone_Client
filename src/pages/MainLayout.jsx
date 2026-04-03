import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import ClientExperienceLayer from "../components/common/ClientExperienceLayer";
import AiAssistantDock from "../components/dashboard/AiAssistantDock";
import { useAuth } from "../context/authContext";
import { readUserSettings } from "../utils/userSettings";
import SidePanel from "../components/sidePanel";

const MotionDiv = motion.div;

const MainLayout = () => {
  const { authUser, loading } = useAuth();
  const location = useLocation();
  const userId = authUser?.id || "guest";
  const canUseAi = String(authUser?.role || "").toLowerCase() === "admin";
  const [userSettings, setUserSettings] = useState(() =>
    readUserSettings(userId),
  );

  useEffect(() => {
    setUserSettings(readUserSettings(userId));
  }, [userId]);

  useEffect(() => {
    const handleSettingsChanged = (event) => {
      const changedUserId = String(event?.detail?.userId || "guest");
      if (changedUserId !== String(userId)) {
        return;
      }

      setUserSettings(event?.detail?.settings || readUserSettings(userId));
    };

    const handleStorage = () => {
      setUserSettings(readUserSettings(userId));
    };

    window.addEventListener("app:settings-changed", handleSettingsChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("app:settings-changed", handleSettingsChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, [userId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 text-slate-900">
        <p>Loading...</p>
      </main>
    );
  }

  if (!authUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-slate-900">
        <p className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-rose-700">
          No user data found
        </p>
      </main>
    );
  }

  return (
    <main
      className={`relative min-h-screen overflow-x-hidden bg-white pb-24 text-slate-900 ${
        userSettings.highContrastMode ? "contrast-110 saturate-110" : ""
      } ${
        userSettings.largeTouchTargets
          ? "[&_button]:min-h-11 [&_a[role='button']]:min-h-11 [&_input]:min-h-11 [&_select]:min-h-11"
          : ""
      }`}
    >
      <div className="flex gap-4 lg:gap-6">
        <SidePanel user={authUser} />
        <section
          className={`w-full leading-relaxed ${
            userSettings.compactDensity
              ? "text-[14px] lg:text-[15px]"
              : "text-[15px] lg:text-base"
          }`}
        >
          {/*
            Outlet is the placeholder for the active child route (/dashboard, /users, etc.).
            React Router swaps only this section when the route changes, so the layout stays mounted.
            Because navigation is handled client-side, the app updates view state without a hard reload.
          */}
          <AnimatePresence mode="wait" initial={false}>
            <MotionDiv
              key={location.pathname}
              initial={
                userSettings.enablePageTransitions
                  ? { opacity: 0, y: 6 }
                  : false
              }
              animate={{ opacity: 1, y: 0 }}
              exit={
                userSettings.enablePageTransitions
                  ? { opacity: 0, y: -4 }
                  : { opacity: 1, y: 0 }
              }
              transition={
                userSettings.enablePageTransitions
                  ? { duration: 0.22, ease: "easeOut" }
                  : { duration: 0 }
              }
            >
              <Outlet context={{ user: authUser }} />
            </MotionDiv>
          </AnimatePresence>
        </section>
      </div>

      <ClientExperienceLayer user={authUser} />
      {canUseAi ? <AiAssistantDock user={authUser} /> : null}
    </main>
  );
};

export default MainLayout;

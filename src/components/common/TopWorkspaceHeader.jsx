import { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import { PROFILE_IMAGE_URL } from "../side-panel/config";

const TopWorkspaceHeader = ({ user }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 mb-3 px-3 py-2 sm:mb-4 sm:px-4 sm:py-3">
      <div className="flex items-center justify-between">
        <img
          src="/logo.png"
          alt="BlockStone logo"
          className="h-8 w-auto sm:h-9"
        />

        <div className="relative flex items-center gap-2" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationOpen((open) => !open)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            aria-label="Open notifications"
          >
            <FiBell size={17} />
          </button>

          <img
            src={user?.profile_image_url || PROFILE_IMAGE_URL}
            alt="Profile"
            className="h-10 w-10 rounded-full border-2 border-slate-200 object-cover"
          />

          {isNotificationOpen ? (
            <div className="absolute right-0 top-12 z-40 w-[min(90vw,280px)] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.5)]">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Notifications
              </p>
              <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600">
                No new notifications right now.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default TopWorkspaceHeader;

import { useEffect } from "react";

export default function LogoutModal({ onClose, handleLogout, loggingOut }) {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") onClose(false);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onClose]);
  return (
    <div className="__logout_modal__ fixed z-50 w-full bg-black/40  backdrop-blur-[1px] h-screen flex items-center justify-center">
      <div className="w-fit  px-6 py-8 mx-4 bg-white rounded-3xl">
        <img src="/logout.svg" alt="logout" />
        <h1 className="text-center text-red-600 font-bold pb-3 text-xl pt-4">
          Sign out?
        </h1>
        <p className="pb-5 text-xs text-gray-500 text-center">
          Are you sure you would like to exit blockstone?
        </p>
        <section className="sm:flex flex-col sm:flex-row items-center flex justify-between w-full gap-2">
          <button
            onClick={() => onClose(false)}
            className="px-6 text-slate-600  py-2 w-full rounded-xl border-1 font-bold border-slate-300 hover:border-red-500 hover:text-red-500 transition-colors duration-100 cursor-pointer "
          >
            cancel
          </button>
          <button
            onClick={() => handleLogout()}
            className="px-8 py-3 flex items-center font-bold justify-center w-full rounded-xl bg-red-600 hover:bg-red-700 transition-colors duration-100 text-white cursor-pointer "
          >
            {loggingOut ? (
              <span className="inline-block  w-5 h-5 border-2 border-white border-t-transparent border-b-transparent rounded-full animate-spin "></span>
            ) : (
              "confirm"
            )}
          </button>
        </section>
      </div>
    </div>
  );
}

import { Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";
import SidePanel from "../components/sidePanel";

const MainLayout = () => {
  const { authUser, loading } = useAuth();

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
    <main className="min-h-screen bg-white  pb-24  text-slate-900 ">
      <div className="flex gap-4 lg:gap-6">
        <SidePanel user={authUser} />
        <section className="w-full text-[15px] leading-relaxed lg:text-base">
          {/*
            Outlet is the placeholder for the active child route (/dashboard, /users, etc.).
            React Router swaps only this section when the route changes, so the layout stays mounted.
            Because navigation is handled client-side, the app updates view state without a hard reload.
          */}
          <Outlet context={{ user: authUser }} />
        </section>
      </div>
    </main>
  );
};

export default MainLayout;

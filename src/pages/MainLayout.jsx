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
          <Outlet context={{ user: authUser }} />
        </section>
      </div>
    </main>
  );
};

export default MainLayout;

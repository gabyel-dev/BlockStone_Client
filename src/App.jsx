import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/login";
import DashboardPage from "./pages/DashboardPage";
import PosPage from "./pages/pos/PosPage";
import SalesPage from "./pages/SalesPage";
import UsersManagementPage from "./pages/UsersManagementPage";
import InventoryPage from "./pages/InventoryPage";
import SettingsPage from "./pages/SettingsPage";
import MainLayout from "./pages/MainLayout";
import { GuestOnly, RequireAuth } from "./context/authContext";

const DataPlaceholder = () => {
  const { id } = useParams();
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Data ID
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{id}</h1>
        <p className="mt-4 text-sm text-slate-400">
          Placeholder view for dynamic data route.
        </p>
      </div>
    </main>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/users" element={<UsersManagementPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="/data/:id" element={<DataPlaceholder />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
